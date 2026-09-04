# Registro de Cambios y Decisiones de Diseño (CHANGELOG)

Este documento registra el historial de cambios, refactorizaciones y, fundamentalmente, **las decisiones de diseño tomadas intencionadamente**. 

> [!IMPORTANT]
> **Lectura obligatoria antes de proponer mejoras generales**:
> Cualquier agente de IA o desarrollador que proponga o implemente cambios generales en la arquitectura, almacenamiento o componentes de la app **DEBE consultar este archivo primero** para evitar modificar o deshacer soluciones que se implementaron deliberadamente por diseño.

---

## [Refactorización P0 - P3] - Septiembre 2026

### Añadido
- **Tipado completo de React**: Incorporados `@types/react` y `@types/react-dom` a `devDependencies`.
- **Suite de pruebas unitarias para autoguardado**: [`src/services/autosaveService.test.ts`](src/services/autosaveService.test.ts) validando el debounce de 3 segundos, `flushImmediate`, suscripción de estados y emisión del evento `krnl_storage_synced`.
- **Subcomponentes modulares**:
  - `CustomModuleView`: extraídos [`CustomModuleItemDrawer.tsx`](src/components/CustomModuleItemDrawer.tsx) y [`CustomModuleItemEditor.tsx`](src/components/CustomModuleItemEditor.tsx).
  - `WorldbuildingCustomizerModal`: extraídos [`CustomizerScenariosTab.tsx`](src/components/CustomizerScenariosTab.tsx), [`CustomizerModulesTab.tsx`](src/components/CustomizerModulesTab.tsx), [`CustomizerSectionsTab.tsx`](src/components/CustomizerSectionsTab.tsx) y [`CustomizerCustomTab.tsx`](src/components/CustomizerCustomTab.tsx).
  - `StorageSyncModal`: extraídos [`SyncOverviewTab.tsx`](src/components/SyncOverviewTab.tsx), [`SyncLocalTab.tsx`](src/components/SyncLocalTab.tsx), [`SyncDriveTab.tsx`](src/components/SyncDriveTab.tsx) y [`SyncBrowserTab.tsx`](src/components/SyncBrowserTab.tsx).
- **Validador `isObject`**: Añadido a [`src/utils/safeStorage.ts`](src/utils/safeStorage.ts) para validación de estructuras no matriciales.

### Cambiado
- **Desacoplamiento de Género en Backend (P1)**:
  - Los endpoints `/api/audit-coherence` y `/api/generate-lore-item` en [`server.ts`](server.ts) ahora aceptan opcionalmente `genreId` y `systemInstruction` enviados por el cliente.
  - *Decisión de diseño*: No hardcodear la cosmología de física de Planck o ciencia ficción en el servidor; la app soporta múltiples géneros (Fantasía Épica, Cyberpunk, Grimdark, etc.) parametrizados desde el frontend.
- **Unificación de persistencia en servicios secundarios (P3)**:
  - [`userCustomModuleService.ts`](src/services/userCustomModuleService.ts), [`moduleConfigService.ts`](src/services/moduleConfigService.ts) y [`genrePresetService.ts`](src/services/genrePresetService.ts) migrados a `readJSON` / `writeJSON` de [`safeStorage.ts`](src/utils/safeStorage.ts).
  - *Decisión de diseño*: Nunca acceder a `localStorage` de forma no controlada con `try { JSON.parse() } catch (e) {}`. Si un valor se corrompe, debe respaldarse en clave de backup, emitir `krnl_storage_corrupted` y avisar en la UI sin borrar datos.
- **Unificación del estado de Lore en `LoreGeneratorView`**:
  - Consume directamente `loreItems` y `setLoreItems` desde [`NovelDataContext`](src/store/NovelDataContext.tsx), eliminando el estado local duplicado que requería recargas.

### Corregido
- **Crash de `CustomModuleView`**: Corregida la prop `moduleId?: string` para resolver dinámicamente el módulo activo mediante el hook `useUserCustomModules()`, proporcionando interfaz de fallback limpia si el ID no existe.
- **Inconsistencias de TypeScript**:
  - Propiedad opcional `connectedLinks?: StoryGraphLink[]` en `StoryGraphNode` ([`src/types.ts`](src/types.ts)).
  - Corrección de `matchedSyscall.category` en [`EntityCardModal.tsx`](src/components/EntityCardModal.tsx).
  - Normalización de comparación de estado `c.status === 'CANON'` en [`NovelOverviewHub.tsx`](src/components/NovelOverviewHub.tsx).

---

## [Refactorización de Arquitectura y Persistencia] - Septiembre 2026

### Decisiones de Diseño Fundamentales (NO ALTERAR SIN MOTIVO FUNDADO)

1. **Persistencia Centralizada Segura**:
   - Todo dato de usuario pasa por `safeStorage.ts` (`readJSON`/`writeJSON`).
   - Los datos principales de la novela residen exclusivamente en `NovelDataContext.tsx`. Ningún componente debe instanciar su propio `localStorage.getItem` para capítulos, personajes o lore.

2. **Estrategia de Autoguardado con Debounce (3s)**:
   - `setX(next)` sin `immediate: true` espera 3 segundos de inactividad de teclado antes de persistir a disco/storage.
   - En editores con escritura carácter a carácter (textarea de capítulos), el componente mantiene estado local y sincroniza al contexto en su propio debounce para no degradar el rendimiento del grafo D3 ni la línea temporal.
   - Acciones discretas (crear, borrar, renombrar) usan `immediate: true`.

3. **Límite de Tamaño de Componentes (< 600-700 líneas)**:
   - Componentes extensos se dividen en subcomponentes puramente presentacionales (reciben datos y callbacks por props).
   - El componente padre retiene toda la lógica de negocio y el estado central.

4. **Modularización previa de Vistas**:
   - `ChapterEditorView` dividido en `ChapterListSidebar`, `ChapterTextEditorPanel`, `ChapterReferencePanel`, `NewCharacterModal`, `ChapterSnapshotsModal`.
   - `TimelineView` dividido en `EraNavigationStrip`, `TimelineFilterBar`, `AnachronismAuditMatrix`, `TimelineEventStream`, `CreateTimelineEventModal`.
   - `StoryRelationsGraphView` dividido en `GraphHeaderControls`, `GraphInspectorDrawer` (conservando la simulación D3 en el componente principal).
