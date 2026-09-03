import { UniversalConstant, Syscall, ExploitScript, Faction, StarSystem, LoreItem, NovelCharacter, Chapter } from '../types';

export const CANONICAL_AXIOMS = [
  {
    id: 'AXIOM_01',
    name: 'El Principio de la Conservación de Entropía',
    summary: 'No existe el maná ni la generación espontánea de energía.',
    rule: 'Toda alteración en un registro de Planck (por ejemplo, reducir la temperatura a 2 Kelvin en un metro cúbico) exige una descarga equivalente en un registro adyacente. El inyector o su nave debe poseer radiadores de disipación o el calor residual vaporizará su propio implante neural.',
    narrativeSign: 'Los operadores siempre llevan toberas de descarga térmica, tubos criogénicos al cuello o aletas de grafeno radiante al rojo vivo durante una inyección.'
  },
  {
    id: 'AXIOM_02',
    name: 'La Ley de Ancho de Banda y Throttling de Planck',
    summary: 'El espacio-tiempo tiene tasa de refresco y límite de cálculo por metro cúbico.',
    rule: 'Un sector de Planck no tiene capacidad infinita. Si dos o más operadores compilan scripts pesados a la vez (o una fragata militar activa un escudo y un pulso disruptor), la tasa de cálculo se satura. La física local sufre "latencia": la luz se propaga con retardo, los proyectiles cinéticos caen a tirones (framerate dropping en la realidad) y el sonido viaja distorsionado.',
    narrativeSign: 'En un tiroteo tenso, los personajes ven las balas "congeladas en el aire" durante microsegundos como si la realidad tuviera lag.'
  },
  {
    id: 'AXIOM_03',
    name: 'Fragmentación Espacial (Memory Leaks)',
    summary: 'Dejar procesos sin Garbage Collection pudre el tejido del vacío.',
    rule: 'Si un operador activa un campo de amortiguación cinética y se desconecta sin ejecutar una instrucción de liberación de memoria (free() ontológico), la estructura métrica queda fragmentada. Se generan "residuos estáticos": zonas donde la gravedad parpadea, la inercia es inconsistente o el aire refleja luz fantasmal.',
    narrativeSign: 'Las ruinas precursores no están llenas de polvo, sino de memory leaks milenarios que provocan náuseas, fallos auditivos y espejismos refractarios.'
  },
  {
    id: 'AXIOM_04',
    name: 'El Kernel Panic de la Realidad',
    summary: 'Un fallo de segmentación o desbordamiento de búfer rompe la física.',
    rule: 'Un error sintáctico o un puntero nulo no se cancela con una chispa inofensiva: el compilador de Planck no tiene excepciones manejadas. El sector crashea, generando microvacíos hiperdensos, inversión de entropía local o la desintegración cuántica del operador (SIGSEGV biológico).',
    narrativeSign: 'El operador que erra un cálculo no falla: su terminal escupe plasma blanco y su brazo se convierte en una mancha bidimensional sin masa.'
  },
  {
    id: 'AXIOM_05',
    name: 'La Ciberguerra de la Materia (Guerra de Exploits)',
    summary: 'El combate es inyección de código, desensamblado y contramedidas.',
    rule: 'Las batallas no se ganan con rayos de colores, sino forzando race conditions en los motores del enemigo, parcheando en caliente la estructura cristalina de sus blindajes para volverlos quebradizos como tiza, o inyectando un buffer overflow en el aire respirable para transformar el oxígeno en nitrógeno inerte.',
    narrativeSign: 'Los oficiales tácticos en el puente son depuradores con teclados mecánicos o implantes que gritan firmas de vulnerabilidad y cargan parches de seguridad a contra reloj.'
  }
];

