# 🌌 Neo_Scribe

> **Suite de autor para novelas complejas: editor de capítulos, worldbuilding con grafo de relaciones, línea temporal y un auditor de coherencia narrativa con IA — agnóstica de género.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg?logo=tailwindcss)
![Gemini API](https://img.shields.io/badge/Google%20Gemini%20API-Powered-4285f4.svg?logo=google)
![D3.js](https://img.shields.io/badge/D3.js-7.9-f9a03c.svg?logo=d3.js)

---

## 📖 Índice

1. [Visión General](#-visión-general)
2. [Contenido de Ejemplo Incluido: "Kernel del Vacío"](#-contenido-de-ejemplo-incluido-kernel-del-vacío)
3. [Módulos y Capacidades del Sistema](#-módulos-y-capacidades-del-sistema)
   - [✍️ Estudio de Escritura de Capítulos](#1-estudio-de-escritura-de-capítulos-chaptereditorview)
   - [🌐 Grafo de Relaciones & Detector de Incoherencias (D3.js)](#2-grafo-de-relaciones--detector-de-incoherencias-d3js)
   - [⏳ Línea Temporal & Detector de Anacronismos](#3-línea-temporal--detector-de-anacronismos-timelineview)
   - [🤖 Auditor Ontológico con Gemini IA](#4-auditor-ontológico-con-gemini-ia-coherenceauditorview)
   - [🔬 Arquitectura del Sustrato de Planck](#5-arquitectura-del-sustrato-de-planck-substratearchitectureview)
   - [🌌 Atlas de Sistemas Estelares](#6-atlas-de-sistemas-estelares-starsystemsatlasview)
   - [🛡️ Facciones & Arqueología Precursora](#7-facciones--arqueología-precursora-factionsandarcheologyview)
   - [🧪 Sandbox de Simulación de Exploits Físicos](#8-sandbox-de-simulación-de-exploits-físicos-exploitsandbox)
   - [✨ Generador de Lore & Artefactos](#9-generador-de-lore--artefactos-loregeneratorview)
   - [🎨 Motor de Géneros y Temas Visuales](#10-motor-de-géneros-y-temas-visuales)
   - [🧩 Constructor de Módulos Propios del Autor](#11-constructor-de-módulos-propios-del-autor)
   - [💾 Persistencia y Sincronización Multi-Destino](#12-persistencia-y-sincronización-multi-destino)
   - [📄 Exportación Profesional (.docx, Google Docs, JSON)](#13-exportación-profesional-docx-google-docs-json)
4. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
5. [Instalación y Configuración](#-instalación-y-configuración)
6. [Scripts Disponibles](#-scripts-disponibles)
7. [Configuración de Gemini y Modos de Uso](#-configuración-de-gemini-y-modos-de-uso)

---

## 🪐 Visión General

**Neo_Scribe** es una suite de autor para escritores de novelas extensas y con reglas de mundo complejas (ciencia ficción dura, ópera espacial, alta fantasía, ficción histórica, etc.), diseñada para resolver el mayor desafío de las obras largas: **la coherencia interna, el rigor causal y la continuidad de tu propio worldbuilding a lo largo de cientos de páginas**.

A diferencia de procesadores de texto convencionales o wikis estáticas, Neo_Scribe integra:
- Un **editor literario enriquecido** con autocompletado diegético (`@` para personajes, `/` para conceptos y reglas del mundo que tú definas).
- Un **grafo de fuerzas D3** que rastrea la interacción entre personajes, lugares y elementos de tu universo capítulo a capítulo.
- Un **motor de auditoría causal** que detecta anacronismos temporales y violaciones de las reglas de tu propio mundo.
- Un **Auditor con IA (Google Gemini)** que evalúa borradores contra las reglas de tu universo, proporcionando dictámenes y parches narrativos (diffs literarios).
- Un **motor agnóstico de géneros**: toda la interfaz, el glosario y la personalidad de la IA mutan por completo según el género — Ciencia Ficción, Alta Fantasía, Cyberpunk/Noir, Ficción Histórica o Romance — o según un preset propio que definas tú (ver [sección 10](#10--motor-de-géneros-y-temas-visuales)).

El proyecto se distribuye con un universo de ejemplo precargado, **"Kernel del Vacío"**, para que puedas ver todos los módulos funcionando con datos reales desde el primer minuto — no es el tema de la aplicación, es contenido de demostración que puedes editar, sustituir o borrar por completo.

---

## 🎭 Contenido de Ejemplo Incluido: "Kernel del Vacío"

> Esta sección describe el **universo de demostración** que viene precargado, no una limitación de la herramienta. Puedes vaciarlo o reemplazarlo por tu propio lore desde el primer momento (ver [Motor de Géneros y Temas Visuales](#10--motor-de-géneros-y-temas-visuales)).

Por defecto, la suite viene precargada con la biblia de lore de **"Kernel del Vacío"**, un universo de ciencia ficción dura con reglas rigurosas, pensado como ejemplo de cuánto detalle puede modelar el sistema:

1. **El Sustrato de Planck (Kernel de la Realidad):**
   - Una malla a escala de Planck que compila y ejecuta constantes universales ($c$, $G$, $\hbar$, entropía, masa, inercia).
   - No existe la magia mística: todo fenómeno tecnomágico es una inyección de excepciones, un exploit o una sobrescritura de registros físicos locales.
   - **Conservación termodinámica estricta:** Congelar un volumen térmico forzando 0 K no destruye la entropía; debe disiparse como calor masivo al registro adyacente o al disipador del operador.

2. **Operadores, Depuradores e Inyectores:**
   - Utilizan terminales rígidas blindadas (*slates de debug*) o implantes de compilación neural. Compilan *bytecode* contra la realidad.

3. **Límites Técnicos y Físicos:**
   - **Compute / RAM de área:** Límite de flops por $\text{m}^3$ en cada sector. Concurrencia de operadores provoca *Throttling* (latencia cinemática, objetos cayendo a tirones, retardo en propagación de luz).
   - **Memory Leaks:** Campos de inercia o blindajes sin recolector de basura (*garbage collection*) fragmentan el espacio, dejando estática cuántica y dolor neural.
   - **Kernel Panic:** *Buffer overflows* provocan colapsos de física local (microvacíos de Planck, agujeros de gusano parásitos o muerte del inyector por `SIGSEGV` neural).

4. **Guerra Ontológica:**
   - **Alianza FOSS / Arqueólogos de Código Abierto:** Buscan desclasificar librerías precursoras y democratizar el acceso al Sustrato.
   - **Ortodoxia Sacra / Sacerdocio del Root (`sudo root`):** Consideran que poseen la clave criptográfica divina, imponen DRM ontológico a la materia y persiguen a los depuradores como herejes.

---

## 🚀 Módulos y Capacidades del Sistema

### 1. ✍️ Estudio de Escritura de Capítulos (`ChapterEditorView`)
- **Editor en Tiempo Real:** Interfaz minimalista con soporte para pantalla completa y tipografía de máquina de escribir o monospace.
- **Gestión de Estados:** `BORRADOR`, `EN_REVISION`, `CANON`.
- **Coordenadas Diegéticas:** Asignación de Sistema Estelar, ciclo temporal diegético y marcas de analepsis / flashback.
- **Autocompletado Contextual:**
  - `@`: Despliega personajes canónicos para insertar menciones directas.
  - `/`: Despliega el diccionario de conceptos, llamadas al sistema (*syscalls*) y *exploits*.
- **Historial de Versiones & Snapshots:** Captura instantáneas del capítulo con notas descriptivas, previsualiza textos históricos y restaura versiones anteriores con 1 clic sin perder trabajo.
- **Importador de Manuscritos Integrado:** Permite arrastrar o cargar manuscritos en `.md`, `.txt` o `.docx`, dividiéndolos automáticamente por capítulos con vista previa.
- **Checklist de Coherencia Integrada:**
  - `[ ]` Conservación de entropía respetada.
  - `[ ]` Ancho de banda de Planck no saturado.
  - `[ ]` Fugas de memoria (*leaks*) limpiadas tras el combate.
  - `[ ]` Normativas de DRM y facciones coherentes con la localización.
- **Métricas:** Conteo de palabras, tiempo estimado de lectura y estadísticas de sesión.
- **Botón Directo:** *Auditar escena seleccionada con Gemini*.

### 2. 👥 Vista Dedicada de Fichas de Personajes (`CharactersRosterView`)
- Catálogo visual completo de personajes y operadores con filtros por facción (*Alianza FOSS*, *Ortodoxia Sacra*, *Depuradores Proscritos*).
- Formulario de creación y edición exhaustivo: Nombre, Rol dramático, Facción, Biografía, Implantes de compilación, Habilidades y Notas secretas / Arcos de evolución.
- Sincronización bidireccional automática con el autocompletado `@` del editor, el Grafo D3 y el detector de anacronismos.

### 3. ⌨️ Paleta de Comandos Global (`Ctrl + K` / `Cmd + K`) (`CommandPaletteModal`)
- Buscador universal accesible con atajo de teclado en cualquier momento.
- Indexa en tiempo real capítulos, fichas de personajes, atlas de sistemas estelares, constantes del sustrato y acciones rápidas del sistema (exportar, auditar, cambiar tema, crear capítulos).

### 4. 🌐 Grafo de Relaciones & Detector de Incoherencias (D3.js)
- Visualización interactiva con simulación de fuerzas física en tiempo real.
- **Nodos tipados:** Personajes, Planetas/Sistemas y Tecnologías/Syscalls.
- **Aristas ponderadas:** Conexiones por co-presencia en capítulos, despliegue de tecnología o lealtades de facción.
- **Algoritmo de Detección de Incoherencias Narrativas:**
  - **Ubicación Imposible:** Personajes que aparecen en planetas distintos en el mismo ciclo temporal.
  - **Sobrecarga Térmica:** Uso de exploits de alta entropía sin disipadores en el entorno.
  - **Violación de DRM:** Operaciones de *código libre* en zonas bajo control militar de la Ortodoxia Sacra.
  - **Entidades Huérfanas:** Elementos creados en el lore que nunca han sido mencionados en el manuscrito.

### 3. ⏳ Línea Temporal & Detector de Anacronismos (`TimelineView`)
- Doble perspectiva cronológica:
  1. **Orden Diegético Universal:** Eje temporal absoluto en ciclos de Planck (desde la Era Precursora hasta la Era de la Fragmentación).
  2. **Orden Narrativo de Lectura:** Secuencia capítulo a capítulo con indicación de saltos hacia atrás (*flashbacks* / analepsis).
- **Motor de Detección de Anacronismos (`anachronismDetector.ts`):**
  - **Desplazamiento FTL Imposible:** Valida que el tiempo transcurrido entre dos apariciones sea suficiente para cubrir la distancia estelar en años luz.
  - **Paradojas Causales:** Detección de consecuencias que anteceden a su causa en el tiempo diegético.
  - **Anacronismos Tecnológicos:** Uso de tecnologías o exploits antes de su fecha canónica de descubrimiento o desclasificación.

### 4. 🤖 Auditor Ontológico con Gemini IA (`CoherenceAuditorView`)
El corazón analítico de Neo_Scribe ofrece dos vías de uso:
1. **Modo Servidor (API Directa):**
   - Ejecución mediante `@google/genai` conectando al backend Express local (`/api/audit-coherence`).
   - Genera un dictamen estructurado en 5 secciones:
     - 📊 *Dictamen de Coherencia (0-100)*
     - 🔬 *Análisis de Física del Sustrato*
     - ⚠️ *Riesgos de Kernel Panic o Fugas de Memoria*
     - ⚔️ *Alineación con la Guerra de Facciones & DRM*
     - 💡 *Sugerencias de Parche Narrativo (Diff Literario)*
2. **Modo 1-Clic para Gemini Web (Sin API Key):**
   - Para autores que no deseen configurar claves ni servidores.
   - El botón **"Copiar Dossier y Abrir Gemini Web"** empaqueta en el portapapeles las reglas canónicas completas, fichas de personajes y el texto a auditar, abriendo simultáneamente la sesión personal en [gemini.google.com](https://gemini.google.com/app) para pegar (`Ctrl+V`) y recibir el informe gratis con Gemini Advanced / Flash.

### 5. 🔬 Arquitectura del Sustrato de Planck (`SubstrateArchitectureView`)
- Visualización de las 3 capas ontológicas:
  - **L0 - Sustrato Fundamental de Planck:** Constantes cósmicas ($c, G, h, k_B, e$), direcciones de registro hexadecimales y riesgos de pánico.
  - **L1 - Capa de Relés y Drivers Moleculares:** Control de cohesión atómica, inercia y campos gravitatorios.
  - **L2 - Runtime & Compiladores de Campo:** Librerías de usuario, interfaces de combate y terminales de depuración.
- Catálogo de llamadas al sistema (*Syscalls*) con parámetros de coste en MFlops, RAM por $\text{m}^3$, tasa de fuga y sensaciones sensoriales percibidas por el operador.

### 6. 🌌 Atlas de Sistemas Estelares (`StarSystemsAtlasView`)
- Mapeo de sistemas estelares (Axioma Prime, Khepri-9, El Vórtice de Turing, Sagrario de Planck, etc.).
- Métricas por sector:
  - Ancho de banda de Planck (Ultra Alto, Estándar, Periférico, Corrupto).
  - Porcentaje de estabilidad del Kernel.
  - Política de DRM local y facción de control.
  - Latencia de ruteo FTL y anomalías activas.

### 7. 🛡️ Facciones & Arqueología Precursora (`FactionsAndArcheologyView`)
- Comparativa doctrinal de facciones:
  - *La Alianza de Arqueólogos FOSS*
  - *La Ortodoxia Sacra del Root*
  - *El Cártel de Depuradores de la Periferia*
- Tecnologías de compilación, posturas ante el DRM de la materia, arquetipos clave e implantes típicos.

### 8. 🧪 Sandbox de Simulación de Exploits Físicos (`ExploitSandbox`)
- Terminal diegética interactiva.
- Permite inyectar *exploits* concurrentes (ej: *ZeroInertia_Bypass*, *ThermalVoid_Sink*, *EntangledTunnel_v4*).
- Medidores en vivo:
  - Consumo de cómputo en GFlops/$\text{m}^3$.
  - Consumo de RAM de área.
  - Porcentaje de fragmentación métrica (Memory Leaks).
  - Riesgo de Kernel Panic en tiempo real con disparadores de *Clock Skew* (lag en la física del mundo).

### 9. ✨ Generador de Lore & Artefactos (`LoreGeneratorView`)
- Asistente generativo conectado a Gemini para crear:
  - Artefactos precursores.
  - Exploits tácticos.
  - Anomalías espaciales.
  - Sistemas estelares periféricos.
- Salida en formato JSON estricto con especificaciones técnicas, arquitectura de capas, modos de fallo y ganchos argumentales para novelas.

### 10. 🎨 Motor de Géneros y Temas Visuales
Neo_Scribe no está limitado a la ciencia ficción. A través del modal de **Temas y Géneros**, la suite muta completamente:
- **Presets de Género:**
  - 🚀 *Sci-Fi / Space Opera* (Kernel del Vacío)
  - 🧙‍♂️ *Alta Fantasía / Grimdark* (Grimorio Arcano)
  - 🕵️ *Novela Negra / Cyber Noir* (Expedientes de Asuntos Internos)
  - 🏰 *Ficción Histórica* (Crónica del Reino)
  - 🌹 *Romance / Drama Literario* (Tensión & Vínculos)
  - 🖋️ *Minimalista Universal*
- **Temas Visuales:** `cyber`, `grimoire`, `detective`, `velvet`, `parchment`, `minimalist`. Modifican paleta de colores, gradientes, tipografías y texturas de fondo.

### 11. 🧩 Constructor de Módulos Propios del Autor
Permite a los autores crear nuevos apartados dinámicos en la barra lateral sin tocar código:
- Catálogos de criaturas / Bestiarios.
- Glosarios y dialectos.
- Matrices de relaciones mágicas o tecnológicas.
- Documentos libres estructurados.

### 12. 💾 Persistencia y Sincronización Multi-Destino
- **Motor de Autoguardado (`autosaveService.ts`):** Guardado automático con silenciamiento de 3 segundos (*debounce*), atajo global `Ctrl + S` y protección ante cierre accidental de pestaña (`beforeunload`).
- **Sincronización Local Directa (`localDirectoryService.ts`):** Utiliza la *File System Access API* del navegador para escribir los archivos en una carpeta física de tu disco duro.
- **Google Drive Sync:** Respaldo completo en la nube con un clic y enlace a Google Docs.
- **Copia de Seguridad JSON:** Exportación e importación completa del estado de la novela.

### 13. 📄 Exportación Profesional (.docx, Google Docs, JSON)
- **Generación nativa de Microsoft Word (`.docx`):** Maquetación formal con índice, capítulos numerados, notas del autor y glosarios.
- **Exportación optimizada para Google Docs:** Documento HTML estilizado listo para copiar o importar en Google Drive.
- **Dossier Ontológico Completo:** Formato Markdown optimizado para alimentar LLMs o compartir con lectores beta y editores.

---

## 🏛️ Arquitectura del Proyecto

```
Neo_Scribe/
├── index.html                   # Entry point HTML con fuentes de Google Fonts
├── server.ts                    # Servidor Express + Middleware Vite + Gemini SDK
├── vite.config.ts               # Configuración de compilación Vite + Tailwind v4
├── tsconfig.json                # Configuración TypeScript estricta
├── package.json                 # Dependencias y scripts
├── metadata.json                # Manifiesto de capacidades
├── firebase-applet-config.json  # Configuración de integración Firebase/Cloud
│
├── GEMINI.md                    # Convenciones de arquitectura para agentes de IA
├── vitest.config.ts             # Configuración de tests (Vitest)
│
├── src/
│   ├── main.tsx                 # Montaje de React 19
│   ├── App.tsx                  # Componente raíz, orquestador de vistas y estado de UI
│   ├── index.css                # Sistema de diseño, temas visuales y tokens CSS
│   ├── types.ts                 # Definiciones de tipos TypeScript universales
│   │
│   ├── store/
│   │   └── NovelDataContext.tsx        # Fuente única de verdad: capítulos, personajes, lore y eventos
│   │
│   ├── components/              # Vistas principales y componentes de la UI
│   │   ├── ChapterEditorView.tsx           # Editor de capítulos (orquesta los 5 de abajo)
│   │   │   ├── ChapterListSidebar.tsx          # Índice de capítulos filtrable
│   │   │   ├── ChapterTextEditorPanel.tsx      # Toolbar + textarea + autocompletado
│   │   │   ├── ChapterReferencePanel.tsx       # Matriz de referencias (5 pestañas)
│   │   │   ├── NewCharacterModal.tsx           # Modal de alta de personaje
│   │   │   └── ChapterSnapshotsModal.tsx       # Historial de instantáneas del capítulo
│   │   ├── StoryRelationsGraphView.tsx     # Grafo interactivo D3 (orquesta los 2 de abajo)
│   │   │   ├── GraphHeaderControls.tsx         # Cabecera, métricas y filtros
│   │   │   └── GraphInspectorDrawer.tsx        # Panel de inconsistencias + inspector de nodo
│   │   ├── TimelineView.tsx                # Cronología y anacronismos (orquesta los 5 de abajo)
│   │   │   ├── EraNavigationStrip.tsx          # Franja de épocas cosmológicas
│   │   │   ├── TimelineFilterBar.tsx           # Buscador y filtros
│   │   │   ├── AnachronismAuditMatrix.tsx      # Radar de anacronismos con reconciliación
│   │   │   ├── TimelineEventStream.tsx         # Flujo cronológico visual
│   │   │   └── CreateTimelineEventModal.tsx    # Modal de nuevo hito
│   │   ├── StorageCorruptionBanner.tsx     # Aviso de datos corruptos recuperados (ver GEMINI.md)
│   │   ├── CoherenceAuditorView.tsx        # Auditor ontológico Gemini (Local + Web)
│   │   ├── SubstrateArchitectureView.tsx   # Capas L0/L1/L2 del Sustrato de Planck
│   │   ├── StarSystemsAtlasView.tsx        # Atlas cartográfico estelar
│   │   ├── FactionsAndArcheologyView.tsx   # Biblia de facciones y DRM
│   │   ├── ExploitSandbox.tsx              # Simulador en vivo de computación de área
│   │   ├── LoreGeneratorView.tsx           # Generador IA de artefactos y lore
│   │   ├── NovelOverviewHub.tsx            # Cuadro de mando y métricas generales
│   │   ├── CustomModuleView.tsx            # Gestor de módulos personalizados
│   │   ├── ConceptDictionaryPanel.tsx      # Panel lateral de consulta de términos
│   │   ├── EntityCardModal.tsx             # Modal detallado para nodos del grafo
│   │   ├── GenreThemesModal.tsx            # Selector de géneros literarios y temas
│   │   ├── WorldbuildingCustomizerModal.tsx# Personalizador de nombres de módulos
│   │   ├── WorldbuildingExportModal.tsx    # Modal de exportación Word / Docs / MD
│   │   ├── StorageSyncModal.tsx            # Gestión de carpetas locales y Google Drive
│   │   ├── AutosaveStatusBadge.tsx         # Indicador de estado de guardado
│   │   ├── EditorMetricsStatusBarIndicator.tsx # Barra inferior de métricas
│   │   ├── Navbar.tsx                      # Cabecera principal con accesos rápidos
│   │   └── NavigationPanel.tsx             # Barra lateral colapsable de módulos
│   │
│   ├── data/                    # Datos y constantes canónicas por defecto
│   │   ├── canonicalLore.ts         # Reglas de física, facciones, sistemas y personajes
│   │   ├── canonicalTimeline.ts     # Eras cronológicas y eventos canónicos
│   │   ├── conceptDictionary.ts     # Términos del diccionario ontológico
│   │   └── genrePresets.ts          # Presets de géneros (SciFi, Fantasía, Noir, etc.)
│   │
│   ├── services/                # Servicios de lógica de negocio y persistencia
│   │   ├── autosaveService.ts          # Motor de autoguardado con debounce y atajos
│   │   ├── auditorPromptService.ts     # Generador de prompts ontológicos por género
│   │   ├── editorMetricsService.ts     # Cálculo de palabras y tiempos de lectura (+ test)
│   │   ├── genrePresetService.ts       # Gestor del género y vocabulario activo
│   │   ├── localDirectoryService.ts    # File System Access API para carpetas locales
│   │   ├── googleDriveService.ts       # Integración con Google Drive
│   │   ├── moduleConfigService.ts      # Configuración de visibilidad de módulos
│   │   └── userCustomModuleService.ts  # Almacenamiento de módulos personalizados
│   │
│   └── utils/                   # Utilidades matemáticas y algorítmicas
│       ├── safeStorage.ts              # Lectura/escritura segura de localStorage (+ test)
│       ├── storyGraphExtractor.ts      # Extractor de grafo y detector de inconsistencias (+ test)
│       ├── anachronismDetector.ts      # Detección de paradojas y desplazamientos FTL (+ test)
│       ├── googleDocsExporter.ts       # Generador de HTML para Docs y binarios .docx
│       └── environment.ts              # Detección de entorno y APIs soportadas
```

> 🤖 **¿Vas a tocar persistencia de datos o a ampliar una vista grande?** Lee
> primero [`GEMINI.md`](GEMINI.md) — documenta las convenciones que salieron
> de una refactorización completa del proyecto (capa de datos central, nunca
> leer `localStorage` a pelo, cuándo dividir un componente, tests con Vitest).

---

## 🛠️ Instalación y Configuración

### Requisitos Previos
- **Node.js**: Versión 18.0 o superior (recomendado Node 20 o 22 LTS).
- **npm**: Versión 9 o superior.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/danimoli-vr/Neo_Scribe.git
   cd Neo_Scribe
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y añade tu clave de API de Google Gemini (opcional si utilizas el modo 1-clic de Gemini Web):
   ```env
   GEMINI_API_KEY="AIzaSyTuClaveDeGemini"
   APP_URL="http://localhost:3000"
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000`.

---

## 💻 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo completo (Express + Vite con Hot Module Replacement en puerto 3000). |
| `npm run build` | Compila tanto la aplicación cliente (Vite) en `dist/` como el servidor Express empaquetado en `dist/server.cjs`. |
| `npm run start` | Inicia el servidor de producción con los archivos estáticos precompilados. |
| `npm run lint` | Ejecuta la comprobación estricta de tipos de TypeScript (`tsc --noEmit`). |
| `npm run preview` | Permite previsualizar la compilación de Vite de forma aislada. |
| `npm run clean` | Limpia los artefactos generados en la carpeta `dist/`. |

---

## 🧠 Configuración de Gemini y Modos de Uso

Neo_Scribe está diseñado para que cualquier persona pueda aprovechar la potencia de los modelos de frontera de Google Gemini:

### Opción A: Mediante API Local (Para desarrolladores)
1. Consigue una API Key gratuita o de pago en [Google AI Studio](https://aistudio.google.com/).
2. Guárdala en tu archivo `.env` como `GEMINI_API_KEY=tu_clave`.
3. El servidor Express utilizará el SDK oficial `@google/genai` con el modelo configurado (`gemini-3.8-flash` / `gemini-2.5-flash`) para responder directamente en la pestaña del Auditor y en el Generador de Lore.

### Opción B: Modo 1-Clic para Gemini Web (Para escritores sin API Key)
1. No requiere configurar nada en el archivo `.env`.
2. En la vista **Auditor de Coherencia**, haz clic en el botón superior:
   👉 **"Copiar Dossier y Abrir Gemini Web (1 Clic)"**
3. El sistema copia automáticamente al portapapeles:
   - Rol y personalidad del Auditor según tu género activo.
   - Resumen de reglas ontológicas, límites de física y costes de energía.
   - Lista de personajes involucrados y sus habilidades canónicas.
   - Cronología relevante y el texto de tu escena.
4. Se abrirá automáticamente [gemini.google.com](https://gemini.google.com/app).
5. Solo tienes que pulsar **`Ctrl + V`** (Pegar) y pulsar Enter para recibir una auditoría completa y profesional con tu cuenta personal de Google o Gemini Advanced.

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.

---

*Desarrollado con pasión para autores de mundos complejos y literatura con consecuencias reales.*
