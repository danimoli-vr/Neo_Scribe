import { NovelCharacter, StarSystem, Syscall, ExploitScript, Faction, LoreItem } from '../types';
import { 
  CANONICAL_CHARACTERS, 
  CANONICAL_SYSCALLS, 
  CANONICAL_EXPLOITS, 
  CANONICAL_STAR_SYSTEMS, 
  CANONICAL_FACTIONS, 
  CANONICAL_AXIOMS, 
  UNIVERSAL_CONSTANTS,
  INITIAL_LORE_ITEMS 
} from './canonicalLore';

export type ConceptCategory = 
  | 'PERSONAJE' 
  | 'TECNOLOGIA' 
  | 'PLANETA' 
  | 'FACCION' 
  | 'AXIOMA' 
  | 'ARTEFACTO';

export interface ConceptTerm {
  id: string;
  name: string;
  category: ConceptCategory;
  badge: string;
  codeSnippet?: string;
  shortDescription: string;
  hardRule?: string; // Regla de coherencia o física obligatoria para la narrativa
  aliases: string[]; // Variaciones o términos que activan el autocompletado
  relatedFaction?: string;
  tags: string[];
}

// Built-in dictionary terms based on the universe's hard sci-fi canon
export const CANONICAL_CONCEPTS: ConceptTerm[] = [
  // --- AXIOMAS Y REGLAS DE PLANCK ---
  {
    id: 'axiom_entropia',
    name: 'Conservación de Entropía (Ley de Planck-Boltzmann)',
    category: 'AXIOMA',
    badge: 'Axioma L0',
    codeSnippet: '// Axioma 1: Toda alteración térmica exige radiador adyacente',
    shortDescription: 'No existe generación espontánea ni magia. Enfriar un volumen exige expulsar el calor equivalente mediante radiadores.',
    hardRule: 'Los personajes SIEMPRE deben describir la disipación térmica (aletas de grafeno al rojo vivo, toberas de fluorocarbono).',
    aliases: ['entropía', 'conservación de entropía', 'disipador', 'disipadores', 'aleta de grafeno', 'radiador térmico'],
    tags: ['física', 'termodinámica', 'coherencia', 'disipación']
  },
  {
    id: 'axiom_throttling',
    name: 'Throttling de Planck & Lag en la Realidad',
    category: 'AXIOMA',
    badge: 'Axioma L0',
    codeSnippet: '// Axioma 2: Ancho de banda limitado por metro cúbico',
    shortDescription: 'El tejido espaciotemporal tiene tasa de refresco finita. Si se satura el cómputo, la luz se retarda y los proyectiles sufren lag visual.',
    hardRule: 'Si dos naves compilan scripts simultáneos en el mismo sector, describe proyectiles congelados en microsegundos (framerate drop).',
    aliases: ['throttling', 'tasa de refresco', 'lag', 'ancho de banda', 'latencia métrica'],
    tags: ['física', 'ancho de banda', 'lag', 'computación']
  },
  {
    id: 'axiom_memory_leaks',
    name: 'Memory Leaks Ontológicos & Ruinas Fragmentadas',
    category: 'AXIOMA',
    badge: 'Axioma L0',
    codeSnippet: 'free_metric_tensor(void* region);',
    shortDescription: 'Cerrar una inyección sin liberar el búfer deja residuos estáticos donde la gravedad parpadea o la luz se refracta como espejismo.',
    hardRule: 'Las ruinas precursores no tienen polvo ordinario: tienen fugas de memoria con náuseas acústicas y gravedad flotante.',
    aliases: ['memory leak', 'memory leaks', 'fuga de memoria', 'residuos estáticos', 'fragmentación'],
    tags: ['precursores', 'anomalía', 'ruinas', 'memoria']
  },
  {
    id: 'axiom_kernel_panic',
    name: 'Kernel Panic Espaciotemporal (SIGSEGV Cósmico)',
    category: 'AXIOMA',
    badge: 'Axioma L0',
    codeSnippet: 'KERNEL_PANIC: 0xDEAD_BEEF_SIGSEGV_SPACE',
    shortDescription: 'Fallo crítico irreparable en el compilador cuántico. Colapsa la física local desintegrando al operador o abriendo microvacíos.',
    hardRule: 'Un error sintáctico no echa chispas inofensivas: vaporiza implantes o transforma la carne en un plano bidimensional.',
    aliases: ['kernel panic', 'panic', 'sigsegv', 'desbordamiento'],
    tags: ['peligro', 'fallo', 'muerte', 'ciberdelito']
  },

  // --- TECNOLOGÍAS & HARDWARE TÁCTICO ---
  {
    id: 'tech_compilador_vacio',
    name: 'Compilador de Vacío (Vacuum Compiler)',
    category: 'TECNOLOGIA',
    badge: 'Hardware',
    codeSnippet: 'vcompile --arch=planck-l0 --opt=entropy-damp',
    shortDescription: 'Dispositivo táctico que traduce órdenes en lenguaje de ensamblador de Planck a fluctuaciones energéticas en el vacío.',
    hardRule: 'Requiere alimentación de bus superconductor y acoplamiento neuro-óptico directo.',
    aliases: ['compilador', 'compilador de vacío', 'vcompile', 'consola de inyección'],
    tags: ['hardware', 'herramienta', 'código']
  },
  {
    id: 'tech_aletas_grafeno',
    name: 'Aletas Radiantes de Grafeno Monoatómico',
    category: 'TECNOLOGIA',
    badge: 'Disipador',
    codeSnippet: 'HEAT_EXCHANGER_STATUS: 940 KELVIN [EMITTING]',
    shortDescription: 'Placas retráctiles fijadas a la clavícula, omóplatos o armadura que brillan en rojo cereza al evacuar calorías al espacio.',
    hardRule: 'Si se bloquean mecánicamente, el usuario sufre quemaduras de tercer grado en los tejidos adyacentes al implante.',
    aliases: ['aletas de grafeno', 'disipador de grafeno', 'radiadores de hombro', 'aleta térmica'],
    tags: ['hardware', 'implante', 'protección', 'calor']
  },
  {
    id: 'tech_prisma_turing',
    name: 'Prisma de Turing-Planck',
    category: 'ARTEFACTO',
    badge: 'Reliquia',
    codeSnippet: 'REFRACT_COMPUTE_STREAM(0x0002_PLANCK_HBAR_REG)',
    shortDescription: 'Monolito de silicio-diamante precursor que descompone llamadas al Kernel en armónicos paralelos sin coste en latencia.',
    hardRule: 'Emite una luminiscencia azulada fría que inhabilita los radares convencionales a 50 metros.',
    aliases: ['prisma', 'prisma de turing', 'prisma de turing-planck'],
    tags: ['precursor', 'reliquia', 'overclock']
  },

  // --- SYSCALLS CANÓNICAS ---
  {
    id: 'call_thermal_clamp',
    name: 'sys_thermal_clamp()',
    category: 'TECNOLOGIA',
    badge: 'Syscall L0',
    codeSnippet: 'syscall(0x01A, &target_cubic_meter, 2.7_KELVIN);',
    shortDescription: 'Abrazadera térmica de Planck. Detiene la agitación molecular de un objetivo drenando 450 MFlops de cálculo.',
    hardRule: 'Descarga térmica inmediata: 120 kilojulios expulsados por la tobera del inyector.',
    aliases: ['sys_thermal_clamp', 'thermal clamp', 'abrazadera térmica', 'congelación molecular'],
    tags: ['syscall', 'termodinámica', 'habilidad', 'combate']
  },
  {
    id: 'call_inertia_nullify',
    name: 'sys_inertia_nullify()',
    category: 'TECNOLOGIA',
    badge: 'Syscall L0',
    codeSnippet: 'syscall(0x02B, &ship_hull, TENSOR_INERTIA_ZERO);',
    shortDescription: 'Anulación inercial instantánea. Permite virajes de 90 grados a velocidades de crucero sin despedazar a la tripulación.',
    hardRule: 'Riesgo de inversión inercial súbita si la llamada sufre interrupción por pulso EMP.',
    aliases: ['sys_inertia_nullify', 'inertia nullify', 'anulación inercial', 'inercia cero'],
    tags: ['syscall', 'inercia', 'navegación', 'combate']
  },
  {
    id: 'call_spacetimemetric_warp',
    name: 'sys_spacetimemetric_warp()',
    category: 'TECNOLOGIA',
    badge: 'Syscall L0',
    codeSnippet: 'syscall(0x03C, &minkowski_metric, CURVATURE_ALCUBIERRE);',
    shortDescription: 'Curvatura métrica de Minkowski para burbujas pseudolumínicas o escudos gravitacionales repulsores.',
    hardRule: 'Exige un mínimo de 1.2 GFlops y produce microvórtices ópticos con distorsión de arcoíris.',
    aliases: ['sys_spacetimemetric_warp', 'metric warp', 'deformación métrica', 'curvatura minkowski'],
    tags: ['syscall', 'espacio-tiempo', 'defensa', 'movimiento']
  },

  // --- EXPLOITS TÁCTICOS ---
  {
    id: 'exp_thermo_inversion',
    name: 'exploit_thermo_inversion()',
    category: 'TECNOLOGIA',
    badge: 'Exploit FOSS',
    codeSnippet: 'inject_exploit("thermo_inversion_v2.bin", target_shield);',
    shortDescription: 'Sobrecarga las toberas del enemigo forzando a sus propios radiadores a reabsorber calor en lugar de expulsarlo.',
    hardRule: 'Causa que la cabina enemiga alcance 200°C en segundos y sus blindajes humeen vapor recalentado.',
    aliases: ['exploit_thermo_inversion', 'inversión termodinámica', 'inversión carnot', 'retro-calor'],
    tags: ['exploit', 'ataque', 'termodinámica']
  },
  {
    id: 'exp_kinetic_phase_drift',
    name: 'exploit_kinetic_phase_drift()',
    category: 'TECNOLOGIA',
    badge: 'Exploit FOSS',
    codeSnippet: 'inject_exploit("kinetic_tunneling_33.bin", projectile_mag);',
    shortDescription: 'Aumenta ℏ localmente para permitir que los proyectiles cinéticos hagan túnel cuántico a través de mamparos macizos.',
    hardRule: 'Las balas emiten un destello azul violeta y cruzan escudos como si fuesen de humo antes de solidificar.',
    aliases: ['exploit_kinetic_phase_drift', 'desfase cinético', 'túnel cuántico', 'fase cinética'],
    tags: ['exploit', 'balística', 'ataque']
  },
  {
    id: 'exp_drm_root_curse',
    name: 'exploit_drm_root_curse()',
    category: 'TECNOLOGIA',
    badge: 'Exploit FOSS',
    codeSnippet: 'revoke_license_key(0x00FF_AUTHORITY_ROOT);',
    shortDescription: 'Inyecta un certificado criptográfico corrupto en el bus de la Inquisición, forzando apagado de emergencia de motores.',
    hardRule: 'Los sistemas imperiales caen en bucle de autenticación durante 12 segundos.',
    aliases: ['exploit_drm_root_curse', 'maldición del root', 'maldición drm', 'revocación criptográfica'],
    tags: ['exploit', 'guerra electrónica', 'inquisición']
  },

  // --- PLANETAS, SISTEMAS & LOCALIZACIONES ---
  {
    id: 'loc_aethelgard',
    name: 'Aethelgard Prime (Sector Capital)',
    category: 'PLANETA',
    badge: 'Sistema Estelar',
    codeSnippet: 'LOC_COORD: 0x001_AETHELGARD_PRIME',
    shortDescription: 'Sede del Trono Teocrático y la Basílica del Root. Máxima densidad de cálculo, satélites de escaneo DRM implacables.',
    hardRule: 'Toda inyección sin firma oficial del Sacro Sello es detectada en 18 milisegundos.',
    aliases: ['aethelgard', 'aethelgard prime', 'sector aethelgard', 'basílica del root'],
    tags: ['astrografía', 'ortodoxia', 'capital', 'estricto']
  },
  {
    id: 'loc_tychos',
    name: 'Nebulosa de Tychos (Velo de Planck)',
    category: 'PLANETA',
    badge: 'Sector Denso',
    codeSnippet: 'LOC_COORD: 0x044_TYCHOS_NEBULA',
    shortDescription: 'Zona de gas ionizado y alta dispersión métrica. La luz viaja con retraso notable y los corsarios cazan barcos de carga.',
    hardRule: 'El combate en la nebulosa exige predecir trayectorias porque los sensores visuales muestran imágenes desfasadas 2 segundos.',
    aliases: ['tychos', 'nebulosa de tychos', 'nube de tychos', 'velo de planck'],
    tags: ['astrografía', 'corsarios', 'lag', 'niebla']
  },
  {
    id: 'loc_malform',
    name: 'Arrecife de Malform (Cementerio 0xDEAD)',
    category: 'PLANETA',
    badge: 'Sector Corrupto',
    codeSnippet: 'LOC_COORD: 0x999_MALFORM_REEF',
    shortDescription: 'Restos de una batalla naval de hace 300 años. Saturado de memory leaks milenarios y fragmentación espaciotemporal severa.',
    hardRule: 'No se puede navegar sin sensores de coherencia activos so pena de toparse con bolsas de gravedad inversa.',
    aliases: ['malform', 'arrecife de malform', 'sector malform', 'cementerio de chatarra'],
    tags: ['astrografía', 'peligro', 'memory leak', 'ruinas']
  },
  {
    id: 'loc_bastion_0x0',
    name: 'Bastión 0x0 (Refugio FOSS)',
    category: 'PLANETA',
    badge: 'Asteroide Libre',
    codeSnippet: 'LOC_COORD: 0x000_BASTION_DEEP_VOID',
    shortDescription: 'Mega-asteroide hueco reconvertido en refugio pirata y universidad clandestina de depuradores del Colectivo FOSS.',
    hardRule: 'Zona libre de DRM; las naves que atracan tienen permiso para compilar cualquier exploit sin censura.',
    aliases: ['bastión 0x0', 'bastion 0x0', 'bastión', 'refugio foss'],
    tags: ['astrografía', 'foss', 'rebeldes', 'seguro']
  },

  // --- FACCIONES ---
  {
    id: 'fac_sacred_root',
    name: 'La Ortodoxia Sacra del Root',
    category: 'FACCION',
    badge: 'Teocracia Militar',
    codeSnippet: '// Dogma: El Kernel es Dios, el DRM es la Salvación',
    shortDescription: 'Gobernantes de los mundos nucleares. Creen que el código fuente del universo fue revelado por los Precursores a su jerarquía eclesiástica.',
    hardRule: 'Sus agentes portan cetros de censura y vestiduras ignífugas de fibra de cobre.',
    aliases: ['ortodoxia', 'ortodoxia sacra', 'sacred root', 'inquisición', 'inquisidores'],
    tags: ['facción', 'enemigo', 'imperio', 'dogma']
  },
  {
    id: 'fac_foss_collective',
    name: 'El Colectivo FOSS (Free Open Substrate Software)',
    category: 'FACCION',
    badge: 'Revolucionarios',
    codeSnippet: '// Filosofía: Acceso Root Universal e Incondicional',
    shortDescription: 'Ingenieros rebeldes, depuradores clandestinos y ex-académicos que luchan por liberar las claves criptográficas a la población.',
    hardRule: 'Comparten exploits mediante boyas cuánticas de código abierto y desprecian los monopolios de cálculo.',
    aliases: ['colectivo foss', 'foss', 'depuradores libres', 'rebeldes'],
    tags: ['facción', 'aliado', 'hackers', 'libertad']
  },
  {
    id: 'fac_corsarios',
    name: 'Corsarios del Vacío & Gremios de Chatarra',
    category: 'FACCION',
    badge: 'Mercenarios',
    codeSnippet: '// Lema: Si compila en tu nave, es de tu propiedad',
    shortDescription: 'Piratas y mercenarios espaciales que modifican toberas térmicas ilegales y comercian con reliquias precursores extraídas de pecios.',
    hardRule: 'Negocian con cualquiera pero disparan a las fragatas de la Ortodoxia en cuanto divisan sus sellos.',
    aliases: ['corsarios', 'corsarios del vacío', 'piratas', 'chatarreros'],
    tags: ['facción', 'mercenarios', 'borde exterior']
  }
];

