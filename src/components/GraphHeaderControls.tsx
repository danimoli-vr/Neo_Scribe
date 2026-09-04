import React from 'react';
import { AlertCircle, AlertTriangle, Network, RefreshCw, Search, X, Zap } from 'lucide-react';
import { Chapter, GraphNodeType } from '../types';

interface GraphHeaderControlsProps {
  filteredNodesCount: number;
  filteredLinksCount: number;
  inconsistenciesCount: number;
  criticalCount: number;
  onReloadData: () => void;
  activeTypes: Record<GraphNodeType, boolean>;
  onToggleType: (type: GraphNodeType) => void;
  nodeCountsByType: Record<GraphNodeType, number>;
  chapters: Chapter[];
  selectedTimelineChapter: number | null;
  onSelectTimelineChapter: (chapterNumber: number | null) => void;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  showOnlyInconsistencies: boolean;
  onToggleShowOnlyInconsistencies: () => void;
}

/** Top header, quick metrics and filter controls for StoryRelationsGraphView. */
export const GraphHeaderControls: React.FC<GraphHeaderControlsProps> = ({
  filteredNodesCount,
  filteredLinksCount,
  inconsistenciesCount,
  criticalCount,
  onReloadData,
  activeTypes,
  onToggleType,
  nodeCountsByType,
  chapters,
  selectedTimelineChapter,
  onSelectTimelineChapter,
  searchQuery,
  onSearchQueryChange,
  showOnlyInconsistencies,
  onToggleShowOnlyInconsistencies,
}) => {
  return (
    <div className="bg-[#0f1218] border border-[#1e293b] rounded-sm p-4 space-y-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-500 rotate-45 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              MAPA DE GRAFOS DE RELACIONES & COHERENCIA NARRATIVA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topología viva de personajes, planetas y tecnologías extraídos de los manuscritos. Detecta saltos estelares instantáneos, sobrecargas térmicas y violaciones del sustrato.
          </p>
        </div>

        {/* Quick Metrics Cards */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="bg-[#0a0a0d] border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Nodos:</span>
            <span className="text-white font-bold">{filteredNodesCount}</span>
          </div>

          <div className="bg-[#0a0a0d] border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Enlaces:</span>
            <span className="text-white font-bold">{filteredLinksCount}</span>
          </div>

          <div className={`border px-3 py-1.5 rounded-sm flex items-center gap-2 ${
            criticalCount > 0
              ? 'bg-rose-950/40 border-rose-600 text-rose-300'
              : inconsistenciesCount > 0
                ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Inconsistencias:</span>
            <span className="font-bold">{inconsistenciesCount}</span>
            {criticalCount > 0 && (
              <span className="text-[10px] bg-rose-600 text-black px-1.5 py-0.2 rounded-xs font-bold">
                {criticalCount} CRÍTICAS
              </span>
            )}
          </div>

          <button
            onClick={onReloadData}
            className="bg-[#111115] hover:bg-[#1a1a24] text-slate-300 border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
            title="Recargar datos del manuscrito"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#1e293b] text-xs font-mono">
        {/* Node Category Filters */}
        <div className="lg:col-span-4 flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-1">Filtrar:</span>

          <button
            type="button"
            onClick={() => onToggleType('PERSONAJE')}
            className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
              activeTypes.PERSONAJE
                ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                : 'bg-[#111115] border-[#1e293b] text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Personajes</span>
            <span className="text-[10px] opacity-70">({nodeCountsByType.PERSONAJE})</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleType('PLANETA')}
            className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
              activeTypes.PLANETA
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                : 'bg-[#111115] border-[#1e293b] text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Planetas</span>
            <span className="text-[10px] opacity-70">({nodeCountsByType.PLANETA})</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleType('TECNOLOGIA')}
            className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
              activeTypes.TECNOLOGIA
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                : 'bg-[#111115] border-[#1e293b] text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Tecnologías</span>
            <span className="text-[10px] opacity-70">({nodeCountsByType.TECNOLOGIA})</span>
          </button>
        </div>

        {/* Timeline Chapter Filter */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] shrink-0">Línea Temporal:</span>
          <select
            value={selectedTimelineChapter === null ? 'ALL' : selectedTimelineChapter}
            onChange={(e) => {
              const val = e.target.value;
              onSelectTimelineChapter(val === 'ALL' ? null : Number(val));
            }}
            className="bg-[#0a0a0d] border border-[#1e293b] text-slate-200 px-2 py-1 rounded-sm text-xs focus:border-cyan-500 outline-none w-full"
          >
            <option value="ALL">Toda la novela (Capítulos 1-{chapters.length})</option>
            {chapters.map(chap => (
              <option key={chap.id} value={chap.number}>
                Hasta Capítulo {chap.number}: {chap.title}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box & Inconsistency toggle */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Buscar entidad en grafo..."
              className="w-full bg-[#0a0a0d] border border-[#1e293b] pl-8 pr-2.5 py-1 rounded-sm text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleShowOnlyInconsistencies}
            className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border shrink-0 transition-colors ${
              showOnlyInconsistencies
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-[#111115] border-[#1e293b] text-slate-400 hover:text-slate-200'
            }`}
            title="Mostrar únicamente entidades con inconsistencias detectadas"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Solo Inconsistencias</span>
          </button>
        </div>
      </div>
    </div>
  );
};
