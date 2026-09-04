import React from 'react';
import { Database } from 'lucide-react';
import { Chapter, NovelCharacter, TimelineEvent, LoreItem } from '../types';

interface SyncBrowserTabProps {
  chapters: Chapter[];
  characters: NovelCharacter[];
  customTimelineEvents: TimelineEvent[];
  loreItems: LoreItem[];
  storageUsage: string;
}

export const SyncBrowserTab: React.FC<SyncBrowserTabProps> = ({
  chapters,
  characters,
  customTimelineEvents,
  loreItems,
  storageUsage
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-[#0e1422] border border-emerald-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>ALMACENAMIENTO INTERNO (LOCALSTORAGE)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
            {storageUsage} usado
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Este es el motor de autoguardado predeterminado de la aplicación. Guarda automáticamente cada cambio 3 segundos después de que dejas de teclear. Es ultrarrápido, funciona sin conexión a internet y se mantiene guardado al cerrar o recargar la pestaña.
        </p>

        <div className="border-t border-slate-800 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-black/40 border border-slate-800">
            <div className="text-slate-400 text-[10px]">CAPÍTULOS</div>
            <div className="text-white font-bold text-sm">{chapters.length}</div>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800">
            <div className="text-slate-400 text-[10px]">PERSONAJES</div>
            <div className="text-white font-bold text-sm">{characters.length}</div>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800">
            <div className="text-slate-400 text-[10px]">EVENTOS TIMELINE</div>
            <div className="text-white font-bold text-sm">{customTimelineEvents.length}</div>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800">
            <div className="text-slate-400 text-[10px]">ENTRADAS LORE</div>
            <div className="text-white font-bold text-sm">{loreItems.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
