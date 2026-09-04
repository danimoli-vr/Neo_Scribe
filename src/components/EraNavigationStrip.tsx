import React from 'react';
import { Calendar } from 'lucide-react';
import { TimelineEvent } from '../types';
import { CANONICAL_ERAS } from '../data/canonicalTimeline';

interface EraNavigationStripProps {
  events: TimelineEvent[];
  selectedEraId: string;
  onSelectEra: (eraId: string) => void;
}

/** Horizontal strip of cosmological eras used to filter the timeline. */
export const EraNavigationStrip: React.FC<EraNavigationStripProps> = ({
  events,
  selectedEraId,
  onSelectEra,
}) => {
  return (
    <div className="bg-[#0e0f14] border border-[#1e293b] rounded-sm p-3 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>HORIZONTE COSMOLÓGICO POR ÉPOCAS:</span>
        </span>
        <span className="text-[10px] text-slate-500">Filtrar segmento temporal</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => onSelectEra('ALL')}
          className={`p-2 rounded-sm border text-left transition-all cursor-pointer ${
            selectedEraId === 'ALL'
              ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm'
              : 'bg-[#12131a] border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
        >
          <div className="text-[10px] text-cyan-400 font-bold uppercase">CANON COMPLETO</div>
          <div className="text-xs font-bold text-white truncate">Todas las Épocas</div>
          <div className="text-[9px] text-slate-500 mt-0.5">{events.length} hitos totales</div>
        </button>

        {CANONICAL_ERAS.map(era => {
          const isSelected = selectedEraId === era.id;
          const countInEra = events.filter(e => e.eraId === era.id).length;
          const hasAnacInEra = events.some(e => e.eraId === era.id && e.hasAnachronism);

          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onSelectEra(era.id)}
              className={`p-2 rounded-sm border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-[#1a1c29] border-cyan-400 text-white shadow-sm'
                  : 'bg-[#12131a] border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {hasAnacInEra && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Anacronismo detectado en esta era" />
              )}
              <div className="text-[10px] font-bold uppercase" style={{ color: era.color }}>
                {era.code} // {era.startYear}-{era.endYear}
              </div>
              <div className="text-xs font-bold text-white truncate" title={era.name}>
                {era.name.split('//')[0].trim()}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">{countInEra} hitos</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