export const UNIVERSAL_CONSTANTS: UniversalConstant[] = [
  {
    id: 'CONST_C',
    name: 'Velocidad de la Luz en el Vacío',
    symbol: 'c',
    nominalValue: '299,792,458 m/s',
    registerAddress: '0x0000_PLANCK_C_REG',
    exploitPotential: 'Sobreescribir c localmente reduce la inercia y permite velocidades pseudolumínicas sin dilatación relativista severa.',
    panicRisk: 'Si c tiende a infinito local, la radiación Hawking destruye el sector de inmediato.',
    layer: 'L0_PLANCK'
  },
  {
    id: 'CONST_G',
    name: 'Constante de Gravitación Universal',
    symbol: 'G',
    nominalValue: '6.67430 × 10⁻¹¹ m³/(kg·s²)',
    registerAddress: '0x0001_PLANCK_G_REG',
    exploitPotential: 'Inversión de signo para proyectores antigravitatorios o aumento focal para compresión molecular y aplastamiento de blindajes.',
    panicRisk: 'Crea singularidades desnudas o microagujeros negros no evaporables.',
    layer: 'L0_PLANCK'
  },
  {
    id: 'CONST_HBAR',
    name: 'Constante Reducida de Planck',
    symbol: 'ℏ',
    nominalValue: '1.05457 × 10⁻³⁴ J·s',
    registerAddress: '0x0002_PLANCK_HBAR_REG',
    exploitPotential: 'Alteración del principio de incertidumbre: permite túnel cuántico macroscópico (atravesar mamparos sólidos).',
    panicRisk: 'Descoherencia cuántica total del cuerpo del inyector en una nube de fermiones dispersos.',
    layer: 'L0_PLANCK'
  },
  {
    id: 'CONST_KB',
    name: 'Constante de Boltzmann',
    symbol: 'k_B',
    nominalValue: '1.380649 × 10⁻²³ J/K',
    registerAddress: '0x0003_PLANCK_KB_REG',
    exploitPotential: 'Modulación de transferencia térmica: congelación instantánea o sobrecalentamiento sin combustión química.',
    panicRisk: 'Violación extrema de la segunda ley: shock térmico reflejado que vaporiza la terminal de compilación.',
    layer: 'L0_PLANCK'
  },
  {
    id: 'CONST_LAMBDA',
    name: 'Constante Cosmológica / Energía Oscura',
    symbol: 'Λ',
    nominalValue: '1.1056 × 10⁻⁵² m⁻²',
    registerAddress: '0x0004_PLANCK_LAMBDA_REG',
    exploitPotential: 'Generación de burbujas de métrica Alcubierre y saltos espaciales al comprimir o expandir el espacio local.',
    panicRisk: 'Desgarro del tejido métrico ("Spacetime Segmentation Fault").',
    layer: 'L0_PLANCK'
  }
];

export const CANONICAL_SYSCALLS: Syscall[] = [
  {
    id: 'sys_thermal_clamp',
    name: 'sys_thermal_clamp',
    signature: 'int sys_thermal_clamp(vector3_t origin, float radius_m, float target_kelvin, int sink_reg)',
    category: 'TERMODINÁMICA',
    description: 'Fuerza una excepción en el registro k_B para congelar el aire o la materia en un radio delimitado, canalizando los julios desplazados hacia el disipador del operador.',
    computeCostMFlops: 4200,
    ramAreaKb: 128,
    leakRiskPercent: 8,
    panicTrigger: 'Si sink_reg se llena o desconecta antes del clamp, la energía refluirá al cerebro del inyector.',
    sensorySensation: 'Chasquido seco como vidrio al romperse; escarcha hexagonal azul cobalto y calor sofocante en las toberas del implante.'
  },
  {
    id: 'sys_inertia_null',
    name: 'sys_inertia_null',
    signature: 'status_t sys_inertia_null(entity_id_t target, float factor, uint32_t duration_ticks)',
    category: 'INERCIA',
    description: 'Modifica la masa inercial de un objetivo a 0.001 de su valor sin alterar su masa gravitacional. Permite giros en ángulo de 90° a 30.000 km/h sin aplastar a la tripulación.',
    computeCostMFlops: 12800,
    ramAreaKb: 512,
    leakRiskPercent: 19,
    panicTrigger: 'Race condition al restaurar la inercia mientras el vector de aceleración no coincide con el marco inercial circundante.',
    sensorySensation: 'Pérdida absoluta de gravedad interna; zumbido de armónicos en los empastes dentales y estática violeta.'
  },
  {
    id: 'sys_metric_pinch',
    name: 'sys_metric_pinch',
    signature: 'int sys_metric_pinch(coord4_t p1, coord4_t p2, float throat_diameter)',
    category: 'ESPACIO_TIEMPO',
    description: 'Puentea dos direcciones de memoria contiguas en el sustrato, doblando la distancia métrica para teletransportar un objeto o crear un microagujero de paso temporal.',
    computeCostMFlops: 98000,
    ramAreaKb: 4096,
    leakRiskPercent: 44,
    panicTrigger: 'Solapamiento de coordenadas p1 y p2: bucle de recurrencia infinita que devora el sector estelar.',
    sensorySensation: 'Distorsión óptica tipo lente gravitacional invertida; olor penetrante a ionización de silicio y vacío.'
  },
  {
    id: 'sys_molecular_patch',
    name: 'sys_molecular_patch',
    signature: 'bool sys_molecular_patch(mesh_t target, uint32_t lattice_type, float binding_energy)',
    category: 'MEMORIA_MATERIA',
    description: 'Reescribe los punteros de enlace atómico en el blindaje de aleación compuesta, incrementando su resistencia a impacto o desarticulándolo para que se rompa al menor roce.',
    computeCostMFlops: 6400,
    ramAreaKb: 256,
    leakRiskPercent: 12,
    panicTrigger: 'Desbordamiento en el array de fermiones: la materia diana se sublima en radiación gamma dura.',
    sensorySensation: 'El metal emite un sonido sordo parecido a miles de agujas vibrando; la pintura se descascara en copos iridiscentes.'
  },
  {
    id: 'sys_entropy_sink',
    name: 'sys_entropy_sink',
    signature: 'void sys_entropy_sink(volume_t vol, float joules_per_tick, register_t dump_target)',
    category: 'TERMODINÁMICA',
    description: 'Válvula de seguridad ontológica. Descarga la entropía acumulada por otros procesos para evitar sobrecalentamiento del sustrato local.',
    computeCostMFlops: 2100,
    ramAreaKb: 64,
    leakRiskPercent: 4,
    panicTrigger: 'Sobrecarga del dump_target: reflujo en cascada que funde circuitos superconductores.',
    sensorySensation: 'Llamarada cegadora en las toberas radiantes de la nave; frío polar en el mamparo de mando.'
  }
];

