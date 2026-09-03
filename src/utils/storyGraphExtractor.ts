import { 
  Chapter, 
  NovelCharacter, 
  StarSystem, 
  Syscall, 
  ExploitScript, 
  Faction,
  StoryGraphNode, 
  StoryGraphLink, 
  StoryGraphData, 
  PlotInconsistency 
} from '../types';

export function extractStoryGraph(
  chapters: Chapter[],
  characters: NovelCharacter[],
  starSystems: StarSystem[],
  syscalls: Syscall[],
  exploits: ExploitScript[],
  factions: Faction[],
  selectedChapterNumber: number | null = null // null means all chapters
): StoryGraphData {
  const nodesMap = new Map<string, StoryGraphNode>();
  const linksMap = new Map<string, StoryGraphLink>();
  const inconsistencies: PlotInconsistency[] = [];

  // Filter chapters if single chapter or timeline is chosen
  const activeChapters = selectedChapterNumber !== null
    ? chapters.filter(c => c.number <= selectedChapterNumber)
    : chapters;

  // Sorted chapters by number for timeline analysis
  const sortedChapters = [...chapters].sort((a, b) => a.number - b.number);

  // 1. Initialize Nodes

  // Characters
  characters.forEach(char => {
    const charChapters = activeChapters
      .filter(c => c.characterIds.includes(char.id) || doesTextMention(c.content, [char.name, char.name.split(' ')[0]]))
      .map(c => c.number);

    nodesMap.set(char.id, {
      id: char.id,
      name: char.name,
      type: 'PERSONAJE',
      subType: char.role,
      roleOrCategory: char.role,
      description: char.summary || `${char.role} de la facción ${char.factionId}.`,
      factionOrSystem: char.factionId,
      chapterOccurrences: charChapters,
      degree: 0,
      inconsistencyCount: 0,
      radius: 20,
      color: '#f59e0b' // Amber
    });
  });

  // Star Systems
  starSystems.forEach(sys => {
    const sysChapters = activeChapters
      .filter(c => c.systemId === sys.id || doesTextMention(c.content, [sys.name, sys.name.split(' ')[0]]))
      .map(c => c.number);

    nodesMap.set(sys.id, {
      id: sys.id,
      name: sys.name,
      type: 'PLANETA',
      subType: `DRM: ${sys.drmPolicy.replace('_', ' ')}`,
      roleOrCategory: `Ancho de banda: ${sys.planckBandwidth}`,
      description: `${sys.politicalControl}. Ruinas: ${sys.precursorRuins}`,
      factionOrSystem: sys.politicalControl,
      chapterOccurrences: sysChapters,
      degree: 0,
      inconsistencyCount: 0,
      radius: 24,
      color: '#10b981' // Emerald
    });
  });

  // Technologies (Syscalls & Exploits)
  syscalls.forEach(sys => {
    const techChapters = activeChapters
      .filter(c => c.abilityIds.includes(sys.id) || doesTextMention(c.content, [sys.name, sys.signature]))
      .map(c => c.number);

    nodesMap.set(sys.id, {
      id: sys.id,
      name: sys.name,
      type: 'TECNOLOGIA',
      subType: 'Syscall L0',
      roleOrCategory: `Coste: ${sys.computeCostMFlops} MFlops`,
      description: sys.description,
      factionOrSystem: `Firma: ${sys.signature}`,
      chapterOccurrences: techChapters,
      degree: 0,
      inconsistencyCount: 0,
      radius: 17,
      color: '#06b6d4' // Cyan
    });
  });

  exploits.forEach(exp => {
    const expChapters = activeChapters
      .filter(c => c.abilityIds.includes(exp.id) || doesTextMention(c.content, [exp.name, exp.targetDomain]))
      .map(c => c.number);

    nodesMap.set(exp.id, {
      id: exp.id,
      name: exp.name,
      type: 'TECNOLOGIA',
      subType: 'Exploit FOSS',
      roleOrCategory: `Vector: ${exp.targetDomain}`,
      description: `${exp.tacticalApplication}. Efecto: ${exp.physicalManifestation}`,
      factionOrSystem: `Falla: ${exp.catastrophicFailure}`,
      chapterOccurrences: expChapters,
      degree: 0,
      inconsistencyCount: 0,
      radius: 18,
      color: '#38bdf8' // Sky Blue
    });
  });

  // 2. Build Links from Chapters
  activeChapters.forEach(chap => {
    // Identify characters in chapter
    const presentCharIds = characters
      .filter(char => chap.characterIds.includes(char.id) || doesTextMention(chap.content, [char.name, char.name.split(' ')[0]]))
      .map(char => char.id);

    // Identify planet
    const systemNode = starSystems.find(s => s.id === chap.systemId || doesTextMention(chap.content, [s.name]));
    const planetId = systemNode ? systemNode.id : chap.systemId;

    // Identify abilities
    const presentAbilityIds = [...syscalls, ...exploits]
      .filter(ab => chap.abilityIds.includes(ab.id) || doesTextMention(chap.content, [ab.name]))
      .map(ab => ab.id);

    // Link: Character ↔ Planet
    if (nodesMap.has(planetId)) {
      presentCharIds.forEach(charId => {
        if (nodesMap.has(charId)) {
          const linkId = [charId, planetId].sort().join('__');
          addOrUpdateLink(linksMap, linkId, charId, planetId, 'UBICADO_EN', chap.number, 'Ubicado en sector');
        }
      });
    }

    // Link: Character ↔ Character (Co-presence in scene)
    for (let i = 0; i < presentCharIds.length; i++) {
      for (let j = i + 1; j < presentCharIds.length; j++) {
        const charA = presentCharIds[i];
        const charB = presentCharIds[j];
        if (nodesMap.has(charA) && nodesMap.has(charB)) {
          const linkId = [charA, charB].sort().join('__');
          addOrUpdateLink(linksMap, linkId, charA, charB, 'CO_PRESENCIA', chap.number, 'Co-presente en capítulo');
        }
      }
    }

    // Link: Character ↔ Technology (Usage)
    presentCharIds.forEach(charId => {
      presentAbilityIds.forEach(abId => {
        if (nodesMap.has(charId) && nodesMap.has(abId)) {
          const linkId = [charId, abId].sort().join('__');
          addOrUpdateLink(linksMap, linkId, charId, abId, 'USA_TECNOLOGIA', chap.number, 'Ejecuta / Opera');
        }
      });
    });

    // Link: Planet ↔ Technology (Deployed in sector)
    if (nodesMap.has(planetId)) {
      presentAbilityIds.forEach(abId => {
        if (nodesMap.has(abId)) {
          const linkId = [planetId, abId].sort().join('__');
          addOrUpdateLink(linksMap, linkId, planetId, abId, 'DESPLEGADO_EN', chap.number, 'Inyectado en sector');
        }
      });
    }
  });

  // 3. Compute Node Degrees & Radii
  linksMap.forEach(link => {
    const sId = typeof link.source === 'string' ? link.source : (link.source as StoryGraphNode).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as StoryGraphNode).id;
    const sNode = nodesMap.get(sId);
    const tNode = nodesMap.get(tId);
    if (sNode) sNode.degree += 1;
    if (tNode) tNode.degree += 1;
  });

  nodesMap.forEach(node => {
    // Dynamic radius based on connectivity
    node.radius = Math.max(16, Math.min(34, 16 + node.degree * 2.5));
  });

  // 4. INCONSISTENCY DETECTION ENGINE
  
  // A. Inconsistencia de Ubicación Imposible (Warp instantáneo entre capítulos consecutivos)
  characters.forEach(char => {
    let lastSeenChapter: Chapter | null = null;
    let lastSeenSystem: string | null = null;

    sortedChapters.forEach(chap => {
      const isPresent = chap.characterIds.includes(char.id) || doesTextMention(chap.content, [char.name]);
      if (!isPresent) return;

      const currentSystem = chap.systemId;
      if (lastSeenChapter !== null && lastSeenSystem !== null && lastSeenSystem !== currentSystem) {
        // Character changed systems between consecutive appearances!
        // Check if the current or previous chapter mentions space transit, relativistic delay, hyperdrive, or jump
        const transitKeywords = ['salto', 'tránsito', 'viaje', 'hiperespacio', 'puerta de relé', 'recorrido', 'semanas', 'días', 'horas de navegación', 'navegando hacia'];
        const textToSearch = `${lastSeenChapter.content} ${chap.content}`.toLowerCase();
        const hasTransitMention = transitKeywords.some(kw => textToSearch.includes(kw));

        if (!hasTransitMention) {
          const prevSysName = starSystems.find(s => s.id === lastSeenSystem)?.name || lastSeenSystem;
          const currSysName = starSystems.find(s => s.id === currentSystem)?.name || currentSystem;

          inconsistencies.push({
            id: `inc_warp_${char.id}_${lastSeenChapter.number}_${chap.number}`,
            type: 'UBICACION_IMPOSIBLE',
            severity: 'CRITICA',
            title: `Salto Estelar Instantáneo de ${char.name}`,
            description: `${char.name} pasa del sistema ${prevSysName} (Cap. ${lastSeenChapter.number}) al sistema ${currSysName} (Cap. ${chap.number}) sin mención de vector de navegación, tiempo de tránsito o puente FTL en la prosa.`,
            affectedNodeIds: [char.id, lastSeenSystem, currentSystem].filter(Boolean),
            affectedChapterNumbers: [lastSeenChapter.number, chap.number],
            recommendation: `Describe al inicio del Cap. ${chap.number} la duración del viaje interestelar o el uso de una puerta de relé de Planck para evitar la sensación de teletransportación mágica.`
          });
        }
      }

      lastSeenChapter = chap;
      lastSeenSystem = currentSystem;
    });
  });

  // B. Inconsistencia de Sobrecarga Térmica (Tecnología de alta entropía sin disipador registrado)
  characters.forEach(char => {
    const signatureLower = (char.signatureImplants || '').toLowerCase();
    const hasHeatSink = ['aleta', 'grafeno', 'disipador', 'radiador', 'fluorocarbono', 'refriger'].some(term => signatureLower.includes(term));

    activeChapters.forEach(chap => {
      const isPresent = chap.characterIds.includes(char.id) || doesTextMention(chap.content, [char.name]);
      if (!isPresent) return;

      // Check if thermal abilities are executed
      const thermalAbilities = ['sys_thermal_clamp', 'exploit_thermo_inversion'];
      thermalAbilities.forEach(abId => {
        const used = chap.abilityIds.includes(abId) || doesTextMention(chap.content, [abId]);
        if (used && !hasHeatSink) {
          const abName = [...syscalls, ...exploits].find(a => a.id === abId)?.name || abId;
          inconsistencies.push({
            id: `inc_thermal_${char.id}_${abId}_${chap.number}`,
            type: 'SOBRECARGA_TERMICA',
            severity: 'ADVERTENCIA',
            title: `Sobrecarga Térmica: ${char.name} ejecuta ${abName}`,
            description: `${char.name} ejecuta ${abName} en el Cap. ${chap.number}, pero su ficha de personaje no registra disipadores de grafeno ni implantes de evacuación de calor. Según el Axioma 1, sin radiadores el retroceso calórico cocinaría los órganos del operador.`,
            affectedNodeIds: [char.id, abId],
            affectedChapterNumbers: [chap.number],
            recommendation: `Añade aletas de grafeno monoatómico o toberas de enfriamiento en los implantes característicos de ${char.name}, o narra cómo absorbe las quemaduras térmicas en la escena.`
          });
        }
      });
    });
  });

  // C. Inconsistencia de Violación DRM en Sectores Teocráticos
  activeChapters.forEach(chap => {
    const system = starSystems.find(s => s.id === chap.systemId);
    if (system && (system.drmPolicy === 'DRM_ORTODOXO_ESTRICTO' || system.drmPolicy === 'ANARQUÍA_FRAGMENTADA')) {
      const forbiddenExploits = exploits.filter(exp => chap.abilityIds.includes(exp.id) || doesTextMention(chap.content, [exp.name]));
      forbiddenExploits.forEach(exp => {
        // If DRM rules checklist is not ticked or no cloaking mentioned
        const textLower = chap.content.toLowerCase();
        const hasCloakMention = ['firma', 'camuflaje', 'enmascarar', 'boya', 'falsif', 'clandestin', 'fuga'].some(w => textLower.includes(w));

        if (!chap.coherenceChecklist?.drmRulesRespected && !hasCloakMention) {
          inconsistencies.push({
            id: `inc_drm_${system.id}_${exp.id}_${chap.number}`,
            type: 'VIOLACION_DRM',
            severity: 'ADVERTENCIA',
            title: `Inyección de ${exp.name} bajo DRM Estricto`,
            description: `En el Cap. ${chap.number} se compila el exploit ${exp.name} en ${system.name}, donde la Ortodoxia mantiene escaneo constante de 18ms. No se describe ningún método de ofuscación de firma de Planck.`,
            affectedNodeIds: [system.id, exp.id],
            affectedChapterNumbers: [chap.number],
            recommendation: `Menciona cómo los operadores enmascararon su firma electromagnética o añade la intercepción inmediata de una patrulla de la Inquisición.`
          });
        }
      });
    }
  });

  // D. Conflicto de Facciones Antagónicas en la Misma Escena
  activeChapters.forEach(chap => {
    const presentChars = characters.filter(c => chap.characterIds.includes(c.id) || doesTextMention(chap.content, [c.name]));
    
    // Check if both Orthodox and FOSS characters are present
    const orthodoxChar = presentChars.find(c => c.factionId.toLowerCase().includes('sacred') || c.factionId.toLowerCase().includes('ortodoxia'));
    const fossChar = presentChars.find(c => c.factionId.toLowerCase().includes('foss'));

    if (orthodoxChar && fossChar) {
      const textLower = chap.content.toLowerCase();
      const hasConflict = ['inquisic', 'enemig', 'dispar', 'amenaz', 'cautiv', 'caza', 'persecuc', 'alerta', 'tensi'].some(w => textLower.includes(w));
      if (!hasConflict) {
        inconsistencies.push({
          id: `inc_faction_${orthodoxChar.id}_${fossChar.id}_${chap.number}`,
          type: 'CONFLICTO_FACCION',
          severity: 'SUGERENCIA',
          title: `Co-presencia de Facciones Enemigas en Cap. ${chap.number}`,
          description: `${orthodoxChar.name} (Ortodoxia Sacra) y ${fossChar.name} (Colectivo FOSS) coinciden en la escena del Cap. ${chap.number}. Su enemistad doctrinal es total; asegúrate de que la interacción justifique por qué no hay hostilidades letales inmediatas.`,
          affectedNodeIds: [orthodoxChar.id, fossChar.id],
          affectedChapterNumbers: [chap.number],
          recommendation: `Refuerza la atmósfera de hostilidad latente o aclara si se trata de una tregua clandestina o un enfrentamiento a distancia.`
        });
      }
    }
  });

  // E. Discrepancia entre Metadatos y Texto
  activeChapters.forEach(chap => {
    // Characters tagged in metadata but absent from text
    chap.characterIds.forEach(cId => {
      const char = characters.find(c => c.id === cId);
      if (char && !doesTextMention(chap.content, [char.name, char.name.split(' ')[0]])) {
        inconsistencies.push({
          id: `inc_ghost_char_${cId}_${chap.number}`,
          type: 'DISCREPANCIA_TEXTO',
          severity: 'SUGERENCIA',
          title: `Personaje Fantasma en Metadatos: ${char.name}`,
          description: `${char.name} está marcado en la cabecera del Cap. ${chap.number}, pero su nombre o apellido no aparecen en el manuscrito de la escena.`,
          affectedNodeIds: [char.id],
          affectedChapterNumbers: [chap.number],
          recommendation: `Escribe una mención o diálogo de ${char.name} en el texto, o retíralo de los metadatos del capítulo si finalmente no interviene en la escena.`
        });
      }
    });

    // Abilities tagged in metadata but absent from text
    chap.abilityIds.forEach(abId => {
      const ability = [...syscalls, ...exploits].find(a => a.id === abId);
      if (ability && !doesTextMention(chap.content, [ability.name, ability.id])) {
        inconsistencies.push({
          id: `inc_ghost_ab_${abId}_${chap.number}`,
          type: 'DISCREPANCIA_TEXTO',
          severity: 'SUGERENCIA',
          title: `Habilidad no Descrita: ${ability.name}`,
          description: `La habilidad ${ability.name} está asignada al Cap. ${chap.number}, pero no se observa su compilación ni su nombre en el texto.`,
          affectedNodeIds: [ability.id],
          affectedChapterNumbers: [chap.number],
          recommendation: `Describe el momento en que se ejecuta la llamada o se activa el exploit para conectar los metadatos con la prosa.`
        });
      }
    });
  });

  // F. Entidades Huérfanas (Sin presencia en ningún capítulo escrito)
  characters.forEach(char => {
    const node = nodesMap.get(char.id);
    if (node && node.chapterOccurrences.length === 0) {
      inconsistencies.push({
        id: `inc_orphan_${char.id}`,
        type: 'ENTIDAD_HUERFANA',
        severity: 'SUGERENCIA',
        title: `Personaje Huérfano: ${char.name}`,
        description: `${char.name} ha sido definido en la biblia de personajes pero todavía no aparece en ninguno de los capítulos escritos.`,
        affectedNodeIds: [char.id],
        affectedChapterNumbers: [],
        recommendation: `Asigna a ${char.name} a una escena de los capítulos en borrador o introdúcelo en el próximo episodio.`
      });
    }
  });

  // Link Inconsistencies back to Nodes
  inconsistencies.forEach(inc => {
    inc.affectedNodeIds.forEach(nId => {
      const node = nodesMap.get(nId);
      if (node) {
        node.inconsistencyCount += 1;
      }
    });

    // Mark links if between affected nodes
    if (inc.affectedNodeIds.length >= 2) {
      for (let i = 0; i < inc.affectedNodeIds.length; i++) {
        for (let j = i + 1; j < inc.affectedNodeIds.length; j++) {
          const lId = [inc.affectedNodeIds[i], inc.affectedNodeIds[j]].sort().join('__');
          const link = linksMap.get(lId);
          if (link) {
            link.hasInconsistency = true;
          }
        }
      }
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links: Array.from(linksMap.values()),
    inconsistencies,
    analyzedChaptersCount: activeChapters.length
  };
}

// Helper to add or increment link weight
function addOrUpdateLink(
  linksMap: Map<string, StoryGraphLink>,
  linkId: string,
  sourceId: string,
  targetId: string,
  type: StoryGraphLink['type'],
  chapterNumber: number,
  label: string
) {
  const existing = linksMap.get(linkId);
  if (existing) {
    existing.weight += 1;
    if (!existing.chapterNumbers.includes(chapterNumber)) {
      existing.chapterNumbers.push(chapterNumber);
    }
  } else {
    linksMap.set(linkId, {
      id: linkId,
      source: sourceId,
      target: targetId,
      type,
      chapterNumbers: [chapterNumber],
      weight: 1,
      label,
      hasInconsistency: false
    });
  }
}

// Helper to detect if a text mentions any term in list
function doesTextMention(text: string, terms: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return terms.some(term => {
    if (!term || term.length < 3) return false;
    const clean = term.toLowerCase().trim();
    return lower.includes(clean);
  });
}
