import React from 'react';
import { 
  Plus, 
  FolderPlus, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { UserCustomModule, ModuleCategory } from '../types';
import { CUSTOM_MODULE_PRESETS } from '../services/userCustomModuleService';
import { MODULE_ICON_MAP } from '../services/moduleConfigService';

interface CustomizerCustomTabProps {
  customModules: UserCustomModule[];
  onCreateFromPreset: (presetId: string) => void;
  onCreateCustomModule: (e: React.FormEvent) => void;
  onDeleteModule: (moduleId: string) => void;
  onNavigateToModule?: (moduleId: string) => void;
  onClose: () => void;
  creationSuccessMsg: string | null;
  isCreatingCustom: boolean;
  setIsCreatingCustom: (val: boolean | ((prev: boolean) => boolean)) => void;
  newModTitle: string;
  setNewModTitle: (val: string) => void;
  newModDesc: string;
  setNewModDesc: (val: string) => void;
  newModIcon: string;
  setNewModIcon: (val: string) => void;
  newModCategory: ModuleCategory;
  setNewModCategory: (val: ModuleCategory) => void;
  availableIcons: Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}

export const CustomizerCustomTab: React.FC<CustomizerCustomTabProps> = ({
  customModules,
  onCreateFromPreset,
  onCreateCustomModule,
  onDeleteModule,
  onNavigateToModule,
  onClose,
  creationSuccessMsg,
  isCreatingCustom,
  setIsCreatingCustom,
  newModTitle,
  setNewModTitle,
  newModDesc,
  setNewModDesc,
  newModIcon,
  setNewModIcon,
  newModCategory,
  setNewModCategory,
  availableIcons
}) => {
  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {creationSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 flex items-center gap-2 text-xs animate-fadeIn shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{creationSuccessMsg}</span>
        </div>
      )}

      {/* Explanatory Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/30 border border-cyan-500/30 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              MÓDULOS PERSONALIZADOS PARA TU BIBLIA NARRATIVA
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Añade secciones únicas para tu universo: un <strong className="text-cyan-300">Bestiario de Criaturas</strong>, un <strong className="text-amber-300">Grimorio de Hechizos</strong>, un <strong className="text-emerald-300">Diccionario de Lenguas (Conlang)</strong>, una <strong className="text-rose-300">Flota Naval</strong> o cualquier categoría con campos y atributos a tu medida.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCustom(prev => !prev)}
          className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isCreatingCustom ? 'Ocultar Formulario' : 'Crear desde Cero'}</span>
        </button>
      </div>

      {/* Inline Custom Module Creation Form */}
      {isCreatingCustom && (
        <form onSubmit={onCreateCustomModule} className="bg-[#0e121a] border border-cyan-500/40 rounded-lg p-5 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Configurar Nuevo Módulo Personalizado
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Se integrará en la navegación y en el menú general
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Nombre del Módulo *
              </label>
              <input
                type="text"
                required
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                placeholder="Ej: Bestiario del Páramo, Grimorio de Sombras, Arsenal..."
                className="w-full px-3 py-2 bg-[#080a0f] border border-slate-700 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Sección Asignada en el Menú
              </label>
              <select
                value={newModCategory}
                onChange={(e) => setNewModCategory(e.target.value as ModuleCategory)}
                className="w-full px-3 py-2 bg-[#080a0f] border border-slate-700 rounded text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                <option value="worldbuilding">WorldBuilding / Construcción de Mundo</option>
                <option value="writing">Manuscrito & Narrativa</option>
                <option value="auditor">Auditoría, Simuladores & Herramientas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Descripción Diegética / Propósito
            </label>
            <input
              type="text"
              value={newModDesc}
              onChange={(e) => setNewModDesc(e.target.value)}
              placeholder="Ej: Compendio biológico de monstruos clasificados por nivel de amenaza y hábitat."
              className="w-full px-3 py-2 bg-[#080a0f] border border-slate-700 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2">
              Icono Vectorial para el Menú
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 bg-[#080a0f] rounded border border-slate-800">
              {availableIcons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                const isSelected = newModIcon === iconItem.key;
                return (
                  <button
                    key={iconItem.key}
                    type="button"
                    onClick={() => setNewModIcon(iconItem.key)}
                    className={`p-2 rounded border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                    title={iconItem.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newModTitle.trim()}
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Crear Módulo Ahora</span>
            </button>
          </div>
        </form>
      )}

      {/* Instant Preset Templates Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#1e293b]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Plantillas Listas para Instalar (1 Clic)
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Se configuran con campos y una entrada de ejemplo precargada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CUSTOM_MODULE_PRESETS.filter(p => p.id !== 'custom_blank').map((preset) => {
            const IconComp = MODULE_ICON_MAP[preset.iconName] || Layers;
            return (
              <div
                key={preset.id}
                className="bg-[#090b10] border border-slate-800 hover:border-cyan-500/50 rounded-lg p-3.5 flex flex-col justify-between gap-3 transition-all hover:bg-[#0e121a] group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </h5>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      [{preset.defaultCode}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {preset.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-500">
                    {preset.defaultFields.length} campos definidos
                  </span>
                  <button
                    type="button"
                    onClick={() => onCreateFromPreset(preset.id)}
                    className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/50 hover:border-cyan-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Already Created Custom Modules */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-[#1e293b]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            Tus Módulos Propios Creados ({customModules.length})
          </h4>
        </div>

        {customModules.length === 0 ? (
          <div className="bg-[#090b10] border border-dashed border-slate-800 rounded-lg p-6 text-center text-slate-500 text-xs space-y-2">
            <p>Aún no has creado ningún módulo personalizado.</p>
            <p className="text-[11px] text-slate-600">
              Haz clic en cualquiera de las plantillas de arriba (ej: Bestiario, Grimorio o Conlang) para añadirlo al instante a tu proyecto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customModules.map((mod) => {
              const IconComp = MODULE_ICON_MAP[mod.iconName] || Layers;
              return (
                <div
                  key={mod.id}
                  className="bg-[#090b10] border border-cyan-500/30 rounded-lg p-4 flex flex-col justify-between gap-3 shadow-lg"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-bold">[{mod.code}]</span>
                            <h5 className="font-bold text-white text-xs">
                              {mod.title}
                            </h5>
                          </div>
                          <span className="text-[9px] text-cyan-400 font-mono uppercase">
                            {mod.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {mod.items.length} {mod.items.length === 1 ? 'entrada' : 'entradas'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el módulo "${mod.title}" y sus ${mod.items.length} entradas?`)) {
                          onDeleteModule(mod.id);
                        }
                      }}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>

                    {onNavigateToModule && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateToModule(mod.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                      >
                        <span>Abrir Módulo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
