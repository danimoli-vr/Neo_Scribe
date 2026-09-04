export type SubstrateStatus = 'STABLE' | 'THROTTLED' | 'LEAK_WARNING' | 'KERNEL_PANIC';

export interface UniversalConstant {
  id: string;
  name: string;
  symbol: string;
  nominalValue: string;
  registerAddress: string;
  exploitPotential: string;
  panicRisk: string;
  layer: 'L0_PLANCK' | 'L1_RELAY' | 'L2_RUNTIME';
}

export interface Syscall {
  id: string;
  name: string;
  signature: string;
  category: 'TERMODINÁMICA' | 'GRAVITATORIA' | 'INERCIA' | 'ESPACIO_TIEMPO' | 'MEMORIA_MATERIA';
  description: string;
  computeCostMFlops: number;
  ramAreaKb: number;
  leakRiskPercent: number;
  panicTrigger: string;
  sensorySensation: string;
}

export interface ExploitScript {
  id: string;
  name: string;
  authorFaction: 'FOSS_ARCHEOLOGISTS' | 'SACRED_ROOT' | 'OUTLAW_DEBUGGER';
  targetDomain: string;
  computeRequirement: number; // in GFlops/m3
  ramRequirement: number; // in MB/m3
  leakGenerationRate: number; // %/sec
  panicThreshold: number; // %
  codePreview: string;
  physicalManifestation: string;
  tacticalApplication: string;
  catastrophicFailure: string;
}

export interface Faction {
  id: string;
  name: string;
  shortName: string;
  ideology: string;
  drmStance: string;
  motto: string;
  compilerTech: string;
  archeologyMethod: string;
  keyArchetypes: {
    role: string;
    title: string;
    description: string;
    typicalImplants: string;
  }[];
  combatDoctrine: string;
  badgeColor: string;
}

export interface StarSystem {
  id: string;
  name: string;
  coordinates: string;
  planckBandwidth: 'ULTRA_ALTO' | 'ESTÁNDAR' | 'DEGRADADO_PERIFÉRICO' | 'FRONTERA_CORRUPTA';
  bandwidthFlops: string;
  kernelStabilityPercent: number;
  drmPolicy: 'FOSS_LIBRE' | 'DRM_ORTODOXO_ESTRICTO' | 'ZONA_NEUTRAL_HACKEADA' | 'ANARQUÍA_FRAGMENTADA';
  politicalControl: string;
  precursorRuins: string;
  ftlRoutingLatency: string;
  economicModel: string;
  knownAnomalies: string[];
}

export interface LoreItem {
  id: string;
  name: string;
  category: 'artefacto' | 'exploit' | 'anomalia' | 'sistema_estelar';
  precursorArchitecture: string;
  technicalSpecs: string;
  loreAndDiscovery: string;
  exploitMechanic: string;
  failureMode: string;
  narrativeHook: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  title: string;
  sceneText: string;
  analysisType: string;
  score?: number;
  status?: string;
  markdownReport: string;
}

export interface SimulationState {
  activeExploits: string[];
  totalComputeUsed: number; // GFlops/m3
  maxComputeCapacity: number; // GFlops/m3
  totalRamUsed: number; // MB/m3
  maxRamCapacity: number; // MB/m3
  fragmentationPercent: number; // Memory leaks
  kernelPanicRiskPercent: number;
  status: SubstrateStatus;
  clockSkewMs: number; // Latency / lag in reality
  logs: {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERR' | 'PANIC' | 'DEBUG';
    message: string;
  }[];
}

export interface NovelCharacter {
  id: string;
  name: string;
  factionId: string;
  role: string;
  summary: string;
  signatureImplants: string;
  typicalAbilities: string[];
  notes: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  status: 'BORRADOR' | 'EN_REVISION' | 'CANON';
  systemId: string;
  locationDetails: string;
  characterIds: string[];
  abilityIds: string[];
  coherenceChecklist: {
    entropyRespected: boolean;
    bandwidthChecked: boolean;
    memoryLeaksCleaned: boolean;
    drmRulesRespected: boolean;
  };
  authorNotes: string;
  content: string;
  wordCount: number;
  updatedAt: string;
  diegeticCycle?: number;
  diegeticDateLabel?: string;
  isFlashback?: boolean;
}

export type TimelineEventCategory = 
  | 'CAPITULO_MANUSCRITO' 
  | 'HISTORIA_CANONICA' 
  | 'CATÁSTROFE_KERNEL' 
  | 'DESARROLLO_TECNOLOGICO' 
  | 'CONFLICTO_POLITICO';

export interface TimelineEra {
  id: string;
  name: string;
  code: string;
  startYear: number;
  endYear: number;
  description: string;
  kernelStatus: string;
  color: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  year: number; // e.g. 0, 892.4, 1784.3, 3042.188
  dateLabel: string; // "Ciclo 3042.188 // Planck Tick 0x4F"
  eraId: string;
  category: TimelineEventCategory;
  description: string;
  systemId?: string;
  locationDetails?: string;
  characterIds?: string[];
  techOrArtifactIds?: string[];
  chapterNumber?: number;
  narrativeOrder?: number;
  isFlashbackOrAnalepsis?: boolean;
  authorNotes?: string;
  hasAnachronism?: boolean;
  anachronismIds?: string[];
}

export interface NarrativeAnachronism {
  id: string;
  type: 
    | 'DESPLAZAMIENTO_FTL_IMPOSIBLE' 
    | 'PARADOJA_CAUSAL' 
    | 'ANACRONISMO_TECNOLOGICO' 
    | 'DISCREPANCIA_ORDEN_DIEGETICO' 
    | 'COLISION_TEMPORAL_PERSONAJES'
    | 'ANACRONISMO_POLITICO_DRM';
  severity: 'CRITICA' | 'ADVERTENCIA' | 'SUGERENCIA';
  title: string;
  description: string;
  detectedInEventIds: string[];
  affectedChapterNumbers?: number[];
  explanation: string;
  recommendation: string;
  deltaCycle?: number;
  requiredDeltaCycle?: number;
}

