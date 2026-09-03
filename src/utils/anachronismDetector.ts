import { 
  TimelineEvent, 
  NarrativeAnachronism, 
  Chapter, 
  NovelCharacter, 
  StarSystem 
} from '../types';
import { MIN_FTL_TRANSIT_CYCLES, CANONICAL_TIMELINE_EVENTS } from '../data/canonicalTimeline';

export interface TimelineAuditResult {
  events: TimelineEvent[];
  anachronisms: NarrativeAnachronism[];
  causalCoherenceScore: number; // 0 to 100
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
}

// Canonical baseline dates for technologies and key relics
export const CANONICAL_TECH_INCEPTION: Record<string, { year: number; name: string }> = {
  ITEM_01: { year: 3039.45, name: 'Prisma de Turing-Planck (Recuperación en Kepler-186)' },
  exploit_drm_root_curse: { year: 892.4, name: 'Secuestro Criptográfico de Superusuario (DRM Root Lock)' },
  sys_thermal_clamp: { year: 892.4, name: 'Syscall sys_thermal_clamp' },
  sys_molecular_patch: { year: 1104.2, name: 'Syscall sys_molecular_patch' },
  sys_inertia_null: { year: 1450.8, name: 'Syscall sys_inertia_null' },
  sys_metric_pinch: { year: 1620.15, name: 'Syscall sys_metric_pinch' },
  exploit_race_condition_jump: { year: 1784.3, name: 'Exploit Race Condition de Salto Espacial' },
  exploit_thermo_inversion: { year: 2890.3, name: 'Inversión de Gradiente Termodinámico' },
  exploit_kinetic_phase_drift: { year: 3012.2, name: 'Desfase Cinético de Fase (Exploit FOSS-204)' },
  exploit_hotpatch_armor: { year: 3012.2, name: 'Parche en Caliente Molecular de Blindaje' }
};

/**
 * Merges raw chapters with worldbuilding events and synchronizes timeline entries
 */
export function buildUnifiedTimeline(
  chapters: Chapter[],
  customEvents: TimelineEvent[] = []
): TimelineEvent[] {
  const merged: TimelineEvent[] = [...CANONICAL_TIMELINE_EVENTS];

  // Merge custom user-defined events if not already present
  for (const cust of customEvents) {
    if (!merged.some(e => e.id === cust.id)) {
      merged.push(cust);
    }
  }

  // Update or inject chapter events
  for (const chap of chapters) {
    const defaultCycle = chap.number === 1 ? 3042.188 : chap.number === 2 ? 3042.195 : 3042.195 + ((chap.number - 2) * 0.015);
    const year = chap.diegeticCycle !== undefined ? chap.diegeticCycle : defaultCycle;
    const dateLabel = chap.diegeticDateLabel || `Ciclo ${year.toFixed(3)} // Planck Tick 0x${(chap.number * 17).toString(16).toUpperCase()}`;

    const existingIndex = merged.findIndex(e => e.chapterNumber === chap.number || e.id === `EVT_CHAP_${chap.number}`);

    const chapterEvent: TimelineEvent = {
      id: existingIndex >= 0 ? merged[existingIndex].id : `EVT_CHAP_${chap.number}`,
      title: `Capítulo ${chap.number}: ${chap.title}`,
      year,
      dateLabel,
      eraId: 'ERA_4_ACTUAL',
      category: 'CAPITULO_MANUSCRITO',
      chapterNumber: chap.number,
      narrativeOrder: chap.number,
      description: chap.authorNotes || `Acontecimientos narrados en el Capítulo ${chap.number}.`,
      systemId: chap.systemId,
      locationDetails: chap.locationDetails,
      characterIds: chap.characterIds,
      techOrArtifactIds: chap.abilityIds,
      isFlashbackOrAnalepsis: chap.isFlashback,
      authorNotes: chap.authorNotes
    };

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...chapterEvent,
        // preserve existing if custom edited
        year,
        dateLabel
      };
    } else {
      merged.push(chapterEvent);
    }
  }

  // Sort primarily by diegetic year
  return merged.sort((a, b) => a.year - b.year);
}

/**
 * Scans a unified timeline and executes full causal physics audit
 */
