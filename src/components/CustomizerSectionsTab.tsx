import React from 'react';
import { Info } from 'lucide-react';
import { SectionTitles, ModuleCategory } from '../types';

interface CustomizerSectionsTabProps {
  sectionTitles: SectionTitles;
  onUpdateSectionTitle: (section: ModuleCategory, title: string) => void;
}

export const CustomizerSectionsTab: React.FC<CustomizerSectionsTabProps> = ({
  sectionTitles,
  onUpdateSectionTitle
}) => {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p>
          Personaliza los títulos de las categorías que agrupan los módulos en el panel de navegación lateral.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-cyan-300 block">
            Sección de WorldBuilding / Entorno:
          </label>
          <input
            type="text"
            value={sectionTitles.worldbuilding}
            onChange={(e) => onUpdateSectionTitle('worldbuilding', e.target.value)}
            placeholder="Ej: CONSTRUCCIÓN DE LA METRÓPOLIS, MAPA DEL REINO, REGLAS DEL MUNDO..."
            className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300 block">
            Sección de Manuscrito & Narrativa:
          </label>
          <input
            type="text"
            value={sectionTitles.writing}
            onChange={(e) => onUpdateSectionTitle('writing', e.target.value)}
            placeholder="Ej: MANUSCRITO, CRÓNICAS, CASOS POLICIALES..."
            className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-purple-300 block">
            Sección de Auditoría & Herramientas:
          </label>
          <input
            type="text"
            value={sectionTitles.auditor}
            onChange={(e) => onUpdateSectionTitle('auditor', e.target.value)}
            placeholder="Ej: AUDITORÍA & CONSISTENCIA, FORENSE, ORÁCULO..."
            className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
