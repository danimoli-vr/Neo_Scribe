import { describe, it, expect } from 'vitest';
import { buildUnifiedTimeline, auditTimelineAnachronisms } from './anachronismDetector';
import { Chapter, NovelCharacter, StarSystem, TimelineEvent } from '../types';

function makeEvent(overrides: Partial<TimelineEvent> & Pick<TimelineEvent, 'id' | 'title' | 'year'>): TimelineEvent {
  return {
    dateLabel: `Ciclo ${overrides.year}`,
    eraId: 'ERA_4_ACTUAL',
    category: 'HISTORIA_CANONICA',
    description: 'Evento de prueba.',
    ...overrides,
  };
}

function makeChapter(overrides: Partial<Chapter> & Pick<Chapter, 'id' | 'number' | 'title'>): Chapter {
  return {
    status: 'BORRADOR',
    systemId: 'SYS_TEST',
    locationDetails: '',
    characterIds: [],
    abilityIds: [],
    coherenceChecklist: {
      entropyRespected: true,
      bandwidthChecked: true,
      memoryLeaksCleaned: true,
      drmRulesRespected: true,
    },
    authorNotes: '',
    content: '',
    wordCount: 0,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const CHAR_A: NovelCharacter = {
  id: 'CHAR_A',
  name: 'Operadora de Prueba',
  factionId: 'FOSS_COLLECTIVE',
  role: 'Depuradora',
  summary: '',
  signatureImplants: '',
  typicalAbilities: [],
  notes: '',
};

const SYS_A: StarSystem = {
  id: 'SYS_TEST_A',
  name: 'Sistema de Prueba A',
  coordinates: '0,0,0',
  planckBandwidth: 'ESTÁNDAR',
  bandwidthFlops: '1 PFlops/m3',
  kernelStabilityPercent: 100,
  drmPolicy: 'FOSS_LIBRE',
  politicalControl: 'Nadie',
  precursorRuins: 'Ninguna',
  ftlRoutingLatency: '0ms',
  economicModel: 'N/A',
  knownAnomalies: [],
};

const SYS_B: StarSystem = { ...SYS_A, id: 'SYS_TEST_B', name: 'Sistema de Prueba B' };

describe('buildUnifiedTimeline', () => {
  it('injects a new chapter (no pre-existing canonical placeholder) as its own timeline event', () => {
    // Chapter number 99 has no canonical placeholder event, unlike 1/2 which do —
    // this exercises the "push a brand new event" branch rather than the "update
    // an existing placeholder" branch exercised by the next test.
    const chapter = makeChapter({ id: 'CH99', number: 99, title: 'El Comienzo', diegeticCycle: 5000 });
    const timeline = buildUnifiedTimeline([chapter]);
    const chapterEvent = timeline.find((e) => e.id === 'EVT_CHAP_99');
    expect(chapterEvent).toBeDefined();
    expect(chapterEvent?.title).toContain('El Comienzo');
    expect(chapterEvent?.year).toBe(5000);
  });

  it('updates the year/title of a pre-existing canonical placeholder event for an early chapter', () => {
    const chapter = makeChapter({ id: 'CH1', number: 1, title: 'Título Reescrito', diegeticCycle: 5000 });
    const timeline = buildUnifiedTimeline([chapter]);
    const chapterEvent = timeline.find((e) => e.chapterNumber === 1);
    expect(chapterEvent).toBeDefined();
    expect(chapterEvent?.title).toContain('Título Reescrito');
    expect(chapterEvent?.year).toBe(5000);
  });

  it('merges in custom events without duplicating ids already present', () => {
    const custom = makeEvent({ id: 'EVT_CUSTOM_1', title: 'Hito personalizado', year: 9999 });
    const timeline = buildUnifiedTimeline([], [custom, custom]);
    const matches = timeline.filter((e) => e.id === 'EVT_CUSTOM_1');
    expect(matches).toHaveLength(1);
  });

  it('returns events sorted ascending by diegetic year', () => {
    const timeline = buildUnifiedTimeline([]);
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i].year).toBeGreaterThanOrEqual(timeline[i - 1].year);
    }
  });
});

