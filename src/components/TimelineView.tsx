import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, 
  Sparkles, Filter, Search, Plus, Calendar, Compass, ArrowRight, 
  BookOpen, Network, ShieldCheck, Download, Edit3, Trash2, RotateCcw, 
  ChevronRight, Info, Check, Eye, ChevronDown, ExternalLink, Zap,
  Globe, User, Cpu, FileText, Layers
} from 'lucide-react';
import { 
  TimelineEvent, 
  TimelineEra, 
  NarrativeAnachronism, 
  Chapter, 
  NovelCharacter, 
  StarSystem, 
  Syscall, 
  ExploitScript 
} from '../types';
import { CANONICAL_ERAS, CANONICAL_TIMELINE_EVENTS, MIN_FTL_TRANSIT_CYCLES } from '../data/canonicalTimeline';
import { 
  buildUnifiedTimeline, 
  auditTimelineAnachronisms, 
  CANONICAL_TECH_INCEPTION,
  TimelineAuditResult 
} from '../utils/anachronismDetector';
import { autosaveService } from '../services/autosaveService';

interface TimelineViewProps {
  chapters: Chapter[];
  characters: NovelCharacter[];
  starSystems: StarSystem[];
  syscalls: Syscall[];
  exploits: ExploitScript[];
  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onOpenGraph?: () => void;
  onSendToAuditor?: (text: string, title: string) => void;
  onUpdateChapter?: (updatedChapter: Chapter) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  chapters,
  characters,
  starSystems,
  syscalls,
  exploits,
  onOpenChapterInEditor,
  onOpenGraph,
  onSendToAuditor,
  onUpdateChapter
}) => {
  // Custom user-defined timeline events persisted in localStorage
  const [customEvents, setCustomEvents] = useState<TimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_timeline_custom_events_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom timeline events:', e);
    }
    return [];
  });

  // Active filters
  const [selectedEraId, setSelectedEraId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAnachronisms, setOnlyAnachronisms] = useState<boolean>(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('ALL');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'STREAM' | 'AUDIT_MATRIX'>('STREAM');

  // Modal states
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedAnachronism, setSelectedAnachronism] = useState<NarrativeAnachronism | null>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventYear, setNewEventYear] = useState<number>(3042.200);
  const [newEventDateLabel, setNewEventDateLabel] = useState<string>('Ciclo 3042.200 // Planck Tick 0x9B');
  const [newEventEraId, setNewEventEraId] = useState<string>('ERA_4_ACTUAL');
  const [newEventCategory, setNewEventCategory] = useState<TimelineEvent['category']>('HISTORIA_CANONICA');
  const [newEventDescription, setNewEventDescription] = useState<string>('');
  const [newEventSystemId, setNewEventSystemId] = useState<string>('SYS_01_AETHEL');
  const [newEventLocation, setNewEventLocation] = useState<string>('');
  const [newEventCharacterIds, setNewEventCharacterIds] = useState<string[]>([]);
  const [newEventTechIds, setNewEventTechIds] = useState<string[]>([]);
  const [newEventIsFlashback, setNewEventIsFlashback] = useState<boolean>(false);

  const isInitialEventsMount = React.useRef(true);

  // Save custom events to localStorage using debounced autosaveService (3s idle timer)
  useEffect(() => {
    if (isInitialEventsMount.current) {
      isInitialEventsMount.current = false;
      return;
    }
    autosaveService.scheduleSave('krnl_timeline_custom_events_v1', customEvents);
  }, [customEvents]);

  // Compute unified timeline and run anachronism audit
  const auditResult: TimelineAuditResult = useMemo(() => {
    const unified = buildUnifiedTimeline(chapters, customEvents);
    return auditTimelineAnachronisms(unified, characters, starSystems);
  }, [chapters, customEvents, characters, starSystems]);

  const { events, anachronisms, causalCoherenceScore, criticalCount, warningCount, suggestionCount } = auditResult;

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Era filter
      if (selectedEraId !== 'ALL' && evt.eraId !== selectedEraId) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;

      // Only anachronisms filter
      if (onlyAnachronisms && !evt.hasAnachronism) return false;

      // Character filter
      if (selectedCharacterId !== 'ALL' && !(evt.characterIds || []).includes(selectedCharacterId)) return false;

      // Star system filter
      if (selectedSystemId !== 'ALL' && evt.systemId !== selectedSystemId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesLoc = (evt.locationDetails || '').toLowerCase().includes(q);
        const matchesChar = (evt.characterIds || []).some(id => {
          const charName = characters.find(c => c.id === id)?.name || id;
          return charName.toLowerCase().includes(q);
        });
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesChar) return false;
      }

      return true;
    });
  }, [events, selectedEraId, selectedCategory, onlyAnachronisms, selectedCharacterId, selectedSystemId, searchQuery, characters]);

  // Helper maps
  const charMap = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
  const sysMap = useMemo(() => new Map(starSystems.map(s => [s.id, s])), [starSystems]);
  const eraMap = useMemo(() => new Map(CANONICAL_ERAS.map(e => [e.id, e])), []);

  // Quick Action: Reconcile FTL Transit Deficit
  const handleReconcileFtl = (anac: NarrativeAnachronism) => {
    if (anac.detectedInEventIds.length < 2 || anac.requiredDeltaCycle === undefined) return;
    const targetEventId = anac.detectedInEventIds[1];
    const prevEventId = anac.detectedInEventIds[0];

    const prevEvt = events.find(e => e.id === prevEventId);
    const targetEvt = events.find(e => e.id === targetEventId);
    if (!prevEvt || !targetEvt) return;

    const newYear = Number((prevEvt.year + anac.requiredDeltaCycle + 0.0010).toFixed(4));
    const newDateLabel = `Ciclo ${newYear.toFixed(3)} // Tránsito FTL Reconciliado`;

    // If target is a chapter, update chapter in parent and localStorage
    if (targetEvt.chapterNumber !== undefined) {
      const chap = chapters.find(c => c.number === targetEvt.chapterNumber);
      if (chap) {
        const updated = {
          ...chap,
          diegeticCycle: newYear,
          diegeticDateLabel: newDateLabel
        };
        if (onUpdateChapter) onUpdateChapter(updated);
        // also schedule save to localStorage
        const allSaved = chapters.map(c => c.id === chap.id ? updated : c);
        autosaveService.scheduleSave('krnl_chapters_v1', allSaved, true);
      }
    } else {
      // Custom event
      setCustomEvents(prev => prev.map(e => e.id === targetEvt.id ? { ...e, year: newYear, dateLabel: newDateLabel } : e));
    }
  };

  // Quick Action: Mark Chapter as Flashback / Analepsis
  const handleMarkAsFlashback = (chapterNumber: number) => {
    const chap = chapters.find(c => c.number === chapterNumber);
    if (!chap) return;
    const updated: Chapter = {
      ...chap,
      isFlashback: true
    };
    if (onUpdateChapter) onUpdateChapter(updated);
    const allSaved = chapters.map(c => c.id === chap.id ? updated : c);
    autosaveService.scheduleSave('krnl_chapters_v1', allSaved, true);
  };

  // Add new custom event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt: TimelineEvent = {
      id: `EVT_CUSTOM_${Date.now()}`,
      title: newEventTitle.trim(),
      year: Number(newEventYear),
      dateLabel: newEventDateLabel.trim() || `Ciclo ${Number(newEventYear).toFixed(3)}`,
      eraId: newEventEraId,
      category: newEventCategory,
      description: newEventDescription.trim(),
      systemId: newEventSystemId,
      locationDetails: newEventLocation.trim(),
      characterIds: newEventCharacterIds,
      techOrArtifactIds: newEventTechIds,
      isFlashbackOrAnalepsis: newEventIsFlashback
    };

    setCustomEvents(prev => [...prev, newEvt]);
    setIsCreateModalOpen(false);

    // Reset fields
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventLocation('');
    setNewEventCharacterIds([]);
    setNewEventTechIds([]);
  };

  // Delete custom event
  const handleDeleteCustomEvent = (id: string) => {
    setCustomEvents(prev => prev.filter(e => e.id !== id));
    if (editingEvent?.id === id) setEditingEvent(null);
  };

  // Export timeline to Markdown
  const handleExportMarkdown = () => {
    let md = `# CRONOLOGÍA DIEGÉTICA & AUDITORÍA DE PLANCK: NOVELA KRNL.VACUO\n`;
    md += `*Generado por Suite KRNL.VACUO - Índice de Coherencia Causal: ${causalCoherenceScore}%*\n\n`;
    md += `## RESUMEN DE ANOMALÍAS ESPACIOTEMPORALES\n`;
    md += `- **Anacronismos Críticos:** ${criticalCount}\n`;
    md += `- **Advertencias de Secuencia:** ${warningCount}\n`;
    md += `- **Sugerencias:** ${suggestionCount}\n\n`;

    if (anachronisms.length > 0) {
      md += `### LISTADO DE ANACRONISMOS DETECTADOS\n`;
      anachronisms.forEach((a, i) => {
        md += `#### ${i + 1}. [${a.severity}] ${a.title}\n`;
        md += `- **Descripción:** ${a.description}\n`;
        md += `- **Explicación Causal:** ${a.explanation}\n`;
        md += `- **Recomendación:** ${a.recommendation}\n\n`;
      });
    }

    md += `## LÍNEA TEMPORAL DE EVENTOS Y CAPÍTULOS\n\n`;
    events.forEach(evt => {
      const era = eraMap.get(evt.eraId)?.name || evt.eraId;
      const sys = sysMap.get(evt.systemId || '')?.name || evt.systemId || 'Espacio Profundo';
      const statusIcon = evt.hasAnachronism ? '⚠️ [ANACRONISMO]' : '✅ [COHERENTE]';

      md += `### ${statusIcon} ${evt.title} (${evt.dateLabel})\n`;
      md += `- **Época:** ${era} (Año ${evt.year})\n`;
      md += `- **Categoría:** ${evt.category}\n`;
      md += `- **Ubicación:** ${sys} - ${evt.locationDetails || 'N/A'}\n`;
      if (evt.characterIds && evt.characterIds.length > 0) {
        const names = evt.characterIds.map(id => charMap.get(id)?.name || id).join(', ');
        md += `- **Personajes:** ${names}\n`;
      }
      md += `- **Descripción:** ${evt.description}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/30 border border-cyan-800/80 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>CRONOLOGÍA_ESPACIOTEMPORAL // AUDITOR_DE_ANACRONISMOS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
              Línea Temporal Interactiva & Control de Causalidad
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Supervisa la evolución diegética desde <strong className="text-white">El Gran Commit</strong> hasta los eventos en curso del manuscrito. 
              Detecta automáticamente <strong className="text-rose-400">violaciones de tránsito FTL</strong>, anacronismos tecnológicos y saltos temporales invertidos.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'STREAM' ? 'AUDIT_MATRIX' : 'STREAM')}
              className={`px-3 py-1.5 rounded-sm border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'AUDIT_MATRIX'
                  ? 'bg-rose-950/60 border-rose-600 text-rose-300 font-bold shadow-sm'
                  : 'bg-[#0d0d0f] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{viewMode === 'AUDIT_MATRIX' ? 'Volver a Vista Flujo' : `Radar de Anacronismos (${anachronisms.length})`}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-sm bg-[#0d0d0f] hover:bg-[#181820] text-slate-200 border border-[#1e293b] hover:border-cyan-500/60 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar cronología completa en formato Markdown"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedExport ? '¡Copiado!' : 'Exportar Cronología'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Hito</span>
            </button>
          </div>
        </div>

        {/* Causal Health Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#1e293b] text-xs font-mono">
          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ÍNDICE DE CAUSALIDAD</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-base font-bold ${causalCoherenceScore >= 85 ? 'text-emerald-400' : causalCoherenceScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {causalCoherenceScore}%
              </span>
              <div className="flex-1 bg-[#15151a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
                <div 
                  className={`h-full ${causalCoherenceScore >= 85 ? 'bg-emerald-400' : causalCoherenceScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${causalCoherenceScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ANACRONISMOS CRÍTICOS</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-base font-bold ${criticalCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {criticalCount}
              </span>
              {criticalCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xs uppercase">
                  Paradoja FTL/Causal
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ADVERTENCIAS DE SECUENCIA</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-base font-bold ${warningCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {warningCount}
              </span>
              <span className="text-[10px] text-slate-500">alertas menores</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">TOTAL HITOS ANALIZADOS</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-white font-bold text-base">{events.length}</span>
              <span className="text-[10px] text-slate-500">({chapters.length} capítulos)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Era Navigation Strip */}
      <div className="bg-[#0e0f14] border border-[#1e293b] rounded-sm p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>HORIZONTE COSMOLÓGICO POR ÉPOCAS:</span>
          </span>
          <span className="text-[10px] text-slate-500">Filtrar segmento temporal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedEraId('ALL')}
            className={`p-2 rounded-sm border text-left transition-all cursor-pointer ${
              selectedEraId === 'ALL'
                ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm'
                : 'bg-[#12131a] border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <div className="text-[10px] text-cyan-400 font-bold uppercase">CANON COMPLETO</div>
            <div className="text-xs font-bold text-white truncate">Todas las Épocas</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{events.length} hitos totales</div>
          </button>

          {CANONICAL_ERAS.map(era => {
            const isSelected = selectedEraId === era.id;
            const countInEra = events.filter(e => e.eraId === era.id).length;
            const hasAnacInEra = events.some(e => e.eraId === era.id && e.hasAnachronism);

            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setSelectedEraId(era.id)}
                className={`p-2 rounded-sm border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#1a1c29] border-cyan-400 text-white shadow-sm'
                    : 'bg-[#12131a] border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {hasAnacInEra && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Anacronismo detectado en esta era" />
                )}
                <div className="text-[10px] font-bold uppercase" style={{ color: era.color }}>
                  {era.code} // {era.startYear}-{era.endYear}
                </div>
                <div className="text-xs font-bold text-white truncate" title={era.name}>
                  {era.name.split('//')[0].trim()}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{countInEra} hitos</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e0f14] border border-[#1e293b] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, personaje, sistema o descripción..."
              className="w-full bg-[#0a0a0d] border border-[#1e293b] rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0a0a0d] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="CAPITULO_MANUSCRITO">Capítulos del Manuscrito</option>
            <option value="HISTORIA_CANONICA">Historia Canónica</option>
            <option value="CATÁSTROFE_KERNEL">Catástrofes de Kernel</option>
            <option value="DESARROLLO_TECNOLOGICO">Desarrollo Tecnológico</option>
            <option value="CONFLICTO_POLITICO">Conflicto Político</option>
          </select>

          {/* Character Filter */}
          <select
            value={selectedCharacterId}
            onChange={(e) => setSelectedCharacterId(e.target.value)}
            className="bg-[#0a0a0d] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
          >
            <option value="ALL">Todos los Personajes</option>
            {characters.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* System Filter */}
          <select
            value={selectedSystemId}
            onChange={(e) => setSelectedSystemId(e.target.value)}
            className="bg-[#0a0a0d] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
          >
            <option value="ALL">Todos los Sistemas</option>
            {starSystems.map(s => (
              <option key={s.id} value={s.id}>{s.name.split('(')[0]}</option>
            ))}
          </select>
        </div>

        {/* Toggle: Only Anachronisms */}
        <button
          type="button"
          onClick={() => setOnlyAnachronisms(!onlyAnachronisms)}
          className={`px-3 py-1.5 rounded-sm border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            onlyAnachronisms
              ? 'bg-rose-950/70 text-rose-300 border-rose-500 font-bold shadow-sm'
              : 'bg-[#0a0a0d] text-slate-400 hover:text-white border-[#1e293b]'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${onlyAnachronisms ? 'text-rose-400' : 'text-slate-500'}`} />
          <span>Solo Anacronismos ({anachronisms.length})</span>
        </button>
      </div>

      {/* Main View Mode Selector */}
      {viewMode === 'AUDIT_MATRIX' ? (
        /* Dedicated Radar & Audit Matrix Panel */
        <div className="space-y-4 font-mono">
          <div className="bg-[#0f1017] border border-[#1e293b] rounded-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
              <div>
                <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  RADAR DE ANACRONISMOS NARRATIVOS & MATRIZ DE CAUSALIDAD
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Listado exhaustivo de paradojas de viaje FTL, discrepancias de orden narrativo e invenciones de tecnología antes de tiempo.
                </p>
              </div>

              {onSendToAuditor && anachronisms.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const report = `AUDITORÍA DE CRONOLOGÍA Y ANACRONISMOS:\n\n${anachronisms.map(a => `[${a.severity}] ${a.title}\n${a.description}\nRecomendación: ${a.recommendation}`).join('\n\n')}`;
                    onSendToAuditor(report, 'Análisis de Paradojas Temporales y FTL');
                  }}
                  className="px-3 py-1.5 rounded-sm bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auditar Informe con Gemini</span>
                </button>
              )}
            </div>

            {anachronisms.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0a0e] border border-[#1e293b] rounded-sm space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white uppercase">Causalidad Espaciotemporal 100% Coherente</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No se han detectado teletransportaciones imposibles, saltos de FTL deficitarios ni uso anacrónico de reliquias en los capítulos actuales.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {anachronisms.map((anac) => {
                  const isFtl = anac.type === 'DESPLAZAMIENTO_FTL_IMPOSIBLE';
                  const isOrder = anac.type === 'DISCREPANCIA_ORDEN_DIEGETICO';

                  return (
                    <div
                      key={anac.id}
                      className={`p-4 rounded-sm border transition-all ${
                        anac.severity === 'CRITICA'
                          ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-600'
                          : 'bg-amber-950/20 border-amber-800/80 hover:border-amber-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                              anac.severity === 'CRITICA'
                                ? 'bg-rose-500 text-black'
                                : 'bg-amber-500 text-black'
                            }`}>
                              {anac.severity} // {anac.type.replace(/_/g, ' ')}
                            </span>
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              {anac.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {anac.description}
                          </p>

                          {/* Physics causality breakdown */}
                          <div className="p-2.5 bg-[#090a0f] border border-[#1e293b] rounded-xs text-[11px] text-slate-400 space-y-1">
                            <div>
                              <strong className="text-cyan-400">Explicación de Física del Sustrato:</strong> {anac.explanation}
                            </div>
                            <div className="text-emerald-400 font-bold">
                              💡 Solución Recomendada: <span className="font-normal text-slate-300">{anac.recommendation}</span>
                            </div>
                          </div>
                        </div>

                        {/* One-click Reconciliation Actions */}
                        <div className="flex flex-col gap-2 shrink-0 sm:min-w-[180px]">
                          {isFtl && anac.requiredDeltaCycle !== undefined && (
                            <button
                              type="button"
                              onClick={() => handleReconcileFtl(anac)}
                              className="w-full px-3 py-1.5 rounded-sm bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              title="Ajusta automáticamente la fecha diegética para cumplir con la velocidad de salto FTL"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Reconciliar FTL</span>
                            </button>
                          )}

                          {isOrder && anac.affectedChapterNumbers && anac.affectedChapterNumbers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsFlashback(anac.affectedChapterNumbers![1])}
                              className="w-full px-3 py-1.5 rounded-sm bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              title="Marcar este capítulo como flashback / analepsis legítimo"
                            >
                              <Check className="w-3.5 h-3.5 text-amber-400" />
                              <span>Marcar Analepsis</span>
                            </button>
                          )}

                          {anac.affectedChapterNumbers && anac.affectedChapterNumbers.length > 0 && onOpenChapterInEditor && (
                            <button
                              type="button"
                              onClick={() => onOpenChapterInEditor(anac.affectedChapterNumbers![0])}
                              className="w-full px-3 py-1.5 rounded-sm bg-[#12141c] hover:bg-[#1a1c26] border border-[#1e293b] text-slate-300 hover:text-white text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-cyan-400" />
                              <span>Abrir Cap {anac.affectedChapterNumbers[0]}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Visual Interactive Timeline Stream */
        <div className="space-y-4 font-mono">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-[#0f1017] border border-[#1e293b] rounded-sm space-y-3">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase">No se encontraron hitos en este filtro</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba restablecer los filtros de búsqueda o seleccionar &quot;Todas las Épocas&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedEraId('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                  setOnlyAnachronisms(false);
                  setSelectedCharacterId('ALL');
                  setSelectedSystemId('ALL');
                }}
                className="px-3 py-1.5 rounded-sm bg-[#12141d] hover:bg-slate-800 text-cyan-300 border border-cyan-800 text-xs uppercase tracking-wider cursor-pointer"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="relative pl-4 sm:pl-8 border-l-2 border-[#1e293b]/80 space-y-6">
              {filteredEvents.map((evt, idx) => {
                const era = eraMap.get(evt.eraId);
                const starSystem = sysMap.get(evt.systemId || '');
                const isChapter = evt.category === 'CAPITULO_MANUSCRITO';
                const hasAnac = evt.hasAnachronism;

                // Category color badge
                let categoryBadgeColor = 'text-cyan-400 border-cyan-800/80 bg-cyan-950/30';
                if (evt.category === 'CATÁSTROFE_KERNEL') categoryBadgeColor = 'text-rose-400 border-rose-800/80 bg-rose-950/30';
                if (evt.category === 'CONFLICTO_POLITICO') categoryBadgeColor = 'text-purple-400 border-purple-800/80 bg-purple-950/30';
                if (evt.category === 'DESARROLLO_TECNOLOGICO') categoryBadgeColor = 'text-emerald-400 border-emerald-800/80 bg-emerald-950/30';
                if (evt.category === 'HISTORIA_CANONICA') categoryBadgeColor = 'text-amber-400 border-amber-800/80 bg-amber-950/30';

                // Compute time delta from previous event in list
                const prevEvt = idx > 0 ? filteredEvents[idx - 1] : null;
                const deltaFromPrev = prevEvt ? (evt.year - prevEvt.year) : null;

                return (
                  <div key={evt.id} className="relative group">
                    {/* Visual Node Pin on Timeline Axis */}
                    <div 
                      className={`absolute -left-[25px] sm:-left-[41px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        hasAnac
                          ? 'bg-rose-950 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                          : isChapter
                          ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-[#12131a] border-slate-600'
                      }`}
                      style={era && !hasAnac && !isChapter ? { borderColor: era.color } : {}}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${hasAnac ? 'bg-rose-400' : isChapter ? 'bg-cyan-300' : 'bg-slate-400'}`} />
                    </div>

                    {/* Inter-Event Delta Badge (if noticeable transition) */}
                    {deltaFromPrev !== null && Math.abs(deltaFromPrev) > 0.0001 && (
                      <div className="mb-2 -mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                        <div className="w-3 h-px bg-[#1e293b]" />
                        <span className="px-1.5 py-0.5 rounded-xs bg-[#0b0c10] border border-[#1e293b]">
                          Δt: {deltaFromPrev > 0 ? `+${deltaFromPrev.toFixed(3)}` : deltaFromPrev.toFixed(3)} ciclos 
                          ({deltaFromPrev >= 1 ? `${Math.round(deltaFromPrev)} años` : `~${(deltaFromPrev * 365).toFixed(1)} días`})
                        </span>
                      </div>
                    )}

                    {/* Event Card */}
                    <div className={`bg-[#0d0e14] border rounded-sm p-4 sm:p-5 transition-all shadow-sm ${
                      hasAnac
                        ? 'border-rose-800/90 hover:border-rose-500 bg-gradient-to-r from-rose-950/20 to-transparent'
                        : isChapter
                        ? 'border-cyan-800/70 hover:border-cyan-500/80 bg-gradient-to-r from-cyan-950/15 to-transparent'
                        : 'border-[#1e293b] hover:border-slate-500'
                    }`}>
                      {/* Top Meta Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1e293b]/70">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Badge */}
                          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${categoryBadgeColor}`}>
                            {evt.category.replace(/_/g, ' ')}
                          </span>

                          {/* Era Badge */}
                          {era && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              [{era.code}]
                            </span>
                          )}

                          {/* Flashback Tag */}
                          {evt.isFlashbackOrAnalepsis && (
                            <span className="px-1.5 py-0.2 bg-purple-950/60 text-purple-300 border border-purple-700/80 text-[9px] rounded-xs font-bold uppercase">
                              Analepsis / Flashback
                            </span>
                          )}
                        </div>

                        {/* Date Label & Numeric Year */}
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-xs font-bold text-cyan-300 tracking-wider">
                            {evt.dateLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 hidden sm:inline">
                            (t = {evt.year.toFixed(3)})
                          </span>
                        </div>
                      </div>

                      {/* Main Title & Description */}
                      <div className="pt-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                            {evt.title}
                            {hasAnac && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-rose-600 text-black font-bold rounded-xs animate-pulse">
                                ANACRONISMO DETECTADO
                              </span>
                            )}
                          </h3>

                          {/* Action Links */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isChapter && evt.chapterNumber && onOpenChapterInEditor && (
                              <button
                                type="button"
                                onClick={() => onOpenChapterInEditor(evt.chapterNumber!)}
                                className="px-2 py-1 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                                title="Abrir este capítulo en el editor de manuscrito"
                              >
                                <BookOpen className="w-3 h-3 text-cyan-400" />
                                <span>Editor</span>
                              </button>
                            )}

                            {onOpenGraph && (
                              <button
                                type="button"
                                onClick={onOpenGraph}
                                className="p-1 rounded-sm bg-[#12131b] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-[#1e293b] transition-colors cursor-pointer"
                                title="Ver en el Grafo de Relaciones"
                              >
                                <Network className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {evt.id.startsWith('EVT_CUSTOM_') && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomEvent(evt.id)}
                                className="p-1 rounded-sm bg-[#12131b] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-[#1e293b] hover:border-rose-700 transition-colors cursor-pointer"
                                title="Eliminar este hito personalizado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {evt.description}
                        </p>

                        {/* Location, Characters & Technology Tags */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] text-slate-400">
                          {/* Location */}
                          {starSystem && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-cyan-400" />
                              <span>{starSystem.name.split('(')[0]}</span>
                              {evt.locationDetails && (
                                <span className="text-slate-500">({evt.locationDetails})</span>
                              )}
                            </div>
                          )}

                          {/* Characters */}
                          {evt.characterIds && evt.characterIds.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-amber-400" />
                              <div className="flex flex-wrap items-center gap-1">
                                {evt.characterIds.map(cId => (
                                  <span key={cId} className="px-1.5 py-0.2 rounded-xs bg-[#161822] border border-[#1e293b] text-slate-200">
                                    {charMap.get(cId)?.name || cId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tech / Abilities */}
                          {evt.techOrArtifactIds && evt.techOrArtifactIds.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Cpu className="w-3 h-3 text-emerald-400" />
                              <div className="flex flex-wrap items-center gap-1">
                                {evt.techOrArtifactIds.map(tId => (
                                  <span key={tId} className="px-1.5 py-0.2 rounded-xs bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-[10px]">
                                    {tId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Anachronism Callout Box if this event is involved */}
                        {hasAnac && (
                          <div className="mt-3 p-3 bg-rose-950/30 border border-rose-700/80 rounded-sm space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                              <span className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                ALERTA DE COHERENCIA EN ESTE HITO
                              </span>
                              <button
                                type="button"
                                onClick={() => setViewMode('AUDIT_MATRIX')}
                                className="text-[10px] text-rose-400 hover:text-rose-200 underline cursor-pointer"
                              >
                                Ver en Radar de Causalidad →
                              </button>
                            </div>

                            {anachronisms
                              .filter(a => a.detectedInEventIds.includes(evt.id))
                              .map(anac => (
                                <div key={anac.id} className="text-[11px] text-slate-300 pl-2 border-l-2 border-rose-500 space-y-1">
                                  <div className="font-bold text-white">{anac.title}</div>
                                  <div>{anac.description}</div>
                                  <div className="text-emerald-400 font-bold">
                                    💡 Solución: <span className="font-normal text-slate-300">{anac.recommendation}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Custom Timeline Event */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-mono">
          <div className="bg-[#0e0f16] border border-[#1e293b] rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Registrar Nuevo Hito en la Cronología de Planck
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              {/* Event Title */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Título del Hito / Suceso:
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="ej. El Primer Ataque de Inversión Térmica en Nautilus"
                  className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Year & Date Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Año / Ciclo Diegético (Numérico):
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newEventYear}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setNewEventYear(val);
                      setNewEventDateLabel(`Ciclo ${val.toFixed(3)} // Planck Tick 0x${Math.round(val % 256).toString(16).toUpperCase()}`);
                    }}
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Ej. 3042.188 para el presente, 892.4 para el cisma.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Etiqueta de Fecha Visible:
                  </label>
                  <input
                    type="text"
                    value={newEventDateLabel}
                    onChange={(e) => setNewEventDateLabel(e.target.value)}
                    placeholder="Ciclo 3042.200 // Planck Tick 0x9B"
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-cyan-300 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Era & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Época / Era Cosmológica:
                  </label>
                  <select
                    value={newEventEraId}
                    onChange={(e) => setNewEventEraId(e.target.value)}
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    {CANONICAL_ERAS.map(era => (
                      <option key={era.id} value={era.id}>{era.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Categoría del Hito:
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="HISTORIA_CANONICA">Historia Canónica</option>
                    <option value="DESARROLLO_TECNOLOGICO">Desarrollo Tecnológico</option>
                    <option value="CATÁSTROFE_KERNEL">Catástrofe de Kernel</option>
                    <option value="CONFLICTO_POLITICO">Conflicto Político</option>
                    <option value="CAPITULO_MANUSCRITO">Capítulo del Manuscrito</option>
                  </select>
                </div>
              </div>

              {/* Star System & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Sistema Estelar:
                  </label>
                  <select
                    value={newEventSystemId}
                    onChange={(e) => setNewEventSystemId(e.target.value)}
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    {starSystems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Detalles de Ubicación:
                  </label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="ej. Órbita del relé de Planck 404"
                    className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Descripción del Acontecimiento & Causalidad:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Detalla qué ocurrió, qué leyes del sustrato se modificaron o qué consecuencias tuvo en la trama..."
                  className="w-full bg-[#08080c] border border-[#1e293b] rounded-sm p-2.5 text-white focus:border-cyan-500 outline-none leading-relaxed"
                />
              </div>

              {/* Participants selection */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Personajes Involucrados:
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#08080c] border border-[#1e293b] rounded-sm max-h-24 overflow-y-auto">
                  {characters.map(c => {
                    const isSelected = newEventCharacterIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewEventCharacterIds(prev => prev.filter(id => id !== c.id));
                          } else {
                            setNewEventCharacterIds(prev => [...prev, c.id]);
                          }
                        }}
                        className={`px-2 py-1 rounded-xs text-[10px] border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                            : 'bg-[#12131c] border-[#1e293b] text-slate-400 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flashback Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_flashback"
                  checked={newEventIsFlashback}
                  onChange={(e) => setNewEventIsFlashback(e.target.checked)}
                  className="rounded-xs bg-[#08080c] border-[#1e293b] text-cyan-500 focus:ring-0"
                />
                <label htmlFor="chk_flashback" className="text-xs text-slate-300 cursor-pointer select-none">
                  Marcar como Analepsis / Flashback (no penalizará inversiones de secuencia temporal)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-[#12131c] hover:bg-slate-800 text-slate-300 border border-[#1e293b] text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
