import { describe, it, expect } from 'vitest';
import { extractStoryGraph } from './storyGraphExtractor';
import { Chapter, NovelCharacter, StarSystem } from '../types';

function makeChapter(overrides: Partial<Chapter> & Pick<Chapter, 'id' | 'number' | 'title'>): Chapter {
  return {
    status: 'BORRADOR',
    systemId: '',
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
  name: 'Sura Vance',
  factionId: 'FOSS_COLLECTIVE',
  role: 'Depuradora',
  summary: '',
  signatureImplants: '',
  typicalAbilities: [],
  notes: '',
};

const SYS_A: StarSystem = {
  id: 'SYS_A',
  name: 'Aethelgard',
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

const SYS_B: StarSystem = { ...SYS_A, id: 'SYS_B', name: 'Malform' };

describe('extractStoryGraph', () => {
  it('creates a node for every character, star system, syscall and exploit given', () => {
    const graph = extractStoryGraph([], [CHAR_A], [SYS_A], [], [], []);
    const ids = graph.nodes.map((n) => n.id);
    expect(ids).toContain('CHAR_A');
    expect(ids).toContain('SYS_A');
  });

  it('records which chapters a character appears in via explicit characterIds', () => {
    const chapter = makeChapter({ id: 'C1', number: 1, title: 'Cap 1', characterIds: ['CHAR_A'] });
    const graph = extractStoryGraph([chapter], [CHAR_A], [], [], [], []);
    const charNode = graph.nodes.find((n) => n.id === 'CHAR_A');
    expect(charNode?.chapterOccurrences).toEqual([1]);
  });

  it('also detects a character via a text mention of their name, without an explicit characterId', () => {
    const chapter = makeChapter({
      id: 'C1',
      number: 1,
      title: 'Cap 1',
      content: 'Sura Vance caminó por el pasillo de metal.',
    });
    const graph = extractStoryGraph([chapter], [CHAR_A], [], [], [], []);
    const charNode = graph.nodes.find((n) => n.id === 'CHAR_A');
    expect(charNode?.chapterOccurrences).toEqual([1]);
  });

  it('links a character to the star system they are located in within a chapter', () => {
    const chapter = makeChapter({
      id: 'C1',
      number: 1,
      title: 'Cap 1',
      systemId: 'SYS_A',
      characterIds: ['CHAR_A'],
    });
    const graph = extractStoryGraph([chapter], [CHAR_A], [SYS_A], [], [], []);
    const link = graph.links.find((l) => l.type === 'UBICADO_EN');
    expect(link).toBeDefined();
  });

  it('flags an impossible instant jump between star systems with no travel mentioned in the prose', () => {
    const ch1 = makeChapter({ id: 'C1', number: 1, title: 'Cap 1', systemId: 'SYS_A', characterIds: ['CHAR_A'] });
    const ch2 = makeChapter({
      id: 'C2',
      number: 2,
      title: 'Cap 2',
      systemId: 'SYS_B',
      characterIds: ['CHAR_A'],
      content: 'Sura despertó de golpe en la otra punta de la galaxia.',
    });
    const graph = extractStoryGraph([ch1, ch2], [CHAR_A], [SYS_A, SYS_B], [], [], []);
    expect(graph.inconsistencies.some((i) => i.type === 'UBICACION_IMPOSIBLE')).toBe(true);
  });

  it('does NOT flag a system change when the prose mentions the transit', () => {
    const ch1 = makeChapter({ id: 'C1', number: 1, title: 'Cap 1', systemId: 'SYS_A', characterIds: ['CHAR_A'] });
    const ch2 = makeChapter({
      id: 'C2',
      number: 2,
      title: 'Cap 2',
      systemId: 'SYS_B',
      characterIds: ['CHAR_A'],
      content: 'Tras dos semanas de viaje en salto, Sura llegó a Malform.',
    });
    const graph = extractStoryGraph([ch1, ch2], [CHAR_A], [SYS_A, SYS_B], [], [], []);
    expect(graph.inconsistencies.some((i) => i.type === 'UBICACION_IMPOSIBLE')).toBe(false);
  });

  it('does NOT flag anything when the character stays in the same star system', () => {
    const ch1 = makeChapter({ id: 'C1', number: 1, title: 'Cap 1', systemId: 'SYS_A', characterIds: ['CHAR_A'] });
    const ch2 = makeChapter({ id: 'C2', number: 2, title: 'Cap 2', systemId: 'SYS_A', characterIds: ['CHAR_A'] });
    const graph = extractStoryGraph([ch1, ch2], [CHAR_A], [SYS_A], [], [], []);
    expect(graph.inconsistencies.some((i) => i.type === 'UBICACION_IMPOSIBLE')).toBe(false);
  });
});
