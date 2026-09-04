import React from 'react';
import { CustomModuleField } from '../types';
import { X, Plus, Trash2, Save, Sparkles } from 'lucide-react';

interface CustomModuleItemEditorProps {
  isCreatingNew: boolean;
  moduleTitle: string;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formSubtitle: string;
  setFormSubtitle: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formImportance: 'baja' | 'media' | 'alta' | 'critica';
  setFormImportance: (val: 'baja' | 'media' | 'alta' | 'critica') => void;
  formTags: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  formFields: CustomModuleField[];
  onFieldChange: (index: number, key: 'label' | 'value', val: string) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  formContent: string;
  setFormContent: (val: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const CustomModuleItemEditor: React.FC<CustomModuleItemEditorProps> = ({
  isCreatingNew,
  moduleTitle,
  formTitle,
  setFormTitle,
  formSubtitle,
  setFormSubtitle,
  formCategory,
  setFormCategory,
  formImportance,
  setFormImportance,
  formTags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  formFields,
  onFieldChange,
  onAddField,
  onRemoveField,
  formContent,
  setFormContent,
  onCancel,
  onSave,
  onDelete
}) => {
  return (
    <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-lg p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <h3 className="font-bold text-white text-sm">
            {isCreatingNew ? `Nueva Entrada en ${moduleTitle}` : `Editar: ${formTitle || 'Sin Título'}`}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Title and Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Nombre / Título de Entrada *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ej: Quimera de Grafeno, Pacto de Null..."
              className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Subtítulo / Epígrafe
            </label>
            <input
              type="text"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="Ej: Depredador de las lunas de Oort..."
              className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category and Importance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <input
              type="text"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              placeholder="Ej: Bioformas Alfa, Hechizos..."
              className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Nivel de Relevancia
            </label>
            <select
              value={formImportance}
              onChange={(e) => setFormImportance(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="baja">Baja (Mención de fondo)</option>
              <option value="media">Media (Elemento recurrente)</option>
              <option value="alta">Alta (Relevante para trama)</option>
              <option value="critica">Crítica (Eje principal de la historia)</option>
            </select>
          </div>
        </div>

        {/* Tags Management */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Etiquetas de Búsqueda
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag();
                }
              }}
              placeholder="Escribe un tag y pulsa Enter o Añadir..."
              className="flex-1 px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={onAddTag}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
            >
              Añadir
            </button>
          </div>
          {formTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {formTags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Key-Value Fields */}
        <div className="space-y-2 pt-2 border-t border-[#182030]">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider">
              Atributos y Parámetros Estructurados
            </label>
            <button
              type="button"
              onClick={onAddField}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Campo</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {formFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onFieldChange(idx, 'label', e.target.value)}
                  placeholder="Nombre de campo (ej: Hábitat)"
                  className="w-1/3 px-2.5 py-1 bg-[#080a0f] border border-[#1e293b] rounded text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => onFieldChange(idx, 'value', e.target.value)}
                  placeholder="Valor (ej: Subsuelo rocoso)"
                  className="flex-1 px-2.5 py-1 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onRemoveField(idx)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Diegetic Description / Lore Content */}
        <div className="space-y-1 pt-2 border-t border-[#182030]">
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider">
            Descripción Diegética & Contexto Narrativo
          </label>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            rows={5}
            placeholder="Escribe aquí las notas del manuscrito, descripción física, historia, debilidades o rol en la trama..."
            className="w-full px-3 py-2 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs font-mono leading-relaxed focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
        <div>
          {!isCreatingNew && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1.5 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!formTitle.trim()}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Entrada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