export const CANONICAL_EXPLOITS: ExploitScript[] = [
  {
    id: 'exploit_race_condition_jump',
    name: 'Race Condition de Salto Espacial',
    authorFaction: 'FOSS_ARCHEOLOGISTS',
    targetDomain: 'Sistemas de Propulsión / Relés de Tránsito',
    computeRequirement: 28.5,
    ramRequirement: 512,
    leakGenerationRate: 8.5,
    panicThreshold: 14.0,
    codePreview: `// Inyección en el bus de coordenadas antes del ACK de la estación
void trigger_jump_exploit(target_ship_t ship) {
    intercept_vector_packet(&ship.nav_bus);
    patch_memory_range(0x7F00, NULL_VECTOR); // Forzar desreferencia inercial
    execute_async(sys_inertia_null, ship.id, 0.0001f);
    // El motor intentará compensar una masa inexistente
}`,
    physicalManifestation: 'La nave enemiga salta sin vector de desaceleración: su casco queda intacto pero su velocidad de escape se descalibra y sale disparada a un ángulo imposible.',
    tacticalApplication: 'Desarmar persecuciones de interceptores de la Inquisición en cinturones de asteroides.',
    catastrophicFailure: 'Si el puntero nulo se propaga al propio slate del arqueólogo, la nave propia pierde las constantes de rozamiento molecular y se desarticula en el vacío.'
  },
  {
    id: 'exploit_buffer_overflow_atmo',
    name: 'Desbordamiento de Búfer Atmosférico',
    authorFaction: 'OUTLAW_DEBUGGER',
    targetDomain: 'Soporte Vital / Composición Molecular',
    computeRequirement: 14.2,
    ramRequirement: 128,
    leakGenerationRate: 15.0,
    panicThreshold: 9.8,
    codePreview: `// Inyectar cadenas extralargas en el descriptor del gas respirable
char overflow_payload[256];
memset(overflow_payload, 0x4E, sizeof(overflow_payload)); // 'N' -> Nitrógeno masivo
sys_write_field(atmo_scrubber.spec, overflow_payload, 4096);
// Sobreescribe el registro de oxígeno por nitrógeno inerte sin fuego`,
    physicalManifestation: 'El aire de la estación se vuelve pesado, azulado y frío en segundos; la tripulación cae inconsciente por hipoxia sin alarmas de descompresión.',
    tacticalApplication: 'Abordaje silencioso de cruceros del Sacerdocio sin dañar los valiosos artefactos a bordo.',
    catastrophicFailure: 'Si la longitud de bytes rompe el descriptor de enlace de hidrógeno, el agua del cuerpo de los propios abordadores se descompone en gas combustible.'
  },
  {
    id: 'exploit_hotpatch_armor',
    name: 'Parche en Caliente Molecular de Blindaje',
    authorFaction: 'FOSS_ARCHEOLOGISTS',
    targetDomain: 'Casco y Blindaje Compuesto',
    computeRequirement: 8.0,
    ramRequirement: 64,
    leakGenerationRate: 3.2,
    panicThreshold: 4.5,
    codePreview: `// Reasignar la tabla de constantes elásticas del carburo de titanio
hook_sys_call(sys_molecular_patch);
uint32_t patch = 0xDEADBEEF; // Romper retículo cristalino
broadcast_exploit_beacon(target_frigate, patch);`,
    physicalManifestation: 'El blindaje cerámico militar enemigo pierde su elasticidad y se vuelve tan quebradizo como vidrio fino; una ráfaga cinética de calibre liviano lo pulveriza.',
    tacticalApplication: 'Permite a pequeñas corbetas arqueológicas de desguace neutralizar acorazados de línea imperiales.',
    catastrophicFailure: 'Retroalimentación inductiva: los sistemas de puntería de la nave agresora se apagan por sobretensión.'
  },
  {
    id: 'exploit_drm_root_curse',
    name: 'Secuestro Criptográfico de Superusuario (DRM Root Lock)',
    authorFaction: 'SACRED_ROOT',
    targetDomain: 'Implantes Neurales / Terminales de Arqueólogos',
    computeRequirement: 35.0,
    ramRequirement: 1024,
    leakGenerationRate: 22.0,
    panicThreshold: 28.0,
    codePreview: `// Bloqueo teocrático por revocación de certificados de existencia
encrypt_planck_access(target_injector.uid, ROOT_PRIESTHOOD_PUBKEY);
revoke_syscall_permissions(ALL_PHYSICAL_REGISTERS);
// Obliga al kernel local a considerar al inyector un proceso intruso`,
    physicalManifestation: 'El inyector sufre convulsiones electromagnéticas; sus pupilas proyectan glifos de error y su implante neural entra en ciclo de reinicio permanente.',
    tacticalApplication: 'Castigo de la Inquisición Ontológica contra arqueólogos disidentes que distribuyen librerías desensambladas.',
    catastrophicFailure: 'Si la clave privada del sacerdote está desincronizada con el relé orbital, el propio sacerdote sufre amnesia cuántica retrógrada.'
  }
];