export function auditTimelineAnachronisms(
  events: TimelineEvent[],
  characters: NovelCharacter[],
  starSystems: StarSystem[]
): TimelineAuditResult {
  const anachronisms: NarrativeAnachronism[] = [];
  const eventMap = new Map<string, TimelineEvent>();
  const charMap = new Map<string, NovelCharacter>(characters.map(c => [c.id, c]));
  const sysMap = new Map<string, StarSystem>(starSystems.map(s => [s.id, s]));

  events.forEach(e => {
    eventMap.set(e.id, { ...e, hasAnachronism: false, anachronismIds: [] });
  });

  // 1. Audit: FTL Travel Violations (Speed of Reality Limits)
  // For each character, track chronological trail across events
  const charHistories = new Map<string, TimelineEvent[]>();
  
  // Sort events strictly by diegetic year
  const chronoSortedEvents = [...events].sort((a, b) => a.year - b.year);

  chronoSortedEvents.forEach(evt => {
    if (!evt.characterIds || evt.characterIds.length === 0) return;
    evt.characterIds.forEach(charId => {
      if (!charHistories.has(charId)) {
        charHistories.set(charId, []);
      }
      charHistories.get(charId)!.push(evt);
    });
  });

  // Evaluate transitions for each character
  charHistories.forEach((trail, charId) => {
    const charName = charMap.get(charId)?.name || charId;

    for (let i = 0; i < trail.length - 1; i++) {
      const prev = trail[i];
      const next = trail[i + 1];

      // If in different star systems
      if (prev.systemId && next.systemId && prev.systemId !== next.systemId) {
        const deltaCycle = next.year - prev.year;
        const sysPrev = sysMap.get(prev.systemId)?.name || prev.systemId;
        const sysNext = sysMap.get(next.systemId)?.name || next.systemId;

        // Lookup minimum transit
        const minReq = MIN_FTL_TRANSIT_CYCLES[prev.systemId]?.[next.systemId] ?? 0.0050;

        if (deltaCycle < minReq) {
          const daysActual = (deltaCycle * 365).toFixed(1);
          const daysReq = (minReq * 365).toFixed(1);
          const deficit = ((minReq - deltaCycle) * 365).toFixed(1);

          const anachronismId = `ANAC_FTL_${prev.id}_${next.id}_${charId}`;
          anachronisms.push({
            id: anachronismId,
            type: 'DESPLAZAMIENTO_FTL_IMPOSIBLE',
            severity: deltaCycle <= 0 ? 'CRITICA' : 'CRITICA',
            title: `Violación FTL: Teletransportación Imposible de ${charName}`,
            description: `${charName} pasa de ${sysPrev} a ${sysNext} en solo ${deltaCycle.toFixed(4)} ciclos (~${daysActual} días), pero el tránsito de Planck mínimo es de ${minReq.toFixed(4)} ciclos (~${daysReq} días).`,
            detectedInEventIds: [prev.id, next.id],
            affectedChapterNumbers: [prev.chapterNumber, next.chapterNumber].filter((n): n is number => n !== undefined),
            explanation: `El tejido de Planck impone una velocidad límite de conmutación cuántica de relés. Viajar entre ${sysPrev} y ${sysNext} requiere como mínimo ${daysReq} días métricos. La nave de ${charName} violaría la causalidad local si llega en ${daysActual} días sin un túnel de vacío de clase Primigenia documentado.`,
            recommendation: `Ajusta la fecha del evento posterior (${next.title}) en al menos +${minReq.toFixed(4)} ciclos (+${deficit} días estándar) o añade una justificación de un exploit métrico tipo sys_metric_pinch en el texto del capítulo.`,
            deltaCycle,
            requiredDeltaCycle: minReq
          });

          // Mark events
          const pEvt = eventMap.get(prev.id);
          const nEvt = eventMap.get(next.id);
          if (pEvt) {
            pEvt.hasAnachronism = true;
            pEvt.anachronismIds = [...(pEvt.anachronismIds || []), anachronismId];
          }
          if (nEvt) {
            nEvt.hasAnachronism = true;
            nEvt.anachronismIds = [...(nEvt.anachronismIds || []), anachronismId];
          }
        }
      }
    }
  });

  // 2. Audit: Technological Inception Anachronisms (Pre-Discovery Tech Usage)
  chronoSortedEvents.forEach(evt => {
    if (!evt.techOrArtifactIds || evt.techOrArtifactIds.length === 0) return;

    evt.techOrArtifactIds.forEach(techId => {
      const techInfo = CANONICAL_TECH_INCEPTION[techId];
      if (techInfo && evt.year < techInfo.year - 0.05) {
        const anachronismId = `ANAC_TECH_${evt.id}_${techId}`;
        anachronisms.push({
          id: anachronismId,
          type: 'ANACRONISMO_TECNOLOGICO',
          severity: 'CRITICA',
          title: `Tecnología Prematura: ${techInfo.name}`,
          description: `El evento "${evt.title}" (Ciclo ${evt.year.toFixed(1)}) utiliza o referencia "${techInfo.name}", pero este artefacto o exploit no fue inventado o descubierto hasta el Ciclo ${techInfo.year.toFixed(1)}.`,
          detectedInEventIds: [evt.id],
          affectedChapterNumbers: evt.chapterNumber ? [evt.chapterNumber] : [],
          explanation: `El desarrollo de componentes en el universo de KRNL.VACUO sigue una cadena histórica estricta ligada a las guerras de compiladores y excavaciones precursoras. Su uso antes del Ciclo ${techInfo.year.toFixed(1)} fractura el canon tecnológico.`,
          recommendation: `Sustituye esta habilidad/artefacto por una tecnología compatible con la época o mueve el evento a una fecha posterior al Ciclo ${techInfo.year.toFixed(1)}.`
        });

        const ev = eventMap.get(evt.id);
        if (ev) {
          ev.hasAnachronism = true;
          ev.anachronismIds = [...(ev.anachronismIds || []), anachronismId];
        }
      }
    });
  });

  // 3. Audit: Narrative Sequence Discrepancy (Unmarked Flashback / Anachronous Chapter Order)
  // Filter chapters ordered by book reading order (1, 2, 3...)
  const bookChapters = [...events]
    .filter(e => e.category === 'CAPITULO_MANUSCRITO' && e.chapterNumber !== undefined)
    .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

  for (let i = 0; i < bookChapters.length - 1; i++) {
    const curr = bookChapters[i];
    const nxt = bookChapters[i + 1];

    // If next chapter in book is in the past diegetically, but NOT flagged as flashback
    if (nxt.year < curr.year && !nxt.isFlashbackOrAnalepsis) {
      const anachronismId = `ANAC_ORDER_${curr.id}_${nxt.id}`;
      anachronisms.push({
        id: anachronismId,
        type: 'DISCREPANCIA_ORDEN_DIEGETICO',
        severity: 'ADVERTENCIA',
        title: `Secuencia Temporal Invertida: Capítulo ${nxt.chapterNumber} previo al Capítulo ${curr.chapterNumber}`,
        description: `El Capítulo ${nxt.chapterNumber} ("${nxt.title}") ocurre en el Ciclo ${nxt.year.toFixed(3)}, mientras que el Capítulo ${curr.chapterNumber} ("${curr.title}") ocurre en el Ciclo ${curr.year.toFixed(3)}. No está marcado como Analepsis / Flashback.`,
        detectedInEventIds: [curr.id, nxt.id],
        affectedChapterNumbers: [curr.chapterNumber!, nxt.chapterNumber!],
        explanation: `En la lectura lineal, un capítulo situado en el pasado diegético confunde al lector a menos que se trate explícitamente de una analepsis (flashback) de worldbuilding o memoria de un personaje.`,
        recommendation: `Marca el Capítulo ${nxt.chapterNumber} como 'Analepsis / Flashback' en la configuración de la línea temporal o adelante su fecha para suceder después del Capítulo ${curr.chapterNumber}.`
      });

      const cEv = eventMap.get(curr.id);
      const nEv = eventMap.get(nxt.id);
      if (cEv) {
        cEv.hasAnachronism = true;
        cEv.anachronismIds = [...(cEv.anachronismIds || []), anachronismId];
      }
      if (nEv) {
        nEv.hasAnachronism = true;
        nEv.anachronismIds = [...(nEv.anachronismIds || []), anachronismId];
      }
    }
  }

  // 4. Audit: Spatiotemporal Collisions (Same Character in 2 places simultaneously)
  for (let i = 0; i < chronoSortedEvents.length - 1; i++) {
    const eA = chronoSortedEvents[i];
    const eB = chronoSortedEvents[i + 1];

    if (Math.abs(eA.year - eB.year) < 0.0001 && eA.systemId && eB.systemId && eA.systemId !== eB.systemId) {
      const commonChars = (eA.characterIds || []).filter(cId => (eB.characterIds || []).includes(cId));
      if (commonChars.length > 0) {
        const charNames = commonChars.map(id => charMap.get(id)?.name || id).join(', ');
        const anachronismId = `ANAC_COLLISION_${eA.id}_${eB.id}`;
        anachronisms.push({
          id: anachronismId,
          type: 'COLISION_TEMPORAL_PERSONAJES',
          severity: 'CRITICA',
          title: `Colisión Espaciotemporal: Ubicuidad Simultánea de ${charNames}`,
          description: `${charNames} figura simultáneamente en "${eA.title}" y en "${eB.title}" en el mismo instante temporal (Ciclo ${eA.year.toFixed(3)}) pero en sistemas estelares distintos.`,
          detectedInEventIds: [eA.id, eB.id],
          affectedChapterNumbers: [eA.chapterNumber, eB.chapterNumber].filter((n): n is number => n !== undefined),
          explanation: `A menos que se trate de una proyección cuántica remota (como un holograma de Planck o un gemelo digital no corpóreo), una entidad biológica no puede tener dos presencias físicas simultáneas.`,
          recommendation: `Desplaza la fecha de uno de los eventos o aclara si uno de ellos es un holograma / memoria diferida.`
        });

        const ev1 = eventMap.get(eA.id);
        const ev2 = eventMap.get(eB.id);
        if (ev1) {
          ev1.hasAnachronism = true;
          ev1.anachronismIds = [...(ev1.anachronismIds || []), anachronismId];
        }
        if (ev2) {
          ev2.hasAnachronism = true;
          ev2.anachronismIds = [...(ev2.anachronismIds || []), anachronismId];
        }
      }
    }
  }

  // 5. Audit: DRM Policy Anachronism
  chronoSortedEvents.forEach(evt => {
    if (evt.year < 890.0) {
      const mentionsDrm = (evt.techOrArtifactIds || []).includes('exploit_drm_root_curse') || 
                          evt.description.toLowerCase().includes('sacred_root') ||
                          evt.description.toLowerCase().includes('inquisición');
      if (mentionsDrm) {
        const anachronismId = `ANAC_DRM_ERA_${evt.id}`;
        anachronisms.push({
          id: anachronismId,
          type: 'ANACRONISMO_POLITICO_DRM',
          severity: 'ADVERTENCIA',
          title: `Inquisición o DRM Previo al Gran Cisma en "${evt.title}"`,
          description: `Se mencionan bloqueos de DRM o la Inquisición en el Ciclo ${evt.year.toFixed(1)}, pero el Edicto de Excomunión de Root no ocurrió hasta el Ciclo 892.4.`,
          detectedInEventIds: [evt.id],
          explanation: `Durante la Era Primordial (0 - 350 KRNL), el acceso al Kernel era abierto y FOSS por diseño de los Arquitectos primigenios. La Inquisición no existía.`,
          recommendation: `Retira las referencias al sacerdocio teocrático o mueve el evento a la Era 1 (año 892+).`
        });

        const ev = eventMap.get(evt.id);
        if (ev) {
          ev.hasAnachronism = true;
          ev.anachronismIds = [...(ev.anachronismIds || []), anachronismId];
        }
      }
    }
  });

  // Calculate causal coherence score (100 base, -15 per critical, -6 per warning)
  const criticalCount = anachronisms.filter(a => a.severity === 'CRITICA').length;
  const warningCount = anachronisms.filter(a => a.severity === 'ADVERTENCIA').length;
  const suggestionCount = anachronisms.filter(a => a.severity === 'SUGERENCIA').length;

  const penalty = (criticalCount * 18) + (warningCount * 8) + (suggestionCount * 3);
  const causalCoherenceScore = Math.max(0, 100 - penalty);

  return {
    events: Array.from(eventMap.values()).sort((a, b) => a.year - b.year),
    anachronisms,
    causalCoherenceScore,
    criticalCount,
    warningCount,
    suggestionCount
  };
}
