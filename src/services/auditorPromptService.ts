import { Chapter, NovelCharacter, StarSystem, LoreItem, TimelineEvent } from '../types';
import { getActiveGenre, getActiveGenreTerms } from './genrePresetService';
import { CANONICAL_SYSCALLS, CANONICAL_EXPLOITS } from '../data/canonicalLore';

export type AuditFocusMode = 
  | 'integral'
  | 'rules_and_world'
  | 'characters_psychology'
  | 'timeline_anachronisms'
  | 'style_and_pacing';

export interface AuditPromptOptions {
  sceneTitle: string;
  sceneText: string;
  focusMode: AuditFocusMode;
  includeCharacters?: boolean;
  includeWorldRules?: boolean;
  includeTimeline?: boolean;
  includeLore?: boolean;
  allChapters?: Chapter[];
  allCharacters?: NovelCharacter[];
  allStarSystems?: StarSystem[];
  allLoreItems?: LoreItem[];
  allCustomEvents?: TimelineEvent[];
}

/**
 * Genera un prompt de auditoría ontológica exhaustivo adaptado al género activo
 * para ser copiado con 1 clic y ejecutado en Gemini Web (o Gemini Advanced).
 */
export function generateOntologicalAuditPrompt(options: AuditPromptOptions): string {
  const genre = getActiveGenre();
  const terms = getActiveGenreTerms();

  const {
    sceneTitle,
    sceneText,
    focusMode,
    includeCharacters = true,
    includeWorldRules = true,
    includeTimeline = true,
    includeLore = true,
    allCharacters = [],
    allLoreItems = [],
    allCustomEvents = []
  } = options;

  // 1. Rol y personalidad del Auditor según el género
  let auditorRoleDescription = '';
  let specificRulesSummary = '';
  let auditFocusDescription = '';

  switch (genre.id) {
    case 'fantasy':
      auditorRoleDescription = `Actúa como un Archimaestre de la Alta Torre y Auditor Supremo de Consistencia Mágica y Narrativa para una saga de Alta Fantasía / Grimdark titulada bajo el universo "${terms.appName}". Posees un conocimiento enciclopédico de los sistemas de magia dura, costes de maná, pactos de sangre, linajes dinásticos y evolución de personajes. Tu rigor es absoluto: no permites 'Deus Ex Machina', contradicciones en los límites de conjuración ni personajes actuando fuera de su personalidad canónica.`;
      specificRulesSummary = `
1. COSTE Y DRENAJE MÁGICO: Toda invocación o hechizo exige un precio (energía vital, componentes, maná o tributo de sangre). La magia nunca es gratuita.
2. LEYES DE LAS CASAS Y JURAMENTOS: Los vínculos feudales y juramentos sagrados tienen consecuencias políticas y místicas inmediatas.
3. CAUSALIDAD HEROICA: La victoria de los personajes debe provenir de su ingenio y sacrificios, no de poderes improvisados sin preparación previa.
4. CONTINUIDAD DE HERIDAS Y DESGASTE: El cansancio, el daño físico y las secuelas mágicas persisten en las escenas posteriores.
`;
      break;

    case 'noir':
      auditorRoleDescription = `Actúa como un Detective Consultor Forense y Analista Experto de Coartadas y Estructura Policiaca en el universo "${terms.appName}". Tu especialidad es la novela negra, el misterio y los thrillers criminales. Tu objetivo es encontrar fallos lógicos, incoherencias de tiempos y desplazamientos de sospechosos, pistas trampa injustas, contradicciones forenses y agujeros en los interrogatorios.`;
      specificRulesSummary = `
1. RIGOR TEMPORAL Y COARTADAS: Los desplazamientos entre escenas del crimen y cuarteles deben respetar tiempos reales de traslado.
2. JUEGO LIMPIO (FAIR PLAY MYSTERY): El lector debe tener acceso a las pistas cruciales; las deducciones del detective deben fundamentarse en evidencias palpables.
3. PSICOLOGÍA Y MÓVIL DEL CRIMEN: Las acciones de los sospechosos deben ser coherentes con sus intereses, secretos y miedo a ser descubiertos.
4. PROCEDIMIENTO Y LEY: Las intervenciones de brigadas, balística e interrogatorios deben sentirse fidedignas y con peso dramático.
`;
      break;

    case 'romance':
      auditorRoleDescription = `Actúa como una Editora Narrativa y Consultora de Psicología de Personajes y Tensión Dramática para "${terms.appName}". Tu enfoque es la coherencia de los arcos emocionales, la progresión del vínculo entre protagonistas, los momentos de vulnerabilidad, la autenticidad del diálogo y el manejo de los tropos sin caer en inconsistencias afectivas.`;
      specificRulesSummary = `
1. COHERENCIA DE LA HERIDA DE ORIGEN: Cada protagonista arrastra un pasado o creencia errónea que justifica sus reticencias y barreras.
2. ESCALADA ORGÁNICA DE LA TENSIÓN: La intimidad, la confianza y el conflicto deben ganarse paso a paso; los cambios de humor no pueden ser caprichosos.
3. SUBTEXTO EN EL DIÁLOGO: Lo que los personajes callan o disfrazan debe ser tan potente como lo que dicen explícitamente.
4. CONSECUENCIAS SOCIALES: La presión de las familias, amigos o círculos profesionales debe condicionar de forma creíble las decisiones tomadas.
`;
      break;

    case 'history':
      auditorRoleDescription = `Actúa como un Historiador Consultor Forense y Censor de Rigor Histórico para "${terms.appName}". Tu misión es auditar el manuscrito en busca de anacronismos tecnológicos, léxicos, ideológicos y geográficos, verificando que los usos de la corte, armas, títulos, transporte y costumbres se ajusten con precisión a la época histórica representada.`;
      specificRulesSummary = `
1. TOLERANCIA CERO A LOS ANACRONISMOS: Armas, términos médicos, telas, monedas y giros idiomáticos no pueden adelantarse a su siglo.
2. MENTALIDAD DE ÉPOCA: Los personajes deben pensar y juzgar el mundo con los valores morales, religiosos y políticos de su tiempo, no con sensibilidades del siglo XXI.
3. FIDELIDAD A LOS HECHOS REALES: Los sucesos de ficción deben encajar sin fisuras en los huecos de la cronología histórica documentada.
4. LOGÍSTICA HISTÓRICA: La velocidad de mensajeros a caballo, el abastecimiento de ejércitos y las estaciones del año imponen límites reales.
`;
      break;

    case 'minimal':
      auditorRoleDescription = `Actúa como un Editor Jefe y Consultor Literario de Coherencia Narrativa en "${terms.appName}". Tu criterio se basa en la economía del lenguaje, la verosimilitud de las motivaciones, la continuidad de la trama y la fuerza del punto de vista narrativo.`;
      specificRulesSummary = `
1. VEROSIMILITUD DE ACCIÓN: Las decisiones de los personajes deben nacer de motivaciones comprensibles y consecuencias lógicas.
2. CONTINUIDAD DE OBJETOS Y ESPACIOS: La disposición física de la escena y los objetos manipulados deben mantener coherencia espacial.
3. RITMO Y SUBTEXTO: Evitar la sobre-explicación (infodump) y priorizar escenas que avancen la trama o revelen carácter.
4. TONO UNIFICADO: La voz del narrador debe mantener consistencia a lo largo de todo el pasaje.
`;
      break;

    case 'scifi':
    default:
      auditorRoleDescription = `Actúa como el Auditor de Coherencia del Kernel del Vacío y Consultor de Ciencia Ficción Dura del universo "${terms.appName}". Este universo se rige por un sustrato de Planck determinista donde la realidad opera como un sistema operativo cósmico. Tu misión es auditar este borrador contra las leyes de conservación de entropía, disipación térmica, latencia de área, memoria de sector y la doctrina de exploits. No toleras magia blanda ni Deux Ex Machina sin coste termodinámico.`;
      specificRulesSummary = `
1. CONSERVACIÓN DE ENTROPÍA Y RADIACIÓN TÉRMICA: Todo script, propulsión inercial o escudo genera calor. Si se anula la inercia o se proyecta energía, el mamparo o el cuerpo debe disipar ese calor o sobrecalentarse.
2. LATENCIA DE PLANCK Y THROTTLING: Si se concentran cálculos masivos o combates intensos en pocos metros cúbicos, el sector entra en contención y experimenta stuttering temporal.
3. INTEGRIDAD DE MEMORIA Y POLÍTICAS DE PERMISOS: Los relés precursores y artefactos pueden sufrir memory leaks si no liberan búferes cinéticos. La Inquisición y los nodos imponen firmas DRM.
4. CONTINUIDAD DE RED Y DRIVES FTL: Los tránsitos interestelares y las comunicaciones de taquiones deben respetar la infraestructura de relés y la cronología.
`;
      break;
  }

  // 2. Enfoque de auditoría
  switch (focusMode) {
    case 'rules_and_world':
      auditFocusDescription = `ENFOQUE PRIORITARIO: Verificación estricta de las Leyes del Mundo (${terms.architectureTitle}) y reglas físicas/mágicas. Identifica cualquier transgresión de costes, límites o explotación sin consecuencias.`;
      break;
    case 'characters_psychology':
      auditFocusDescription = `ENFOQUE PRIORITARIO: Coherencia psicológica y fidelidad de los personajes (${terms.entityCharacters}). Verifica que actúen según sus motivaciones, secretos, limitaciones físicas y alianzas previas sin caer en OOC (Out of Character).`;
      break;
    case 'timeline_anachronisms':
      auditFocusDescription = `ENFOQUE PRIORITARIO: Cronología y detección de anacronismos (${terms.timelineTitle}). Comprueba el orden temporal, tiempos de viaje, simultaneidad de hechos y secuelas de eventos pasados.`;
      break;
    case 'style_and_pacing':
      auditFocusDescription = `ENFOQUE PRIORITARIO: Ritmo narrativo, voz literaria y tensión dramática. Detecta caídas de ritmo, excesos de exposición (infodump) o diálogos poco naturales.`;
      break;
    case 'integral':
    default:
      auditFocusDescription = `ENFOQUE PRIORITARIO: Auditoría Integral 360°. Examina simultáneamente el rigor de las reglas del mundo, la psicología de los personajes, la cronología temporal y la potencia dramática de la escena.`;
      break;
  }

  // 3. Bloque de Personajes Canónicos
  let charactersBlock = '';
  if (includeCharacters && allCharacters.length > 0) {
    const list = allCharacters.slice(0, 8).map(c => {
      return `- **${c.name}** [${c.role}]: ${c.summary}. Implantes/Rasgos: ${c.signatureImplants || 'Ninguno'}. Habilidades: ${c.typicalAbilities?.join(', ') || 'N/A'}. Notas: ${c.notes || 'N/A'}`;
    }).join('\n');
    charactersBlock = `\n### FICHA CANÓNICA DE PERSONAJES RELEVANTES:\n${list}\n`;
  }

  // 4. Bloque de Leyes / Syscalls / Exploits (para Sci-Fi o general)
  let worldContextBlock = '';
  if (includeWorldRules) {
    if (genre.id === 'scifi') {
      const topSyscalls = CANONICAL_SYSCALLS.slice(0, 4).map(s => `- \`${s.name}\` (${s.category}): ${s.description}. Cómputo: ${s.computeCostMFlops} MFlops, Riesgo Leak: ${s.leakRiskPercent}%`).join('\n');
      const topExploits = CANONICAL_EXPLOITS.slice(0, 3).map(e => `- **${e.name}**: ${e.physicalManifestation}. Fallo: ${e.catastrophicFailure}`).join('\n');
      worldContextBlock = `\n### PROTOCOLOS Y EXPLOITS DEL SUSTRATO (REFERENCIA TÉCNICA):\n${topSyscalls}\n${topExploits}\n`;
    } else {
      worldContextBlock = `\n### PRINCIPIOS DE DISEÑO DEL MUNDO:\n${specificRulesSummary}\n`;
    }
  }

  // 5. Bloque de Eventos Previos / Cronología
  let timelineBlock = '';
  if (includeTimeline && allCustomEvents.length > 0) {
    const eventsStr = allCustomEvents.slice(-5).map(e => `- [${e.dateLabel || `Año ${e.year}`}]: ${e.title} -> ${e.description}`).join('\n');
    timelineBlock = `\n### SUCESOS RECIENTES EN LA LÍNEA TEMPORAL:\n${eventsStr}\n`;
  }

  // 6. Glosario o Reliquias
  let loreBlock = '';
  if (includeLore && allLoreItems.length > 0) {
    const loresStr = allLoreItems.slice(0, 5).map(l => `- **${l.name}** (${l.category}): ${l.narrativeHook || l.technicalSpecs || l.loreAndDiscovery}`).join('\n');
    loreBlock = `\n### DOCUMENTACIÓN Y ELEMENTOS DE MUNDO (${terms.loreTitle}):\n${loresStr}\n`;
  }

  // 7. Prompt estructurado final en Markdown limpio
  return `# PROMPT DE AUDITORÍA EXPERTA — ${terms.appName.toUpperCase()}
# GÉNERO: ${genre.name.toUpperCase()}

${auditorRoleDescription}

---

## 1. REGLAS FUNDAMENTALES DEL UNIVERSO
${specificRulesSummary}
${worldContextBlock}
${charactersBlock}
${timelineBlock}
${loreBlock}

---

## 2. INSTRUCCIÓN Y ENFOQUE DEL AUTOR
${auditFocusDescription}

---

## 3. FRAGMENTO A AUDITAR
**Título de la Escena / Capítulo:** ${sceneTitle || 'Sin título definido'}

\`\`\`markdown
${sceneText.trim()}
\`\`\`

---

## 4. FORMATO OBLIGATORIO DE TU DICTAMEN

Por favor, estructura tu respuesta en los siguientes apartados claros, utilizando Markdown profesional:

### 1. DICTAMEN GENERAL Y NIVEL DE COHERENCIA
- Calificación: [IMPECABLE / ALERTA DE CONTINUIDAD / INCONSISTENCIA CRÍTICA].
- Resumen ejecutivo en 2-3 líneas del veredicto ontológico.

### 2. DISCORDANCIAS Y RIESGOS DETECTADOS
Para cada inconsistencia encontrada, incluye:
- **Cita Textual:** El fragmento exacto donde ocurre el fallo.
- **Regla o Axioma Vulnerado:** Por qué contradice las leyes del mundo, la psicología del personaje o la cronología previa.
- **Consecuencia Diegética:** El impacto en la suspensión de la incredulidad del lector.

### 3. EXAMEN DE RITMO, VOZ Y SUSPENSIÓN DE LA INCREDULIDAD
- Evaluación de si hay momentos que se sienten forzados ("conveniencia del guión" o "Deus Ex Machina").
- Evaluación de la naturalidad de los diálogos y la solidez del punto de vista.

### 4. PROPUESTA DE REESCRITURA QUIRÚRGICA
- Redacta una versión corregida de los párrafos conflictivos que solucione todas las incoherencias detectadas, elevando la fuerza de la escena y manteniendo la atmósfera del género (${genre.name}).

### 5. OPORTUNIDADES PARA ENRIQUECER EL WORLDBUILDING
- Sugerencia de 1 o 2 detalles adicionales que el autor podría sembrar aquí para anticipar tramas futuras o profundizar en la textura del mundo sin frenar el ritmo.
`;
}