export const CANONICAL_FACTIONS: Faction[] = [
  {
    id: 'FOSS_COLLECTIVE',
    name: 'La Alianza FOSS / Red de Arqueología Abierta',
    shortName: 'Arqueólogos del Kernel Libre',
    ideology: 'El Sustrato de Planck es el patrimonio genético y operativo del universo. Nadie tiene derecho a poner derechos de autor sobre la gravedad o cobrar peajes por la termodinámica. Todo artefacto precursor debe ser desensamblado, documentado y publicado con licencias abiertas.',
    drmStance: 'Anti-DRM radical. Desarrollan librerías FOSS (`lib_planck_foss`), exploits de desclasificación y firmwares caseros para saltarse los bloqueos sagrados.',
    motto: '"Compilación Libre, Realidad Sin Llaves."',
    compilerTech: 'Slates de grafeno modificado, implantes artesanales refrigerados por nitrógeno líquido casero, interfaces hápticas de segunda mano.',
    archeologyMethod: 'Excavaciones no invasivas con escaneo de bus cuántico; dumpers de memoria para extraer librerías precursores antes de que la Inquisición las queme o las selle en sus templos.',
    keyArchetypes: [
      {
        role: 'Ingeniera de Desensamblado',
        title: 'Depuradora de Campo',
        description: 'Especialista en conectar terminales a ruinas vivas y extraer microcódigo precursor bajo fuego enemigo.',
        typicalImplants: 'Coprocesador neural de 64 núcleos con puerto de fibra suboccipital y radiador de calor en el omóplato.'
      },
      {
        role: 'Capitán de Expedición',
        title: 'Arqueólogo de Vacío',
        description: 'Pilota cargueros adaptados con bahías de análisis y laboratorios de decodificación limpia.',
        typicalImplants: 'Prótesis táctiles con transductores de bus directo a la materia.'
      }
    ],
    combatDoctrine: 'Guerra asimétrica de exploits: inyección remota de latencia, saturación de búfer en sensores enemigos y sabotaje de constantes de inercia.',
    badgeColor: 'emerald'
  },
  {
    id: 'SACRED_ROOT',
    name: 'La Ortodoxia Sacra / El Sacerdocio del Kernel Divino',
    shortName: 'Los Guardianes del Root',
    ideology: 'El universo fue compilado por los Arquitectos Originales (la Deidad Compiladora). Los seres vivos son meros "usuarios invitados" (guest accounts). Tocar el código de la realidad sin unción sacerdotal es un sacrilegio ontológico que corrompe el cosmos. La humanidad solo sobrevivirá si obedece las licencias divinas.',
    drmStance: 'Monopolio teocrático estricto. Implementan "DRM Ontológico": sellos criptográficos que bloquean el uso del sustrato a menos que se pague el diezmo y se reciba el token de autorización.',
    motto: '"Que solo la Raíz Ejecute. Amén."',
    compilerTech: 'Báculos ceremoniales con superconductores dorados, mitras con antenas de sincronía con relés orbitales y vestiduras de kevlar térmico.',
    archeologyMethod: 'Cruzadas de contención: sitian yacimientos precursores, purgan a los arqueólogos civiles y sellan las estructuras bajo monolitos de aislamiento cuántico.',
    keyArchetypes: [
      {
        role: 'Inquisidor del Código',
        title: 'Sysadmin Pontificio',
        description: 'Oficial fanático encargado de ejecutar sentencias `kill -9` sobre la tripulación de naves herejes mediante ataques de DRM.',
        typicalImplants: 'Ojo derecho cibernético con criptógrafo cuántico de firmas sagradas y cetro de inyección masiva.'
      },
      {
        role: 'Monje Litúrgico',
        title: 'Compilador de Oraciones',
        description: 'Canta scripts monolíticos en pseudocódigo arcaico que activan los escudos de plasma de las catedrales estelares.',
        typicalImplants: 'Laringe sintetizadora de frecuencias armónicas de Planck.'
      }
    ],
    combatDoctrine: 'Fuerza bruta criptográfica: campos de aislamiento de root, apagado de reactores herejes revocando sus certificados y bombardeo de kernel panics selectivos.',
    badgeColor: 'amber'
  },
  {
    id: 'VOID_CORSAIRS',
    name: 'El Sindicato del Buffer Libre (Contrabandistas)',
    shortName: 'Corsarios del Vacío',
    ideology: 'La filosofía de los arqueólogos es ingenua y la de los curas es tiranía. El sustrato es una mina de oro. Quien tenga el exploit más sucio se queda con el botín. Venden librerías zero-day en el mercado negro.',
    drmStance: 'Pragmático: craquean llaves del Sacerdocio para revenderlas a contrabandistas o venden parches defectuosos que dejan memory leaks mortales.',
    motto: '"Sin Logs, Sin Testigos, Sin Segfault."',
    compilerTech: 'Implantes ilegales de grado militar robados, terminales desechables que se autodestruyen tras inyectar exploits.',
    archeologyMethod: 'Dinamita cuántica: revientan cámaras precursores sin importar la fragmentación espacial ni los riesgos de colapso.',
    keyArchetypes: [
      {
        role: 'Piratilla de Inercia',
        title: 'Inyector de Asalto',
        description: 'Salta al casco de naves mercantes para alterar manualmente su vector cinético y desviar su rumbo hacia nidos piratas.',
        typicalImplants: 'Garras de sujeción molecular y visor de depuración táctico con firmas de memoria en tiempo real.'
      }
    ],
    combatDoctrine: 'Ataques relámpago con sobrecargas de RAM de área para aturdir los sistemas enemigos antes de huir.',
    badgeColor: 'cyan'
  }
];

