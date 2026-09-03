import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, BookOpen, Users, Globe, Terminal, ShieldCheck, 
  Download, Palette, HardDrive, Cpu, ArrowRight, CornerDownLeft, Sparkles, X
} from 'lucide-react';
import { Chapter, NovelCharacter, StarSystem } from '../types';
import { CANONICAL_STAR_SYSTEMS, CANONICAL_SYSCALLS, CANONICAL_EXPLOITS } from '../data/canonicalLore';

export interface CommandItem {
  id: string;
  category: 'CAPITULOS' | 'PERSONAJES' | 'SISTEMAS' | 'ACCIONES' | 'SUSTRATO';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  badge?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  characters: NovelCharacter[];
  onSelectChapter: (chapterNumber: number) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenExport: () => void;
  onOpenGenreThemes: () => void;
  onOpenStorageSync: () => void;
  onOpenAuditor: () => void;
  onCreateNewChapter: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  chapters,
  characters,
  onSelectChapter,
  onNavigateTab,
  onOpenExport,
  onOpenGenreThemes,
  onOpenStorageSync,
  onOpenAuditor,
  onCreateNewChapter
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable index of items
  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 1. Quick Actions
    items.push({
      id: 'act_new_chap',
      category: 'ACCIONES',
      title: 'Crear nuevo capítulo',
      subtitle: 'Añade una nueva escena al final de tu manuscrito',
      icon: BookOpen,
      badge: 'Escritura',
      onSelect: () => {
        onCreateNewChapter();
        onNavigateTab('chapters');
      }
    });

    items.push({
      id: 'act_auditor',
      category: 'ACCIONES',
      title: 'Auditar manuscrito con Gemini',
      subtitle: 'Comprobar coherencia física, ontológica y de personajes',
      icon: Sparkles,
      badge: 'IA Gemini',
      onSelect: () => onOpenAuditor()
    });

    items.push({
      id: 'act_export',
      category: 'ACCIONES',
      title: 'Exportar novela (.docx / Google Docs / MD)',
      subtitle: 'Descarga el manuscrito formal o la biblia de worldbuilding',
      icon: Download,
      badge: 'Exportar',
      onSelect: () => onOpenExport()
    });

    items.push({
      id: 'act_themes',
      category: 'ACCIONES',
      title: 'Cambiar género literario & tema visual',
      subtitle: 'Sci-Fi, Fantasía, Noir, Histórica, Romance o Minimalista',
      icon: Palette,
      badge: 'Diseño',
      onSelect: () => onOpenGenreThemes()
    });

    items.push({
      id: 'act_storage',
      category: 'ACCIONES',
      title: 'Configurar sincronización & copias de seguridad',
      subtitle: 'Carpeta local del disco duro o Google Drive',
      icon: HardDrive,
      badge: 'Persistencia',
      onSelect: () => onOpenStorageSync()
    });

    // 2. Chapters
    chapters.forEach(c => {
      items.push({
        id: `chap_${c.id}`,
        category: 'CAPITULOS',
        title: `Capítulo ${c.number}: ${c.title.replace(/^Capítulo\s*\d+:\s*/i, '')}`,
        subtitle: `${c.wordCount} palabras • ${c.status} • Ubicación: ${c.locationDetails || 'Espacio'}`,
        icon: BookOpen,
        badge: `Cap #${c.number}`,
        onSelect: () => {
          onSelectChapter(c.number);
          onNavigateTab('chapters');
        }
      });
    });

    // 3. Characters
    characters.forEach(char => {
      items.push({
        id: `char_${char.id}`,
        category: 'PERSONAJES',
        title: char.name,
        subtitle: `${char.role} • ${char.summary.slice(0, 60)}...`,
        icon: Users,
        badge: 'Ficha',
        onSelect: () => onNavigateTab('characters')
      });
    });

    // 4. Star Systems
    CANONICAL_STAR_SYSTEMS.forEach(sys => {
      items.push({
        id: `sys_${sys.id}`,
        category: 'SISTEMAS',
        title: sys.name,
        subtitle: `Ancho de banda: ${sys.planckBandwidth} • DRM: ${sys.drmPolicy}`,
        icon: Globe,
        badge: 'Atlas',
        onSelect: () => onNavigateTab('atlas')
      });
    });

    // 5. Syscalls & Exploits
    CANONICAL_SYSCALLS.forEach(sys => {
      items.push({
        id: `syscall_${sys.id}`,
        category: 'SUSTRATO',
        title: sys.name,
        subtitle: `${sys.signature} • ${sys.computeCostMFlops} MFlops`,
        icon: Cpu,
        badge: 'Syscall',
        onSelect: () => onNavigateTab('architecture')
      });
    });

    CANONICAL_EXPLOITS.forEach(exp => {
      items.push({
        id: `exploit_${exp.id}`,
        category: 'SUSTRATO',
        title: exp.name,
        subtitle: `${exp.tacticalApplication.slice(0, 60)}...`,
        icon: Terminal,
        badge: 'Exploit',
        onSelect: () => onNavigateTab('sandbox')
      });
    });

    return items;
  }, [chapters, characters]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 15);
    }
    const q = query.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [allItems, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        current.onSelect();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 text-slate-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0e1118] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#090b10] flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar capítulos, personajes, atlas, constantes o acciones..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
            ESC para cerrar
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No se encontraron resultados para "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-900/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 text-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-sans">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#080a0f] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ para navegar</span>
            <span>↵ para seleccionar</span>
          </div>
          <span>Paleta Global Neo_Scribe</span>
        </div>
      </div>
    </div>
  );
};