describe('auditTimelineAnachronisms', () => {
  it('flags an impossible FTL transit between two star systems for the same character', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'E1', title: 'Salida', year: 1000, systemId: 'SYS_TEST_A', characterIds: ['CHAR_A'] }),
      // Only 0.001 cycles later but in a different, unconnected system — far below any plausible transit time.
      makeEvent({ id: 'E2', title: 'Llegada', year: 1000.001, systemId: 'SYS_TEST_B', characterIds: ['CHAR_A'] }),
    ];

    const result = auditTimelineAnachronisms(events, [CHAR_A], [SYS_A, SYS_B]);

    expect(result.criticalCount).toBeGreaterThan(0);
    expect(result.anachronisms.some((a) => a.type === 'DESPLAZAMIENTO_FTL_IMPOSIBLE')).toBe(true);
  });

  it('does not flag a transit that respects the minimum FTL travel time', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'E1', title: 'Salida', year: 1000, systemId: 'SYS_TEST_A', characterIds: ['CHAR_A'] }),
      makeEvent({ id: 'E2', title: 'Llegada', year: 1050, systemId: 'SYS_TEST_B', characterIds: ['CHAR_A'] }),
    ];

    const result = auditTimelineAnachronisms(events, [CHAR_A], [SYS_A, SYS_B]);

    expect(result.anachronisms.some((a) => a.type === 'DESPLAZAMIENTO_FTL_IMPOSIBLE')).toBe(false);
    expect(result.causalCoherenceScore).toBe(100);
  });

  it('flags technology referenced before its canonical inception date', () => {
    const events: TimelineEvent[] = [
      makeEvent({
        id: 'E1',
        title: 'Uso prematuro',
        year: 500, // sys_thermal_clamp is not invented until year 892.4
        techOrArtifactIds: ['sys_thermal_clamp'],
      }),
    ];

    const result = auditTimelineAnachronisms(events, [], []);

    expect(result.anachronisms.some((a) => a.type === 'ANACRONISMO_TECNOLOGICO')).toBe(true);
  });

  it('flags an unmarked flashback when book order and diegetic order disagree', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'C1', title: 'Cap 1', year: 2000, category: 'CAPITULO_MANUSCRITO', chapterNumber: 1 }),
      makeEvent({
        id: 'C2',
        title: 'Cap 2',
        year: 1000, // earlier diegetically than chapter 1, but read second
        category: 'CAPITULO_MANUSCRITO',
        chapterNumber: 2,
        isFlashbackOrAnalepsis: false,
      }),
    ];

    const result = auditTimelineAnachronisms(events, [], []);

    expect(result.anachronisms.some((a) => a.type === 'DISCREPANCIA_ORDEN_DIEGETICO')).toBe(true);
  });

  it('does not flag order discrepancy when the earlier chapter is explicitly marked as a flashback', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'C1', title: 'Cap 1', year: 2000, category: 'CAPITULO_MANUSCRITO', chapterNumber: 1 }),
      makeEvent({
        id: 'C2',
        title: 'Cap 2 (flashback)',
        year: 1000,
        category: 'CAPITULO_MANUSCRITO',
        chapterNumber: 2,
        isFlashbackOrAnalepsis: true,
      }),
    ];

    const result = auditTimelineAnachronisms(events, [], []);

    expect(result.anachronisms.some((a) => a.type === 'DISCREPANCIA_ORDEN_DIEGETICO')).toBe(false);
  });

  it('never returns a coherence score below 0 even with many critical anachronisms', () => {
    const events: TimelineEvent[] = Array.from({ length: 10 }, (_, i) =>
      makeEvent({
        id: `E${i}`,
        title: `Evento ${i}`,
        year: 500 + i,
        techOrArtifactIds: ['sys_thermal_clamp'],
      })
    );

    const result = auditTimelineAnachronisms(events, [], []);
    expect(result.causalCoherenceScore).toBeGreaterThanOrEqual(0);
  });
});