export const CANONICAL_STAR_SYSTEMS: StarSystem[] = [
  {
    id: 'SYS_01_AETHEL',
    name: 'Sector Aethelgard (El Núcleo Catedral)',
    coordinates: 'Grid 00.12 // Sector Central',
    planckBandwidth: 'ULTRA_ALTO',
    bandwidthFlops: '12,500 PFlops/m³',
    kernelStabilityPercent: 99.4,
    drmPolicy: 'DRM_ORTODOXO_ESTRICTO',
    politicalControl: 'Soberanía del Sacerdocio del Kernel Divino',
    precursorRuins: 'La Megaestructura "Bastión 0x0": un anillo estelar de un millón de kilómetros que actúa como servidor DNS primario del espacio-tiempo.',
    ftlRoutingLatency: '0.04 microsegundos (Canal Prioritario Sacerdotal)',
    economicModel: 'Economía de diezmo ontológico: las colonias pagan por horas de gravedad estable y luz solar sin latencia.',
    knownAnomalies: ['Patrullas de Fragatas-Inquisidoras que escanean firmas cerebrales buscando depuradores sin licencia.']
  },
  {
    id: 'SYS_02_NAUTILUS',
    name: 'Nebulosa de Tychos (El Fuerte Libre)',
    coordinates: 'Grid 84.77 // Periferia Oscura',
    planckBandwidth: 'ESTÁNDAR',
    bandwidthFlops: '1,200 PFlops/m³',
    kernelStabilityPercent: 88.2,
    drmPolicy: 'FOSS_LIBRE',
    politicalControl: 'Comuna de Arqueólogos y Estaciones Astillero Autónomas',
    precursorRuins: 'El Archivo Fragmentado de Xylar: biblioteca sumergida en el interior de una luna de hielo donde yacen 40.000 terabytes de syscalls precursores sin catalogar.',
    ftlRoutingLatency: '2.8 segundos (Red de repetidores P2P de código abierto)',
    economicModel: 'Cooperativa de conocimiento: intercambio de piezas de desguace, comida sintética y parches de blindaje libres.',
    knownAnomalies: ['Residuos estáticos flotantes donde la gravedad se invierte al azar debido a excavaciones históricas descuidadas.']
  },
  {
    id: 'SYS_03_MALFORM',
    name: 'El Arrecife de Malform (Falla de Planck)',
    coordinates: 'Grid 99.99 // Frontera Muerta',
    planckBandwidth: 'FRONTERA_CORRUPTA',
    bandwidthFlops: '140 PFlops/m³ (Con severo throttling)',
    kernelStabilityPercent: 41.5,
    drmPolicy: 'ANARQUÍA_FRAGMENTADA',
    politicalControl: 'Sin gobierno; territorio de corsarios, chatarreros desesperados y cultos del Crash',
    precursorRuins: 'El Colapso de Ouroboros: restos de una flota de batalla primigenia que provocó un Kernel Panic global hace cien mil años.',
    ftlRoutingLatency: 'No disponible (Rutas de salto rotas; las naves que intentan FTL sufren desmembramiento temporal)',
    economicModel: 'Extracción de cristales de memoria corrupta y contrabando de reliquias zero-day.',
    knownAnomalies: [
      'Lag físico visible: el sonido tarda 30 segundos en oírse y las luces proyectan sombras con 5 segundos de retraso.',
      'Fantasmas de segmentación: ecos de naves destruidas que repiten su maniobra de muerte en bucles eternos.'
    ]
  }
];

