import React from 'react';
import { BookOpen, Globe, Trash2 } from 'lucide-react';
import { Chapter, NovelCharacter } from '../types';
import { CANONICAL_STAR_SYSTEMS } from '../data/canonicalLore';

interface ChapterListSidebarProps {
  chapters: Chapter[];
  filteredChapters: Chapter[];
  characters: NovelCharacter[];
  currentChapterId: string;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSelectChapter: (id: string) => void;
  onDeleteChapter: (id: string, e: React.MouseEvent) => void;
}

/**
 * Left column of ChapterEditorView: the filterable/searchable list of chapters.
 * Extracted as its own component — it only needs the filtered list and a
 * handful of callbacks, no access to the editor's internal state.
 */
export const ChapterListSidebar: React.FC<ChapterListSidebarProps> = ({
  chapters,
  filteredChapters,
  characters,
  currentChapterId,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onSelectChapter,
  onDeleteChapter,
}) => {
  return (
    <div className="lg:col-span-3 space-y-3">
      <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-3.5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-cyan-400" />
            Índice de Capítulos
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {filteredChapters.length} de {chapters.length}
          </span>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['TODOS', 'BORRADOR', 'EN_REVISION', 'CANON'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`text-[9px] font-mono px-2 py-1 rounded-sm uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              {st === 'EN_REVISION' ? 'REVISIÓN' : st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Buscar por título, texto o lugar..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
        />

        {/* Chapter Cards List */}
        <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {filteredChapters.map((chap) => {
            const isSelected = chap.id === currentChapterId;
            const chapSystem = CANONICAL_STAR_SYSTEMS.find((s) => s.id === chap.systemId);
            const chapChars = characters.filter((c) => chap.characterIds.includes(c.id));

            return (
              <div
                key={chap.id}
                onClick={() => onSelectChapter(chap.id)}
                className={`p-3 rounded-sm border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 border-l-4 border-l-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-[#111114] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    CAP. {chap.number}
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      chap.status === 'CANON'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : chap.status === 'EN_REVISION'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {chap.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide truncate mb-1">
                  {chap.title}
                </h4>

                <div className="text-[10px] text-slate-400 font-mono truncate mb-1.5 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="truncate">{chapSystem?.name.split('(')[0] || 'Espacio Profundo'}</span>
                </div>

                {/* Characters tags */}
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  {chapChars.slice(0, 2).map((char) => (
                    <span
                      key={char.id}
                      className="text-[8px] font-mono px-1 py-0.2 bg-[#0a0a0c] text-slate-300 border border-[#1e293b] rounded-sm"
                    >
                      {char.name}
                    </span>
                  ))}
                  {chapChars.length > 2 && (
                    <span className="text-[8px] font-mono text-slate-500">
                      +{chapChars.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-[#1e293b]/60">
                  <span>{chap.wordCount} palabras</span>
                  <button
                    onClick={(e) => onDeleteChapter(chap.id, e)}
                    title="Eliminar capítulo"
                    className="hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
