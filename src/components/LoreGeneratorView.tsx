import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_LORE_ITEMS } from '../data/canonicalLore';
import { LoreItem } from '../types';
import { Sparkles, HardDrive, Zap, AlertTriangle, Bookmark, Trash2, Plus, RefreshCw, Filter } from 'lucide-react';
import { autosaveService } from '../services/autosaveService';

export const LoreGeneratorView: React.FC = () => {
  const [items, setItems] = useState<LoreItem[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_lore_items_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading lore items:', e);
    }
    return INITIAL_LORE_ITEMS;
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    autosaveService.scheduleSave('krnl_lore_items_v1', items);
  }, [items]);

  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'artefacto' | 'exploit' | 'anomalia' | 'sistema_estelar'>('artefacto');
  const [showGenModal, setShowGenModal] = useState<boolean>(false);

  const filteredItems = categoryFilter === 'TODOS'
    ? items
    : items.filter(it => it.category === categoryFilter);

  const handleGenerateLoreItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-lore-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          parameters: promptInput || 'Un artefacto precursor peligroso en disputa entre los Arqueólogos FOSS y el Sacerdocio del Root'
        })
      });

      const data = await response.json();
      if (data.item && data.item.name) {
        const newItem: LoreItem = {
          ...data.item,
          id: `ITEM_${Date.now()}`,
          category: data.item.category || selectedCategory,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setItems([newItem, ...items]);
        setShowGenModal(false);
        setPromptInput('');
      }
    } catch (err: any) {
      console.error('Error al generar reliquia:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/30 border border-cyan-800/80 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
              <HardDrive className="w-3.5 h-3.5" />
              REGISTRO_DE_ARTEFACTOS // REPOSITORIO_PRECURSOR
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
              Cripta de Reliquias y Fichas de Tecnologías
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Catálogo de los artefactos que tus arqueólogos desentierran en las ruinas invisibles de Planck. 
              Cada elemento incluye su arquitectura en el Kernel, límites de hardware, mecánicas de exploit y el gancho narrativo para tus capítulos.
            </p>
          </div>

          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generar con IA (Gemini)
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e293b] pb-3">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-2">CATEGORÍA:</span>
        {['TODOS', 'artefacto', 'exploit', 'anomalia'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-sm font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              categoryFilter === cat
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#0d0d0f] text-slate-400 hover:bg-[#15151a] hover:text-white border border-[#1e293b]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0d0d0f] border border-[#1e293b] hover:border-slate-700 rounded-sm p-4 sm:p-5 space-y-3.5 relative group transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-sm tracking-wider ${
                    item.category === 'artefacto' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    item.category === 'exploit' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{item.createdAt}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wide">{item.name}</h3>
                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{item.precursorArchitecture}</p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity cursor-pointer"
                title="Eliminar elemento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Especificaciones Técnicas:</span>
                <span className="text-slate-300 font-sans leading-relaxed">{item.technicalSpecs}</span>
              </div>

              <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Mecánica de Exploit / Manipulación:</span>
                <span className="text-slate-300 font-sans leading-relaxed">{item.exploitMechanic}</span>
              </div>

              <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Descubrimiento & Arqueología:</span>
                <span className="text-slate-300 font-sans leading-relaxed">{item.loreAndDiscovery}</span>
              </div>

              <div className="bg-red-950/20 p-2.5 rounded-sm border border-red-900/30 text-red-200">
                <span className="text-red-400 font-mono text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Modo de Fallo / Panic / Leak:</span>
                <span className="font-sans leading-relaxed">{item.failureMode}</span>
              </div>

              <div className="bg-cyan-950/20 p-2.5 rounded-sm border border-cyan-900/40 text-cyan-200">
                <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider font-semibold block mb-0.5">💡 Gancho Argumental para el Libro:</span>
                <span className="font-sans leading-relaxed">{item.narrativeHook}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">Generador de Lore Precursor</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateLoreItem} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Categoría del Elemento:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                >
                  <option value="artefacto">Artefacto Precursor / Hardware Primordial</option>
                  <option value="exploit">Exploit Táctico / Script de Realidad</option>
                  <option value="anomalia">Anomalía del Vacío / Residuos de Memory Leak</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  Instrucciones o Idea Específica (Opcional):
                </label>
                <textarea
                  rows={3}
                  placeholder="ej. Un dispositivo de compresión temporal hallado en el núcleo de un asteroide que la Inquisición considera una herejía de nivel raíz..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-2.5 text-xs text-white focus:border-cyan-500 outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-3 py-1.5 rounded-sm bg-[#111114] text-slate-300 text-xs font-mono uppercase tracking-wider cursor-pointer border border-[#1e293b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compilando Reliquia...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