export type GraphNodeType = 'PERSONAJE' | 'PLANETA' | 'TECNOLOGIA';

export interface PlotInconsistency {
  id: string;
  type: 
    | 'UBICACION_IMPOSIBLE' 
    | 'SOBRECARGA_TERMICA' 
    | 'VIOLACION_DRM' 
    | 'CONFLICTO_FACCION' 
    | 'DISCREPANCIA_TEXTO' 
    | 'ENTIDAD_HUERFANA';
  severity: 'CRITICA' | 'ADVERTENCIA' | 'SUGERENCIA';
  title: string;
  description: string;
  affectedNodeIds: string[];
  affectedChapterNumbers: number[];
  recommendation: string;
}

export interface StoryGraphNode {
  id: string;
  name: string;
  type: GraphNodeType;
  subType?: string;
  roleOrCategory: string;
  description: string;
  factionOrSystem?: string;
  chapterOccurrences: number[];
  degree: number;
  inconsistencyCount: number;
  radius: number;
  color: string;
  connectedLinks?: StoryGraphLink[];
  // D3 force simulation properties
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface StoryGraphLink {
  id: string;
  source: string | StoryGraphNode;
  target: string | StoryGraphNode;
  type: 'CO_PRESENCIA' | 'UBICADO_EN' | 'USA_TECNOLOGIA' | 'DESPLEGADO_EN' | 'LEALTAD';
  chapterNumbers: number[];
  weight: number;
  label: string;
  hasInconsistency?: boolean;
}

export interface StoryGraphData {
  nodes: StoryGraphNode[];
  links: StoryGraphLink[];
  inconsistencies: PlotInconsistency[];
  analyzedChaptersCount: number;
}

// --------------------------------------------------------
// THEMES & GENRE PRESETS
// --------------------------------------------------------

export type GenrePresetId = 'scifi' | 'fantasy' | 'noir' | 'romance' | 'history' | 'minimal';
export type VisualThemeId = 'cyber' | 'grimoire' | 'detective' | 'velvet' | 'parchment' | 'minimalist';

export interface GenreTerms {
  appName: string;
  appTagline: string;
  genreName: string;
  authorWorkName: string;
  // Module titles
  overviewTitle: string;
  chaptersTitle: string;
  graphTitle: string;
  timelineTitle: string;
  architectureTitle: string;
  atlasTitle: string;
  factionsTitle: string;
  loreTitle: string;
  sandboxTitle: string;
  auditorTitle: string;
  // Module short descriptions
  overviewDesc: string;
  chaptersDesc: string;
  graphDesc: string;
  timelineDesc: string;
  architectureDesc: string;
  atlasDesc: string;
  factionsDesc: string;
  loreDesc: string;
  sandboxDesc: string;
  auditorDesc: string;
  // Entity and section terms
  entityCharacters: string;
  entityLocations: string;
  entitySystemsOrMagic: string;
  entityArtifactsOrExploits: string;
  entityFactionsOrHouses: string;
  worldbuildingSectionTitle: string;
  auditorSectionTitle: string;
  writingSectionTitle: string;
}

export interface GenrePreset {
  id: GenrePresetId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  defaultThemeId: VisualThemeId;
  accentColor: string;
  badge: string;
  terms: GenreTerms;
}

export interface VisualTheme {
  id: VisualThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  primaryHex: string;
  secondaryHex: string;
  bgHex: string;
  panelHex: string;
  borderHex: string;
  fontClass: string;
  fontLabel?: string;
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  previewColors: [string, string, string, string];
  cssClass: string;
}

export type ModuleId = 
  | 'overview'
  | 'chapters'
  | 'characters'
  | 'graph'
  | 'timeline'
  | 'architecture'
  | 'atlas'
  | 'factions'
  | 'lore'
  | 'sandbox'
  | 'auditor';

export interface ChapterSnapshot {
  id: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
  description: string;
}

export interface ManuscriptImportItem {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export type ModuleCategory = 'main' | 'writing' | 'worldbuilding' | 'auditor';

export interface CustomModuleConfig {
  id: ModuleId;
  title: string;
  desc: string;
  enabled: boolean;
  iconName: string;
  code: string;
  category: ModuleCategory;
}

export type CustomModuleTemplateType = 'catalog' | 'lexicon' | 'matrix' | 'freeform';

export interface CustomModuleField {
  key: string;
  label: string;
  value: string;
  type?: 'text' | 'number' | 'tag' | 'status';
}

export interface UserModuleItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  tags: string[];
  fields: CustomModuleField[];
  content: string;
  importance?: 'baja' | 'media' | 'alta' | 'critica';
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCustomModule {
  id: string; // e.g. 'custom_bestiary'
  title: string;
  desc: string;
  code: string; // e.g. '10', '11'
  iconName: string;
  category: ModuleCategory;
  templateType: CustomModuleTemplateType;
  enabled: boolean;
  items: UserModuleItem[];
  createdAt: string;
  updatedAt: string;
}

export type SectionTitles = {
  main?: string;
  writing: string;
  worldbuilding: string;
  auditor: string;
  [key: string]: string | undefined;
};

export interface WorldbuildingCustomization {
  modules: Partial<Record<ModuleId, Partial<CustomModuleConfig>>>;
  sectionTitles?: {
    writing?: string;
    worldbuilding?: string;
    auditor?: string;
  };
}
