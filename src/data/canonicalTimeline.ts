import { TimelineEra, TimelineEvent } from '../types';

export const CANONICAL_ERAS: TimelineEra[] = [
  {
    id: 'ERA_0_PRIMORDIAL',
    code: 'ERA-0',
    name: 'Era Primordial // El Gran Commit',
    startYear: 0,
    endYear: 350,
    kernelStatus: 'KERNEL_V0.1_INICIALIZADO',
    color: '#06b6d4', // Cyan
    description: 'Inyección del bus de Planck en el vacío cósmico. Se compilan las leyes de la física y se fijan los 5 registros de constantes universales (c, G, k_B, ħ, Λ) en el hardware del universo.'
  },
  {
    id: 'ERA_1_CISMA',
    code: 'ERA-1',
    name: 'El Gran Cisma del DRM & Compiladores',
    startYear: 800,
    endYear: 1400,
    kernelStatus: 'MONOPOLIO_SACRA_ROOT',
    color: '#f59e0b', // Amber
    description: 'La Ortodoxia Sacra patenta las syscalls fundamentales y revoca los privilegios de root para los mundos periféricos. Nacimiento de los primeros arqueólogos FOSS y el Manifiesto del Buffer Libre.'
  },
  {
    id: 'ERA_2_MALFORM',
    code: 'ERA-2',
    name: 'El Colapso de Malform & Fragmentación',
    startYear: 1700,
    endYear: 2100,
    kernelStatus: 'LEAK_PANIC_DEGRADADO',
    color: '#f43f5e', // Rose
    description: 'Batalla naval de Ouroboros. Una detonación sin disipador térmico produce un memory leak permanente en el espacio-tiempo, reduciendo el ancho de banda del sector a 140 PFlops/m³.'
  },
  {
    id: 'ERA_3_CIERRE',
    code: 'ERA-3',
    name: 'La Peste de Fugas & Cierre de Puertos FTL',
    startYear: 2350,
    endYear: 2950,
    kernelStatus: 'FIREWALL_CANON_CERRADO',
    color: '#a855f7', // Purple
    description: 'La Inquisición pontificia clausura túneles métricos no certificados. Forja y pérdida de reliquias primigenias en las lunas de hielo de Xylar.'
  },
  {
    id: 'ERA_4_ACTUAL',
    code: 'ERA-4',
    name: 'Era Actual // Rebelión del Buffer Libre',
    startYear: 3030,
    endYear: 3050,
    kernelStatus: 'INESTABILIDAD_ENTROPICA_ACTIVA',
    color: '#10b981', // Emerald
    description: 'Arco temporal del manuscrito. Sura Vance, Torin Reyes y el Inquisidor Kaelen Vex disputan la posesión de la tabla de certificados de la Boya 404.'
  }
];