export const INITIAL_LORE_ITEMS: LoreItem[] = [
  {
    id: 'ITEM_01',
    name: 'El Prisma de Turing-Planck (Terminal Arqueológica)',
    category: 'artefacto',
    precursorArchitecture: 'Capa 1: Relé de Bus Físico de Alta Impedancia',
    technicalSpecs: 'Ancho de banda: 450 TFlops/s; Disipador pasivo de grafeno con purga de nitrógeno.',
    loreAndDiscovery: 'Recuperado en la tumba orbital de Kepler-186 por la arqueóloga independiente Sura Vance. La Inquisición puso precio a su cabeza tras publicarse el firmware desensamblado.',
    exploitMechanic: 'Permite inyectar scripts de hasta 8 hilos simultáneos en un radio de 50 metros sin disparar las alarmas de DRM del Sacerdocio.',
    failureMode: 'Si el operador compila más de 30 segundos continuos, el disipador se satura y transfiere 400°C al brazo del usuario.',
    narrativeHook: 'El prisma contiene una clave SSH primigenia que podría abrir el Bastión 0x0 del Sacerdocio.',
    createdAt: '2026-09-03'
  },
  {
    id: 'ITEM_02',
    name: 'El Parche de Desfase de Vórtice (Exploit FOSS-204)',
    category: 'exploit',
    precursorArchitecture: 'Capa 2: Driver de Métrica Espacio-Temporal',
    technicalSpecs: 'Consumo: 18.2 GFlops/m³; RAM requerida: 256 MB/m³; Tasa de fuga: 4.1%/min.',
    loreAndDiscovery: 'Codificado colectivamente por la red abierta tras la masacre de la estación Telos, para permitir a cargueros lentos evadir torpedos de fusión de la Inquisición.',
    exploitMechanic: 'Desfasa 0.4 metros la firma espacial del casco durante 5 segundos; los proyectiles enemigos atraviesan el espacio ocupado por la nave sin interactuar con sus moléculas.',
    failureMode: 'Desalineación de retorno: si el proceso termina mientras la nave gira, el casco reaparece con tensión molecular extrema, deformando mamparos.',
    narrativeHook: 'Un buque de evacuación civil intentó usarlo y reapareció fusionado a medias con un asteroide helado.',
    createdAt: '2026-09-03'
  }
];