// Helper to consolidate all concepts (canonical + user characters + star systems)
export function getUnifiedConceptDictionary(characters: NovelCharacter[]): ConceptTerm[] {
  const customCharConcepts: ConceptTerm[] = characters.map((c) => ({
    id: `char_${c.id}`,
    name: c.name,
    category: 'PERSONAJE',
    badge: c.role,
    codeSnippet: `// Personaje: ${c.name} [${c.role}]`,
    shortDescription: c.summary || `${c.role} vinculado a ${c.factionId}.`,
    hardRule: c.signatureImplants 
      ? `Implantes y Disipadores: ${c.signatureImplants}` 
      : 'Recordar describir la disipación térmica y sus limitaciones físicas.',
    aliases: [
      c.name.toLowerCase(), 
      c.name.split(' ')[0].toLowerCase(), // First name
      ...(c.name.split(' ').length > 1 ? [c.name.split(' ')[c.name.split(' ').length - 1].toLowerCase()] : []) // Last name
    ],
    relatedFaction: c.factionId,
    tags: ['personaje', 'reparto', c.factionId.toLowerCase(), c.role.toLowerCase()]
  }));

  // Merge built-in and characters
  return [...customCharConcepts, ...CANONICAL_CONCEPTS];
}

// Check how many times a concept term appears in the manuscript text
export function countOccurrencesInText(text: string, term: ConceptTerm): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  
  // Check direct name
  const directName = term.name.toLowerCase().split('(')[0].trim();
  let count = 0;
  
  const regex = new RegExp(`\\b${escapeRegExp(directName)}\\b`, 'gi');
  const matches = lowerText.match(regex);
  if (matches) count += matches.length;

  // Check aliases
  for (const alias of term.aliases) {
    if (alias.length < 3) continue; // Skip too short aliases to avoid false positives
    const aliasRegex = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'gi');
    const aliasMatches = lowerText.match(aliasRegex);
    if (aliasMatches) {
      count = Math.max(count, aliasMatches.length);
    }
  }

  return count;
}

// Filter concepts by text query and category
export function filterConcepts(
  concepts: ConceptTerm[], 
  query: string, 
  categoryFilter: string
): ConceptTerm[] {
  const normalizedQuery = query.toLowerCase().trim();

  return concepts.filter((concept) => {
    // Category match
    if (categoryFilter !== 'TODOS' && concept.category !== categoryFilter) {
      return false;
    }

    // Query match
    if (!normalizedQuery) return true;

    const inName = concept.name.toLowerCase().includes(normalizedQuery);
    const inDesc = concept.shortDescription.toLowerCase().includes(normalizedQuery);
    const inRule = concept.hardRule?.toLowerCase().includes(normalizedQuery);
    const inBadge = concept.badge.toLowerCase().includes(normalizedQuery);
    const inAliases = concept.aliases.some((a) => a.toLowerCase().includes(normalizedQuery));
    const inTags = concept.tags.some((t) => t.toLowerCase().includes(normalizedQuery));

    return inName || inDesc || inRule || inBadge || inAliases || inTags;
  });
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
