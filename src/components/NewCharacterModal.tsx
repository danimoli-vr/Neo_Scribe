import React from 'react';
import { User } from 'lucide-react';
import { NovelCharacter } from '../types';
import { CANONICAL_FACTIONS } from '../data/canonicalLore';

interface NewCharacterModalProps {
  isOpen: boolean;
  newChar: Partial<NovelCharacter>;
  onChange: (next: Partial<NovelCharacter>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * "Add a new character" modal, used from ChapterEditorView. Purely a
 * controlled form — all state (`newChar`) and persistence live in the parent.
 */
export const NewCharacterModal: React.FC<NewCharacterModalProps> = ({
  isOpen,
  newChar,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
              Nuevo Personaje de la Novela
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Nombre del Personaje:
            </label>
            <input
              type="text"
              required
              placeholder="ej. Tarek Sola, Comandante Vane..."
              value={newChar.name}
              onChange={(e) => onChange({ ...newChar, name: e.target.value })}
              className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                Rol / Ocupación:
              </label>
              <input
                type="text"
                required
                placeholder="ej. Depurador de Campo, Inquisidor..."
                value={newChar.role}
                onChange={(e) => onChange({ ...newChar, role: e.target.value })}
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                Facción / Lealtad:
              </label>
              <select
                value={newChar.factionId}
                onChange={(e) => onChange({ ...newChar, factionId: e.target.value })}
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
              >
                {CANONICAL_FACTIONS.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Implantes & Disipadores Térmicos del Personaje:
            </label>
            <input
              type="text"
              placeholder="ej. Coprocesador suboccipital con aleta de grafeno en la clavícula..."
              value={newChar.signatureImplants}
              onChange={(e) => onChange({ ...newChar, signatureImplants: e.target.value })}
              className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Resumen de Historia & Motivación:
            </label>
            <textarea
              rows={2}
              placeholder="ej. Expulsado de la flota imperial tras sabotear un script de purga..."
              value={newChar.summary}
              onChange={(e) => onChange({ ...newChar, summary: e.target.value })}
              className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-2 text-xs text-white focus:border-cyan-500 outline-none font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Notas de Voz / Manías:
            </label>
            <input
              type="text"
              placeholder="ej. Comprueba compulsivamente el manómetro de fluorocarbono..."
              value={newChar.notes}
              onChange={(e) => onChange({ ...newChar, notes: e.target.value })}
              className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-sm bg-[#111114] text-slate-300 text-xs font-mono uppercase tracking-wider cursor-pointer border border-[#1e293b]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
            >
              Guardar Personaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