export const CANONICAL_CHARACTERS: NovelCharacter[] = [
  {
    id: 'CHAR_SURA',
    name: 'Sura Vance',
    factionId: 'FOSS_COLLECTIVE',
    role: 'Depuradora de Campo & Arqueóloga de Vacío',
    summary: 'Ex-becaria de la Academia Pontificia expulsada por desensamblar el DRM de un relé orbital. Ahora lidera rescates de librerías en ruinas periféricas.',
    signatureImplants: 'Coprocesador neural suboccipital de 64 hilos, aletas de grafeno en la clavícula derecha con microbomba de fluorocarbono criogénico.',
    typicalAbilities: ['sys_thermal_clamp', 'sys_inertia_nullify', 'exploit_thermo_inversion'],
    notes: 'Nunca compila sin conectar su tubo criogénico al mono presurizado. Odia las oraciones litúrgicas de la Inquisición.'
  },
  {
    id: 'CHAR_KAELEN',
    name: 'Inquisidor Kaelen Vex',
    factionId: 'SACRED_ROOT',
    role: 'Sysadmin Pontificio de Tercera Orden',
    summary: 'Oficial implacable de la Ortodoxia Sacra al mando de la corbeta de patrulla "Excomunión 0x1". Persigue a Sura por robo de firmware de raíz.',
    signatureImplants: 'Ojo cibernético con HUD criptográfico de firmas sagradas, guantelete de inyección con bobinas superconductoras doradas.',
    typicalAbilities: ['exploit_drm_root_curse', 'sys_thermal_clamp'],
    notes: 'Trata los exploits FOSS como plagas bacterianas en el cuerpo de Dios. No dispara torpedos si puede forzar un kernel panic remoto en la nave hereje.'
  },
  {
    id: 'CHAR_TORIN',
    name: 'Torin "Null" Reyes',
    factionId: 'VOID_CORSAIRS',
    role: 'Piratilla de Inercia & Piloto Contrabandista',
    summary: 'Veterano cínico que perdió un brazo por un segfault en una excavación ilegal. Pilota el carguero modificado "Buffer Overflow".',
    signatureImplants: 'Brazo mecánico de aleación densa con sujeción de bus directo y disipador de emergencia de descarte rápido.',
    typicalAbilities: ['sys_inertia_nullify', 'exploit_kinetic_phase_drift', 'exploit_molecular_brittle'],
    notes: 'Solo ayuda a Sura si el pago cubre el nitrógeno líquido y el mantenimiento de sus inyectores robados.'
  },
  {
    id: 'CHAR_MARA',
    name: 'Dra. Mara Lin',
    factionId: 'FOSS_COLLECTIVE',
    role: 'Teórica de Planck & Decodificadora de Ruinas',
    summary: 'La mayor experta viva en arquitectura de la Capa 0. Vive recluida en la Nebulosa de Tychos tras descubrir la verdad sobre el Bastión 0x0.',
    signatureImplants: 'Prótesis retinianas de barrido espectral y conexión táctil directa a registros de memoria sólida.',
    typicalAbilities: ['sys_spacetimemetric_warp', 'sys_quantum_tunnel'],
    notes: 'Sufre migrañas crónicas causadas por un memory leak antiguo que inhaló en las ruinas de Xylar.'
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'CHAP_01',
    number: 1,
    title: 'La Huella en el Bus de Planck',
    status: 'CANON',
    systemId: 'SYS_01_AETHEL',
    locationDetails: 'Escombros orbitales de la Boya Litúrgica 404, espacio de Aethelgard',
    characterIds: ['CHAR_SURA', 'CHAR_KAELEN'],
    abilityIds: ['sys_thermal_clamp', 'exploit_thermo_inversion'],
    coherenceChecklist: {
      entropyRespected: true,
      bandwidthChecked: true,
      memoryLeaksCleaned: true,
      drmRulesRespected: true
    },
    authorNotes: 'Presentación de la regla de entropía: Sura debe usar su disipador clavicular al congelar la compuerta. Kaelen detecta la firma por el calor expulsado al espacio, no por magia.',
    content: `El frío del espacio no era el problema; el problema era que la materia recordaba cómo calentarse.

Sura Vance apoyó los guantes magnéticos sobre el anillo exterior de la Boya 404. Bajo tres centímetros de titanio corroído, el bus de Planck del sector vibraba con la firma inconfundible de una cerradura criptográfica de la Ortodoxia Sacra. El indicador de su visera parpadeaba en amarillo ámbar: ANCHO DE BANDA LOCAL 12,500 PFLOPS/M³. Máxima fidelidad métrica. Un feudo imperial donde cada metro cúbico tenía propietario y diezmo.

—Kestrel-9, tengo enlace —susurró por el canal láser de corto alcance—. La compuerta está sellada con un certificado de superusuario. Si fuerzo la cerradura con soplete, el DRM de la boya disparará un pulso electromagnético que freirá la memoria del módulo.

—No tenemos tiempo para sutilezas, Sura —la voz de Torin crujió entre estática limpia—. Los sensores pasivos captan una firma subespacial entrando por el relé tres. Es la Inquisición. Vienen en una corbeta de patrulla. Tienes menos de cuatro minutos antes de que sus escaners de firmas de Planck te barran.

Sura respiró hondo. El aire del reciclador sabía a cobre y ozono. Conectó el umbilical flexible de su mono presurizado al puerto de refrigeración de la terminal manual. Sintió la punzada familiar en la base del cráneo cuando su coprocesador neural de 64 núcleos tomó el control del bus óptico.

En su campo de visión no había estrellas, sino líneas de código de bajo nivel.

\`\`\`c
// sys_thermal_clamp: Forzar congelación rápida del perno molecular
sys_thermal_clamp(door_lock.origin, 0.15, 4.2, SINK_CLAVICLE_0);
\`\`\`

Apretó los dientes. No existía el milagro. El calor no desaparecía.

Al ejecutar la syscall, el perno de carburo de la compuerta bajó instantáneamente a cuatro Kelvin, volviéndose quebradizo como escarcha seca. Pero a cambio, doscientos kilojulios de energía residual fueron canalizados en retroceso hacia las aletas de grafeno de su hombro derecho.

El radiador de su espalda se encendió en un resplandor al rojo cereza en el vacío. La microbomba de fluorocarbono aulló en su oído, bombeando refrigerante helado para evitar que el calor le cocinara el tejido muscular de la escápula. Sura soltó un quejido sordo.

—Perno quebrado —jadeó, golpeando la escotilla con la culata de su percutor cinético. El metal helado se hizo añicos con un chasquido sordo transmitido por los huesos de su brazo—. Entrando al compartimento de datos.

A diez mil kilómetros de allí, en el puente de la *Excomunión 0x1*, el Inquisidor Kaelen Vex alzó la mirada de su visor litúrgico. Un punto bermellón brillaba en la oscuridad de los escombros.

—Anomalía térmica no autorizada en la Boya 404 —anunció el oficial de sensores pontificio—. Registros de Boltzmann violados sin certificado sacerdotal.

Kaelen sonrió sin mover un músculo de su rostro pálido.

—No es un fallo de hardware. Es un depurador. Aceleren los impulsores de inercia y preparen el script de secuestro de root. Hoy vamos a revocar una licencia de vida.`,
    wordCount: 485,
    updatedAt: '2026-09-03 10:45',
    diegeticCycle: 3042.188,
    diegeticDateLabel: 'Ciclo 3042.188 // Planck Tick 0x4F'
  },
  {
    id: 'CHAP_02',
    number: 2,
    title: 'El Arrecife de Malform y el Lag Métrico',
    status: 'BORRADOR',
    systemId: 'SYS_03_MALFORM',
    locationDetails: 'Cuadrante del Naufragio Ouroboros, Arrecife de Malform',
    characterIds: ['CHAR_SURA', 'CHAR_TORIN'],
    abilityIds: ['exploit_kinetic_phase_drift', 'sys_inertia_nullify'],
    coherenceChecklist: {
      entropyRespected: true,
      bandwidthChecked: false,
      memoryLeaksCleaned: false,
      drmRulesRespected: true
    },
    authorNotes: 'Mostrar el combate asimétrico con baja capacidad de cálculo: el espacio tiene 140 PFlops/m³, por lo que los torpedos sufren saltos de framerate y el sonido llega con eco diferido en los cascos.',
    content: `El Arrecife de Malform no era un lugar para los débiles de estómago, ni para navegantes acostumbrados a que la gravedad fuera una función continua y predecible.

El *Buffer Overflow*, el carguero oxidado de Torin Reyes, temblaba como si navegara sobre un lecho de grava métrica. A través de la tronera blindada, Sura observaba los restos de una corbeta acorazada de hacía tres siglos flotando en pedazos. Lo aterrador no era el metal retorcido, sino los fantasmas de memoria: el destello del reactor de la nave destruida volvía a brillar cada noventa segundos en un bucle temporal sin masa, un memory leak cósmico que nadie había liberado jamás.

—Aquí la física tiene hipo —advirtió Torin, tecleando furiosamente sobre su consola reconfigurada con piezas de contrabando—. Ancho de banda: 140 PFlops. Es una miseria. Si compilas algo más pesado que una llamada básica de inercia, la realidad colapsará el búfer y nos quedaremos clavados en el espacio como moscas en ámbar.

—La Inquisición nos sigue el rastro —respondió Sura, revisando las lecturas del Prisma de Turing-Planck asegurado a su pecho—. Saben que rescatamos la tabla de certificados de la Boya 404.

—Pues que vengan. En este vertedero sus misiles guiados no pueden calcular trayectorias suaves. La matriz no da abasto para procesar el cálculo diferencial.

Un zumbido sordo recorrió los mamparos. Dos torpedos de fragmentación cruzaron el umbral del sector. Pero en lugar de volar en arcos elegantes, los proyectiles se desplazaban a tirones: avanzaban cien metros en un instante, se congelaban durante dos segundos mientras el sustrato procesaba el vector de masa, y volvían a saltar en un parpadeo visual.

—¡Nos tienen fijados! —gritó Sura.

—No mientras yo tenga un exploit de fase —rugió Torin, golpeando el activador de su prótesis mecánica.

El exploit FOSS-204 se cargó en la RAM local de la nave. Durante cinco latidos de corazón, las moléculas del casco del *Buffer Overflow* dejaron de compartir colisión con el universo visible...`,
    wordCount: 320,
    updatedAt: '2026-09-03 11:20',
    diegeticCycle: 3042.195,
    diegeticDateLabel: 'Ciclo 3042.195 // Planck Tick 0x8A'
  }
];
