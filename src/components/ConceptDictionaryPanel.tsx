import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, Plus, Check, Copy, Sparkles, Filter, Info, 
  Terminal, ShieldCheck, Zap, User, Globe, AlertTriangle, ExternalLink,
  ChevronDown, ChevronUp, Code2
} from 'lucide-react';
import { ConceptTerm, ConceptCategory, filterConcepts, countOccurrencesInText } from '../data/conceptDictionary';

interface ConceptDictionaryPanelProps {
  concepts: ConceptTerm[];
  chapterText: string;
  onInsertTerm: (termText: string) => void;
}

export const ConceptDictionaryPanel: React.FC<ConceptDictionaryPanelProps> = ({
  concepts,
  chapterText,
  onInsertTerm
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [filterOnlyInScene, setFilterOnlyInScene] = useState<boolean>(false);
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute occurrences for all concepts in the active chapter
  const occurrencesMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const concept of concepts) {
      map.set(concept.id, countOccurrencesInText(chapterText, concept));
    }
    return map;
  }, [concepts, chapterText]);

  // Filter concepts based on search, category and in-scene filter
  const filteredConcepts = useMemo(() => {
    let result = filterConcepts(concepts, searchQuery, categoryFilter);
    if (filterOnlyInScene) {
      result = result.filter((c) => (occurrencesMap.get(c.id) || 0) > 0);
    }
    return result;
  }, [concepts, searchQuery, categoryFilter, filterOnlyInScene, occurrencesMap]);

  // Stats
  const termsInSceneCount = useMemo(() => {
    let count = 0;
    occurrencesMap.forEach((cnt) => {
      if (cnt > 0) count++;
    });
    return count;
  }, [occurrencesMap]);

  const handleCopy = (term: ConceptTerm, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(term.name);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getCategoryColor = (category: ConceptCategory) => {
    switch (category) {
      case 'PERSONAJE':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'TECNOLOGIA':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
      case 'PLANETA':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'FACCION':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/80';
      case 'AXIOMA':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'ARTEFACTO':
        return 'text-blue-400 bg-blue-950/60 border-blue-800/80';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getCategoryIcon = (category: ConceptCategory) => {
    switch (category) {
      case 'PERSONAJE': return <User className="w-3 h-3" />;
      case 'TECNOLOGIA': return <Zap className="w-3 h-3" />;
      case 'PLANETA': return <Globe className="w-3 h-3" />;
      case 'FACCION': return <ShieldCheck className="w-3 h-3" />;
      case 'AXIOMA': return <Terminal className="w-3 h-3" />;
      case 'ARTEFACTO': return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      
      {/* Header Summary & Presence in Chapter */}
      <div className="p-3 bg-[#0a0a0c] border border-[#1e293b] rounded-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <BookOpen className="w-3 h-3 text-cyan-400" />
            Términos en Este Capítulo
          </span>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-sm border border-cyan-800">
            {termsInSceneCount} de {concepts.length} activos
          </span>
        </div>

        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          Haz clic en <strong className="text-cyan-300">[Insertar]</strong> para pegar el término canónico directamente en el texto donde tengas el cursor.
        </p>

        {/* Quick toggle: show only terms present in current scene */}
        <div className="flex items-center justify-between pt-1 text-[9px] border-t border-[#1e293b]">
          <span className="text-slate-500">Filtrar por presencia:</span>
          <button
            onClick={() => setFilterOnlyInScene(!filterOnlyInScene)}
            className={`px-2 py-0.5 rounded-sm uppercase tracking-wider transition-colors cursor-pointer border ${
              filterOnlyInScene
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-[#111114] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            {filterOnlyInScene ? '✓ Solo en Escena' : 'Mostrar Todos'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        <input
          type="text"
          placeholder="Buscar concepto, alias, física, implante..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1 pb-1">
        {[
          { id: 'TODOS', label: 'Todos' },
          { id: 'PERSONAJE', label: 'Personajes' },
          { id: 'TECNOLOGIA', label: 'Tecnología' },
          { id: 'PLANETA', label: 'Planetas' },
          { id: 'FACCION', label: 'Facciones' },
          { id: 'AXIOMA', label: 'Axiomas' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider transition-colors cursor-pointer border ${
              categoryFilter === cat.id
                ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                : 'bg-[#111114] border-[#1e293b] text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Concept Items List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredConcepts.length === 0 ? (
          <div className="p-4 text-center text-slate-500 bg-[#0a0a0c] border border-dashed border-[#1e293b] rounded-sm">
            <span className="text-xs block">No se encontraron términos coincidentes.</span>
            <span className="text-[10px] text-slate-600 block mt-1">Prueba con otra búsqueda o categoría.</span>
          </div>
        ) : (
          filteredConcepts.map((concept) => {
            const isExpanded = expandedConceptId === concept.id;
            const countInScene = occurrencesMap.get(concept.id) || 0;
            const inScene = countInScene > 0;

            return (
              <div
                key={concept.id}
                className={`border rounded-sm transition-all ${
                  inScene
                    ? 'bg-[#11141a] border-cyan-900/60'
                    : 'bg-[#111114] border-[#1e293b] hover:border-slate-700'
                }`}
              >
                {/* Collapsed Header */}
                <div 
                  onClick={() => setExpandedConceptId(isExpanded ? null : concept.id)}
                  className="p-2.5 flex items-start justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-sm border uppercase flex items-center gap-1 ${getCategoryColor(concept.category)}`}>
                        {getCategoryIcon(concept.category)}
                        {concept.badge}
                      </span>
                      
                      {inScene && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded-sm bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider font-bold">
                          ✓ En texto ({countInScene}x)
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white uppercase tracking-wide truncate">
                      {concept.name}
                    </h4>

                    <p className="text-[10px] text-slate-400 font-sans line-clamp-1">
                      {concept.shortDescription}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertTerm(concept.name);
                      }}
                      title="Insertar nombre en el editor"
                      className="px-2 py-1 rounded-sm bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Insertar
                    </button>

                    <button
                      onClick={(e) => handleCopy(concept, e)}
                      title="Copiar término"
                      className="p-1 rounded-sm bg-[#18181f] border border-[#1e293b] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === concept.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 pt-0 border-t border-[#1e293b]/70 space-y-2.5 text-[11px] font-sans bg-[#0c0c0f]">
                    {/* Full Description */}
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">
                        Definición Canónica:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {concept.shortDescription}
                      </p>
                    </div>

                    {/* Hard Sci-Fi Rule / Coherence Warning */}
                    {concept.hardRule && (
                      <div className="p-2 bg-amber-950/30 border border-amber-900/60 rounded-sm text-amber-200 text-[10px] font-mono leading-snug">
                        <strong className="text-amber-400 uppercase flex items-center gap-1 mb-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Regla de Continuidad & Física:
                        </strong>
                        {concept.hardRule}
                      </div>
                    )}

                    {/* Code Snippet if applicable */}
                    {concept.codeSnippet && (
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                          <Code2 className="w-3 h-3 text-cyan-400" />
                          Sintaxis / Firma:
                        </span>
                        <div className="flex items-center justify-between p-2 bg-[#060608] border border-[#1e293b] rounded-sm font-mono text-[10px] text-cyan-300">
                          <code className="truncate">{concept.codeSnippet}</code>
                          <button
                            onClick={() => onInsertTerm(concept.codeSnippet!)}
                            className="ml-2 text-[9px] text-cyan-400 hover:text-cyan-200 uppercase tracking-wider underline cursor-pointer shrink-0"
                          >
                            Pegar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Aliases & Tags */}
                    {concept.aliases.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap text-[9px] font-mono text-slate-500">
                        <span>Reconoce:</span>
                        {concept.aliases.map((al, idx) => (
                          <span key={idx} className="bg-[#15151c] px-1 py-0.2 rounded-sm text-slate-400">
                            {al}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
