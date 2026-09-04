import React, { useState, useMemo, useEffect } from 'react';
import { Check, Clock, Download, Plus, ShieldAlert } from 'lucide-react';
import {
  TimelineEvent,
  NarrativeAnachronism,
  Chapter,
  NovelCharacter,
  StarSystem,
  Syscall,
  ExploitScript
} from '../types';
import { CANONICAL_ERAS } from '../data/canonicalTimeline';
import {
  buildUnifiedTimeline,
  auditTimelineAnachronisms,
  TimelineAuditResult
} from '../utils/anachronismDetector';
import { useNovelData } from '../store/NovelDataContext';
import { EraNavigationStrip } from './EraNavigationStrip';
import { TimelineFilterBar } from './TimelineFilterBar';
import { AnachronismAuditMatrix } from './AnachronismAuditMatrix';
import { TimelineEventStream } from './TimelineEventStream';
import { CreateTimelineEventModal } from './CreateTimelineEventModal';

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

/**
 * The timeline/anachronism-audit screen. Split into:
 * - EraNavigationStrip / TimelineFilterBar: filter controls
 * - AnachronismAuditMatrix: the "radar" list of detected anachronisms
 * - TimelineEventStream: the default chronological event feed
 * - CreateTimelineEventModal: the "add milestone" form
 *
 * State, filtering and mutation logic all stay here.
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  chapters,
  characters,
  starSystems,
  syscalls: _syscalls,
  exploits: _exploits,
  onOpenChapterInEditor,
  onOpenGraph,
  onSendToAuditor,
  onUpdateChapter
}) => {
  // Custom user-defined timeline events. Local state seeded from the shared
  // context (single source of truth) and pushed back into it below whenever
  // it changes — keeps drag-to-reposition responsive without waiting on the
  // shared context's own debounced refresh.
  const { customTimelineEvents: sharedCustomEvents, setCustomTimelineEvents: setSharedCustomEvents } = useNovelData();
  const [customEvents, setCustomEvents] = useState<TimelineEvent[]>(sharedCustomEvents);

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

  // Save custom events using the shared, debounced autosave path (3s idle timer)
  useEffect(() => {
    if (isInitialEventsMount.current) {
      isInitialEventsMount.current = false;
      return;
    }
    setSharedCustomEvents(customEvents);
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

    // If target is a chapter, update chapter in parent (which persists it via the shared context)
    if (targetEvt.chapterNumber !== undefined) {
      const chap = chapters.find(c => c.number === targetEvt.chapterNumber);
      if (chap) {
        const updated = {
          ...chap,
          diegeticCycle: newYear,
          diegeticDateLabel: newDateLabel
        };
        if (onUpdateChapter) onUpdateChapter(updated);
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

  const handleResetFilters = () => {
    setSelectedEraId('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
    setOnlyAnachronisms(false);
    setSelectedCharacterId('ALL');
    setSelectedSystemId('ALL');
  };

  const handleToggleNewEventCharacter = (charId: string) => {
    setNewEventCharacterIds(prev =>
      prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
    );
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

      <EraNavigationStrip events={events} selectedEraId={selectedEraId} onSelectEra={setSelectedEraId} />

      <TimelineFilterBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectedCategoryChange={setSelectedCategory}
        selectedCharacterId={selectedCharacterId}
        onSelectedCharacterIdChange={setSelectedCharacterId}
        characters={characters}
        selectedSystemId={selectedSystemId}
        onSelectedSystemIdChange={setSelectedSystemId}
        starSystems={starSystems}
        onlyAnachronisms={onlyAnachronisms}
        onOnlyAnachronismsChange={setOnlyAnachronisms}
        anachronismsCount={anachronisms.length}
      />

      {viewMode === 'AUDIT_MATRIX' ? (
        <AnachronismAuditMatrix
          anachronisms={anachronisms}
          onSendToAuditor={onSendToAuditor}
          onReconcileFtl={handleReconcileFtl}
          onMarkAsFlashback={handleMarkAsFlashback}
          onOpenChapterInEditor={onOpenChapterInEditor}
        />
      ) : (
        <TimelineEventStream
          filteredEvents={filteredEvents}
          eraMap={eraMap}
          sysMap={sysMap}
          charMap={charMap}
          anachronisms={anachronisms}
          onOpenChapterInEditor={onOpenChapterInEditor}
          onOpenGraph={onOpenGraph}
          onDeleteCustomEvent={handleDeleteCustomEvent}
          onViewAuditMatrix={() => setViewMode('AUDIT_MATRIX')}
          onResetFilters={handleResetFilters}
        />
      )}

      <CreateTimelineEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        characters={characters}
        starSystems={starSystems}
        title={newEventTitle}
        onTitleChange={setNewEventTitle}
        year={newEventYear}
        onYearChange={setNewEventYear}
        dateLabel={newEventDateLabel}
        onDateLabelChange={setNewEventDateLabel}
        eraId={newEventEraId}
        onEraIdChange={setNewEventEraId}
        category={newEventCategory}
        onCategoryChange={setNewEventCategory}
        systemId={newEventSystemId}
        onSystemIdChange={setNewEventSystemId}
        location={newEventLocation}
        onLocationChange={setNewEventLocation}
        description={newEventDescription}
        onDescriptionChange={setNewEventDescription}
        characterIds={newEventCharacterIds}
        onToggleCharacterId={handleToggleNewEventCharacter}
        isFlashback={newEventIsFlashback}
        onIsFlashbackChange={setNewEventIsFlashback}
      />
    </div>
  );
};
