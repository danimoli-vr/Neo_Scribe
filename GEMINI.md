# Guía para agentes de IA (Gemini y similares)

Este archivo documenta convenciones establecidas en una sesión de refactorización
(septiembre 2026) para que futuros cambios —hechos por Gemini, por otra IA, o por
un humano— sigan el mismo patrón en vez de reintroducir los problemas que se
corrigieron. Léelo antes de tocar persistencia de datos o de añadir funciones
grandes a una vista existente.

## 1. Nunca leas `localStorage` directamente

**Regla:** todo acceso a `localStorage` para datos de la novela (capítulos,
personajes, lore, eventos de línea temporal) pasa por
[`src/utils/safeStorage.ts`](src/utils/safeStorage.ts) (`readJSON`/`writeJSON`),
nunca por `localStorage.getItem`/`setItem` + `JSON.parse` a pelo.

**Por qué:** un valor corrupto (cuota llena, extensión del navegador, edición
manual) hacía `JSON.parse` lanzar una excepción que un `catch (e) {}` silenciaba,
sustituyendo el manuscrito real del usuario por los datos de ejemplo sin ningún
aviso. `readJSON` en su lugar preserva el valor original en una clave de backup,
dispara un evento (`krnl_storage_corrupted`) que
[`StorageCorruptionBanner.tsx`](src/components/StorageCorruptionBanner.tsx)
muestra al usuario, y solo entonces cae al valor por defecto.

Si añades una clave nueva de `localStorage`, usa `readJSON`/`writeJSON` desde el
principio, con un validador (`isArray`/`isNonEmptyArray` o uno propio) si aplica.

## 2. Los datos de la novela viven en `NovelDataContext`, no en cada componente

**Regla:** capítulos, personajes, lore y eventos de línea temporal se leen y
escriben a través de [`useNovelData()`](src/store/NovelDataContext.tsx)
(`chapters`, `characters`, `loreItems`, `customTimelineEvents` y sus
`setX(next, immediate?)`). No vuelvas a leer estas claves de `localStorage` de
forma independiente en un componente nuevo — ya existe una única fuente de
verdad.

**Detalle importante de rendimiento:** `setX(next)` sin `immediate: true` es
*debounced* (autoguardado a los 3s de inactividad, igual que antes). Un
componente con edición carácter a carácter (como el textarea de capítulos)
debe mantener su propio estado local de React para la respuesta instantánea,
sembrado desde el contexto al montar, y empujar los cambios al contexto dentro
de su efecto de guardado existente — **no** llames a `setX` en cada pulsación
de tecla si eso fuerza a otros componentes (grafo, línea temporal) a recalcular
datos derivados costosos en cada letra escrita. Usa `immediate: true` para
acciones discretas del usuario (borrar, crear, importar) donde quieres que el
resto de la app se entere al instante. Mira cómo lo hace
[`ChapterEditorView.tsx`](src/components/ChapterEditorView.tsx) frente a
[`CharactersRosterView.tsx`](src/components/CharactersRosterView.tsx) para ver
los dos patrones.

## 3. Cuándo dividir un componente

**Regla práctica:** si un archivo de `src/components/` supera ~600-700 líneas,
divídelo antes de seguir añadiéndole funciones, siguiendo este patrón (ya
aplicado en `ChapterEditorView`, `TimelineView` y `StoryRelationsGraphView`):

- Extrae cada bloque de JSX autocontenido (una lista, un panel con pestañas, un
  modal) a su propio componente en `src/components/`, puramente presentacional:
  recibe datos y callbacks por props, sin `useState` de negocio propio salvo
  formularios locales.
- El componente padre conserva **todo** el estado y la lógica de mutación —
  el objetivo es reducir tamaño de archivo y acoplamiento visual, no mover
  lógica de negocio de sitio.
- Un modal siempre acepta `isOpen` y hace `if (!isOpen) return null;` al
  principio (cuidado: los hooks van *antes* de ese `return`).
- Ejemplos de referencia: `ChapterListSidebar.tsx`, `ChapterTextEditorPanel.tsx`,
  `ChapterReferencePanel.tsx`, `NewCharacterModal.tsx`,
  `ChapterSnapshotsModal.tsx` (todos extraídos de `ChapterEditorView.tsx`);
  `EraNavigationStrip.tsx`, `TimelineFilterBar.tsx`,
  `AnachronismAuditMatrix.tsx`, `TimelineEventStream.tsx`,
  `CreateTimelineEventModal.tsx` (de `TimelineView.tsx`); `GraphHeaderControls.tsx`,
  `GraphInspectorDrawer.tsx` (de `StoryRelationsGraphView.tsx`).
- Excepción consciente: no merece la pena extraer un bloque que manipula el DOM
  directamente por referencias imperativas de forma muy acoplada al resto del
  componente (ej. la simulación D3 de `StoryRelationsGraphView.tsx` se quedó
  donde estaba — extraerla habría exigido `forwardRef`/`useImperativeHandle`
  sin reducir de verdad la complejidad).

Candidatos pendientes con este mismo patrón si vuelven a crecer:
`CustomModuleView.tsx` y `StorageSyncModal.tsx` (ambos > 800 líneas).

## 4. Hay tests — úsalos y amplíalos

`npm test` corre Vitest ([`vitest.config.ts`](vitest.config.ts)). Cubre la
lógica pura más crítica: `safeStorage.test.ts`, `anachronismDetector.test.ts`,
`storyGraphExtractor.test.ts`, `editorMetricsService.test.ts`. Si añades lógica
de negocio no trivial en `src/utils/` o `src/services/` (no componentes de UI),
añade un test junto a ella — es la red de seguridad que permite refactorizar
sin miedo.

## 5. Antes de dar por terminado un cambio

- `npx tsc --noEmit` sin errores.
- `npm test` en verde.
- Si el cambio toca una vista visible, pruébala manualmente (o pide que se
  pruebe) en el navegador — varios bugs de esta sesión solo se detectaron
  usando la app de verdad, no solo compilando.
