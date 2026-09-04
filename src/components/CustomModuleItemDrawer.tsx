import React from 'react';
import { UserModuleItem } from '../types';
import { Edit3, Sparkles, Tag, FileText } from 'lucide-react';

interface CustomModuleItemDrawerProps {
  activeItem: UserModuleItem | null;
  moduleTitle: string;
  IconComp: React.ComponentType<{ className?: string }>;
  getImportanceBadge: (importance?: string) => React.ReactNode;
  onEditItem: (item: UserModuleItem) => void;
  onSendToAuditor?: () => void;
}

export const CustomModuleItemDrawer: React.FC<CustomModuleItemDrawerProps> = ({
  activeItem,
  moduleTitle,
  IconComp,
  getImportanceBadge,
  onEditItem,
  onSendToAuditor
}) => {
  if (!activeItem) {
    return (
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-12 text-center text-slate-500">
        <IconComp className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>Selecciona una entrada a la izquierda para inspeccionar sus datos.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1e293b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {activeItem.title}
            </h2>
            {getImportanceBadge(activeItem.importance)}
            {activeItem.category && (
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                {activeItem.category}
              </span>
            )}
          </div>
          {activeItem.subtitle && (
            <p className="text-xs text-slate-400 italic">
              {activeItem.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEditItem(activeItem)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1 text-xs cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          {onSendToAuditor && (
            <button
              onClick={onSendToAuditor}
              className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 flex items-center gap-1 text-xs cursor-pointer transition-colors"
              title="Enviar a la pantalla de Auditoría IA para verificar coherencia"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Auditar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {activeItem.tags && activeItem.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-slate-500" />
          {activeItem.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[10px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Key-Value Fields Grid */}
      {activeItem.fields && activeItem.fields.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Parámetros & Atributos Clave
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeItem.fields.map((field, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-[#07090e] border border-[#1a2333] space-y-0.5"
              >
                <div className="text-[10px] text-slate-500 font-bold uppercase truncate">
                  {field.label}
                </div>
                <div className="text-xs text-slate-200 font-mono break-words">
                  {field.value || <span className="text-slate-600 italic">No especificado</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content / Narrative Lore */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Descripción Diegética & Lore
        </h4>
        <div className="p-4 rounded bg-[#07090e] border border-[#1a2333] text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">
          {activeItem.content || (
            <span className="text-slate-600 italic">
              Sin descripción detallada. Pulsa "Editar" para añadir contexto narrativo.
            </span>
          )}
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[10px] text-slate-500">
        <span>ID: {activeItem.id}</span>
        <span>Última modificación: {new Date(activeItem.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
