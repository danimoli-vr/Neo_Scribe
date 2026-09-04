import React from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { NovelCharacter, StarSystem } from '../types';

interface TimelineFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (v: string) => void;
  selectedCharacterId: string;
  onSelectedCharacterIdChange: (v: string) => void;
  characters: NovelCharacter[];
  selectedSystemId: string;
  onSelectedSystemIdChange: (v: string) => void;
  starSystems: StarSystem[];
  onlyAnachronisms: boolean;
  onOnlyAnachronismsChange: (v: boolean) => void;
  anachronismsCount: number;
}

/** Search + category/character/system filters for TimelineView. */
export const TimelineFilterBar: React.FC<TimelineFilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectedCategoryChange,
  selectedCharacterId,
  onSelectedCharacterIdChange,
  characters,
  selectedSystemId,
  onSelectedSystemIdChange,
  starSystems,
  onlyAnachronisms,
  onOnlyAnachronismsChange,
  anachronismsCount,
}) => {
  return (
    <div className="bg-[#0e0f14] border border-[#1e293b] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Buscar por título, personaje, sistema o descripción..."
            className="w-full bg-[#0a0a0d] border border-[#1e293b] rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onSelectedCategoryChange(e.target.value)}
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
          onChange={(e) => onSelectedCharacterIdChange(e.target.value)}
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
          onChange={(e) => onSelectedSystemIdChange(e.target.value)}
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
        onClick={() => onOnlyAnachronismsChange(!onlyAnachronisms)}
        className={`px-3 py-1.5 rounded-sm border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
          onlyAnachronisms
            ? 'bg-rose-950/70 text-rose-300 border-rose-500 font-bold shadow-sm'
            : 'bg-[#0a0a0d] text-slate-400 hover:text-white border-[#1e293b]'
        }`}
      >
        <AlertTriangle className={`w-3.5 h-3.5 ${onlyAnachronisms ? 'text-rose-400' : 'text-slate-500'}`} />
        <span>Solo Anacronismos ({anachronismsCount})</span>
      </button>
    </div>
  );
};
