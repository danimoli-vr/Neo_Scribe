import React from 'react';
import { Plus } from 'lucide-react';
import { NovelCharacter, StarSystem, TimelineEvent } from '../types';
import { CANONICAL_ERAS } from '../data/canonicalTimeline';

interface CreateTimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  characters: NovelCharacter[];
  starSystems: StarSystem[];
  title: string;
  onTitleChange: (v: string) => void;
  year: number;
  onYearChange: (v: number) => void;
  dateLabel: string;
  onDateLabelChange: (v: string) => void;
  eraId: string;
  onEraIdChange: (v: string) => void;
  category: TimelineEvent['category'];
  onCategoryChange: (v: TimelineEvent['category']) => void;
  systemId: string;
  onSystemIdChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  characterIds: string[];
  onToggleCharacterId: (id: string) => void;
  isFlashback: boolean;
  onIsFlashbackChange: (v: boolean) => void;
}

/**
 * "Register a new milestone" form modal for TimelineView. All form state
 * lives in the parent — this is a controlled form only.
 */
export const CreateTimelineEventModal: React.FC<CreateTimelineEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  characters,
  starSystems,
  title,
  onTitleChange,
  year,
  onYearChange,
  dateLabel,
  onDateLabelChange,
  eraId,
  onEraIdChange,
  category,
  onCategoryChange,
  systemId,
  onSystemIdChange,
  location,
  onLocationChange,
  description,
  onDescriptionChange,
  characterIds,
  onToggleCharacterId,
  isFlashback,
  onIsFlashbackChange,
}) => {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Event Title */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Título del Hito / Suceso:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
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
                value={year}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onYearChange(val);
                  onDateLabelChange(`Ciclo ${val.toFixed(3)} // Planck Tick 0x${Math.round(val % 256).toString(16).toUpperCase()}`);
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
                value={dateLabel}
                onChange={(e) => onDateLabelChange(e.target.value)}
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
                value={eraId}
                onChange={(e) => onEraIdChange(e.target.value)}
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
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as TimelineEvent['category'])}
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
                value={systemId}
                onChange={(e) => onSystemIdChange(e.target.value)}
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
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
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
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
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
                const isSelected = characterIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => onToggleCharacterId(c.id)}
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
              checked={isFlashback}
              onChange={(e) => onIsFlashbackChange(e.target.checked)}
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
              onClick={onClose}
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
  );
};