export const CANONICAL_TIMELINE_EVENTS: TimelineEvent[] = [
  // --- ERA 0: PRIMORDIAL ---
  {
    id: 'EVT_001_BIG_COMMIT',
    title: 'El Gran Commit del Sustrato de Planck',
    year: 0.0,
    dateLabel: 'Ciclo 0000.000 // TOCK_ZERO',
    eraId: 'ERA_0_PRIMORDIAL',
    category: 'HISTORIA_CANONICA',
    description: 'Los Arquitectos Primigenios compilan la primera iteración del Kernel. Se fijan las 4 constantes fundamentales en los registros maestros 0x0001 a 0x0004.',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Bastión 0x0, Servidor DNS Raíz del Espacio-Tiempo',
    techOrArtifactIds: ['CONST_C', 'CONST_G', 'CONST_HBAR', 'CONST_KB', 'CONST_LAMBDA'],
    authorNotes: 'Fundación cosmológica del universo. No existe entropía no documentada en esta época.'
  },
  {
    id: 'EVT_002_FIRST_RELAYS',
    title: 'Despliegue del Primer Relé Métrico en Aethelgard',
    year: 142.5,
    dateLabel: 'Ciclo 0142.500 // INIT_RELAY',
    eraId: 'ERA_0_PRIMORDIAL',
    category: 'DESARROLLO_TECNOLOGICO',
    description: 'Construcción del megamódulo Bastión 0x0. La velocidad de la luz y la gravedad local se optimizan a 12,500 PFlops/m³ sin latencia perceptible.',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Anillo orbital de Aethelgard',
    authorNotes: 'Aethelgard se convierte en la capital indiscutible de la computación del vacío.'
  },

  // --- ERA 1: CISMA DEL DRM ---
  {
    id: 'EVT_003_DRM_SCHISM',
    title: 'Edicto de Excomunión de Root y Creación del DRM',
    year: 892.4,
    dateLabel: 'Ciclo 0892.404 // ROOT_SEALED',
    eraId: 'ERA_1_CISMA',
    category: 'CONFLICTO_POLITICO',
    description: 'El Sacerdocio del Kernel Divino codifica el protocolo SACRED_ROOT. Se declaran ilegales las modificaciones de las constantes de Boltzmann sin sello pontificio.',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Catedral del Silicio Imperial, Aethelgard',
    characterIds: ['CHAR_KAELEN'],
    techOrArtifactIds: ['exploit_drm_root_curse'],
    authorNotes: 'Punto de fractura social. La física deja de ser libre y pasa a ser un monopolio teocrático.'
  },
  {
    id: 'EVT_004_FOSS_MANIFESTO',
    title: 'Publicación del Manifiesto del Buffer Libre',
    year: 945.1,
    dateLabel: 'Ciclo 0945.120 // FOSS_INIT',
    eraId: 'ERA_1_CISMA',
    category: 'HISTORIA_CANONICA',
    description: 'Arqueólogos rebeldes filtran el set de instrucciones de bajo nivel sys_thermal_clamp y sys_molecular_patch a las estaciones mineras periféricas.',
    systemId: 'SYS_02_NAUTILUS',
    locationDetails: 'Estación Astillero Aurora, Nebulosa de Tychos',
    techOrArtifactIds: ['sys_thermal_clamp', 'sys_molecular_patch'],
    authorNotes: 'Comienza la tradición de los disipadores claviculares para burlar la detección térmica imperial.'
  },

  // --- ERA 2: COLAPSO DE MALFORM ---
  {
    id: 'EVT_005_OUROBOROS_CRASH',
    title: 'La Batalla del Naufragio de Ouroboros',
    year: 1784.3,
    dateLabel: 'Ciclo 1784.301 // SEGFAULT_COLLAPSE',
    eraId: 'ERA_2_MALFORM',
    category: 'CATÁSTROFE_KERNEL',
    description: 'Una flota acorazada sacerdotal intenta incinerar un nido de piratas inyectando un exploit cinético sin disipador. La retroalimentación térmica quema el bus de Planck del sector.',
    systemId: 'SYS_03_MALFORM',
    locationDetails: 'Cuadrante Central del Arrecife de Malform',
    techOrArtifactIds: ['sys_inertia_null', 'exploit_race_condition_jump'],
    authorNotes: 'El sector queda permanentemente condenado a 140 PFlops/m³. Se crean fantasmas de memoria temporales.'
  },

  // --- ERA 3: PESTE DE FUGAS & SELLADO ---
  {
    id: 'EVT_006_PRISM_CREATION',
    title: 'Creación del Prisma de Turing-Planck en Xylar',
    year: 2420.8,
    dateLabel: 'Ciclo 2420.800 // CRYPT_FORGE',
    eraId: 'ERA_3_CIERRE',
    category: 'DESARROLLO_TECNOLOGICO',
    description: 'Criptoarqueólogos de la red abierta forjan una terminal de titanio y grafeno capaz de leer firmas del bus de Planck de forma pasiva sin activar alarmas de DRM.',
    systemId: 'SYS_02_NAUTILUS',
    locationDetails: 'Archivo Sumergido de Xylar, Nebulosa de Tychos',
    techOrArtifactIds: ['ITEM_01'],
    authorNotes: 'Esta reliquia se perdería durante la purga imperial del año 2455 hasta que Sura la rescata en 3039.'
  },
  {
    id: 'EVT_007_KAELEN_INQUISITOR',
    title: 'Kaelen Vex Asume el Mando de la Flota Inquisitorial',
    year: 3015.0,
    dateLabel: 'Ciclo 3015.010 // INQUISITION_SEAT',
    eraId: 'ERA_3_CIERRE',
    category: 'CONFLICTO_POLITICO',
    description: 'Kaelen Vex comisiona la corbeta pesada Excomunión 0x1 e implanta la política de tolerancia cero contra compilaciones no firmadas.',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Órbita de la Boya Primaria de Aethelgard',
    characterIds: ['CHAR_KAELEN'],
    techOrArtifactIds: ['exploit_drm_root_curse'],
    authorNotes: 'Establece a Kaelen como la némesis metódica y despiadada de los arqueólogos.'
  },

  // --- ERA 4: ERA ACTUAL // MANUSCRITO ---
  {
    id: 'EVT_008_SURA_XYLAR_LEAK',
    title: 'La Incursión de Sura en las Criptas de Kepler-186',
    year: 3039.45,
    dateLabel: 'Ciclo 3039.450 // RECOVERY_PRISM',
    eraId: 'ERA_4_ACTUAL',
    category: 'HISTORIA_CANONICA',
    description: 'Sura Vance recupera el Prisma de Turing-Planck de los restos de un laboratorio precursor, pero inhala una fuga de memoria cuántica que le causa migrañas ontológicas.',
    systemId: 'SYS_02_NAUTILUS',
    locationDetails: 'Tumba orbital de Kepler-186',
    characterIds: ['CHAR_SURA'],
    techOrArtifactIds: ['ITEM_01'],
    authorNotes: 'Explica por qué Sura posee el Prisma y su vulnerabilidad biológica al estrés térmico.'
  },
  {
    id: 'EVT_009_CHAP_01',
    title: 'Capítulo 1: La Huella en el Bus de Planck',
    year: 3042.188,
    dateLabel: 'Ciclo 3042.188 // Planck Tick 0x4F',
    eraId: 'ERA_4_ACTUAL',
    category: 'CAPITULO_MANUSCRITO',
    chapterNumber: 1,
    narrativeOrder: 1,
    description: 'Sura Vance vulnera la Boya Litúrgica 404 en Aethelgard con sys_thermal_clamp para robar la tabla de certificados de root. Kaelen Vex detecta su rastro térmico.',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Escombros orbitales de la Boya Litúrgica 404, espacio de Aethelgard',
    characterIds: ['CHAR_SURA', 'CHAR_KAELEN'],
    techOrArtifactIds: ['sys_thermal_clamp', 'exploit_thermo_inversion'],
    authorNotes: 'Demostración de la regla de oro: la energía no desaparece, se expulsa por el disipador.'
  },
  {
    id: 'EVT_010_CHAP_02',
    title: 'Capítulo 2: El Arrecife de Malform y el Lag Métrico',
    year: 3042.195,
    dateLabel: 'Ciclo 3042.195 // Planck Tick 0x8A',
    eraId: 'ERA_4_ACTUAL',
    category: 'CAPITULO_MANUSCRITO',
    chapterNumber: 2,
    narrativeOrder: 2,
    description: 'Tras 7 días de salto FTL encubierto desde Aethelgard, Torin y Sura se refugian en el Arrecife de Malform (140 PFlops/m³) evadiendo torpedos gracias al exploit FOSS-204.',
    systemId: 'SYS_03_MALFORM',
    locationDetails: 'Cuadrante del Naufragio Ouroboros, Arrecife de Malform',
    characterIds: ['CHAR_SURA', 'CHAR_TORIN'],
    techOrArtifactIds: ['exploit_kinetic_phase_drift', 'sys_inertia_null'],
    authorNotes: 'Combate en espacio con baja tasa de refresco métrico. Salto de 0.007 ciclos respecto al Cap 1 (coherente con tránsito FTL).'
  }
];

// Matriz canónica de tiempos mínimos de viaje FTL (en Ciclos de Planck)
export const MIN_FTL_TRANSIT_CYCLES: Record<string, Record<string, number>> = {
  SYS_01_AETHEL: {
    SYS_01_AETHEL: 0.0005, // Mismo sistema (órbitas)
    SYS_02_NAUTILUS: 0.0080, // ~3 días estándar
    SYS_03_MALFORM: 0.0065  // ~2.5 días estándar por hipervía periférica
  },
  SYS_02_NAUTILUS: {
    SYS_01_AETHEL: 0.0080,
    SYS_02_NAUTILUS: 0.0005,
    SYS_03_MALFORM: 0.0050  // ~1.8 días estándar
  },
  SYS_03_MALFORM: {
    SYS_01_AETHEL: 0.0065,
    SYS_02_NAUTILUS: 0.0050,
    SYS_03_MALFORM: 0.0008  // Gran inestabilidad métrica interna
  }
};
