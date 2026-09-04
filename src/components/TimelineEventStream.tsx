import React from 'react';
import { AlertTriangle, BookOpen, Compass, Cpu, Globe, Network, Trash2, User } from 'lucide-react';
import { TimelineEvent, TimelineEra, NarrativeAnachronism, NovelCharacter, StarSystem } from '../types';

interface TimelineEventStreamProps {
  filteredEvents: TimelineEvent[];
  eraMap: Map<string, TimelineEra>;
  sysMap: Map<string, StarSystem>;
  charMap: Map<string, NovelCharacter>;
  anachronisms: NarrativeAnachronism[];
  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onOpenGraph?: () => void;
  onDeleteCustomEvent: (id: string) => void;
  onViewAuditMatrix: () => void;
  onResetFilters: () => void;
}

/**
 * The default "flow" view of TimelineView: a vertical, chronologically
 * ordered stream of every event/chapter, with inline anachronism callouts.
 * Purely presentational — filtering and mutation happen in the parent.
 */
export const TimelineEventStream: React.FC<TimelineEventStreamProps> = ({
  filteredEvents,
  eraMap,
  sysMap,
  charMap,
  anachronisms,
  onOpenChapterInEditor,
  onOpenGraph,
  onDeleteCustomEvent,
  onViewAuditMatrix,
  onResetFilters,
}) => {
  if (filteredEvents.length === 0) {
    return (
      <div className="space-y-4 font-mono">
        <div className="p-12 text-center bg-[#0f1017] border border-[#1e293b] rounded-sm space-y-3">
          <Compass className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No se encontraron hitos en este filtro</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba restablecer los filtros de búsqueda o seleccionar &quot;Todas las Épocas&quot;.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-sm bg-[#12141d] hover:bg-slate-800 text-cyan-300 border border-cyan-800 text-xs uppercase tracking-wider cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
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
                          onClick={() => onDeleteCustomEvent(evt.id)}
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
                          onClick={onViewAuditMatrix}
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
    </div>
  );
};
