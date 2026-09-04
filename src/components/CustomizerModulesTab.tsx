import React from 'react';
import { 
  Globe, 
  ChevronRight, 
  Layers, 
  Terminal, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { ModuleId, CustomModuleConfig } from '../types';
import { MODULE_ICON_MAP } from '../services/moduleConfigService';

interface CustomizerModulesTabProps {
  modules: Record<ModuleId, CustomModuleConfig>;
  selectedModuleId: ModuleId;
  onSelectModuleId: (id: ModuleId) => void;
  onUpdateModule: (id: ModuleId, updates: Partial<CustomModuleConfig>) => void;
  availableIcons: Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}

export const CustomizerModulesTab: React.FC<CustomizerModulesTabProps> = ({
  modules,
  selectedModuleId,
  onSelectModuleId,
  onUpdateModule,
  availableIcons
}) => {
  const currentMod = modules[selectedModuleId];

  const worldbuildingModules: ModuleId[] = ['architecture', 'atlas', 'factions', 'lore'];
  const writingModules: ModuleId[] = ['chapters', 'graph', 'timeline'];
  const auditorModules: ModuleId[] = ['sandbox', 'auditor'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Module Selector List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Selecciona un Módulo para Editar
        </div>

        {/* Worldbuilding modules group */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-cyan-400 px-2 flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>WORLDBUILDING & ENTORNO</span>
          </div>
          {worldbuildingModules.map(mId => {
            const mod = modules[mId];
            if (!mod) return null;
            const isSelected = selectedModuleId === mId;
            const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;

            return (
              <button
                key={mId}
                onClick={() => onSelectModuleId(mId)}
                className={`w-full p-2.5 rounded text-left flex items-center justify-between border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'bg-[#0e121a] border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs truncate block">
                      {mod.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {mId} [{mod.code}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {mod.enabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Módulo activo en el menú" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title="Módulo oculto en el menú" />
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Auditor & Sandbox group */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-bold text-purple-400 px-2 flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            <span>AUDITORÍA & HERRAMIENTAS</span>
          </div>
          {auditorModules.map(mId => {
            const mod = modules[mId];
            if (!mod) return null;
            const isSelected = selectedModuleId === mId;
            const IconComp = MODULE_ICON_MAP[mod.iconName] || Terminal;

            return (
              <button
                key={mId}
                onClick={() => onSelectModuleId(mId)}
                className={`w-full p-2.5 rounded text-left flex items-center justify-between border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 text-white'
                    : 'bg-[#0e121a] border-[#1e293b] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs truncate block">{mod.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {mId} [{mod.code}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {mod.enabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Writing group */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-bold text-amber-400 px-2 flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>MANUSCRITO & TRAMA</span>
          </div>
          {writingModules.map(mId => {
            const mod = modules[mId];
            if (!mod) return null;
            const isSelected = selectedModuleId === mId;
            const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;

            return (
              <button
                key={mId}
                onClick={() => onSelectModuleId(mId)}
                className={`w-full p-2.5 rounded text-left flex items-center justify-between border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 text-white'
                    : 'bg-[#0e121a] border-[#1e293b] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs truncate block">{mod.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {mId} [{mod.code}]</span>
                  </div>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Module Edit Form */}
      <div className="lg:col-span-8 bg-[#0d1017] border border-[#1e293b] rounded-lg p-5 space-y-5">
        {currentMod && (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                  {React.createElement(MODULE_ICON_MAP[currentMod.iconName] || Globe, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">
                      Configurar Módulo: {currentMod.title}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      [{currentMod.code}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Cambia cómo aparece este módulo en el menú, barra superior y vistas.
                  </p>
                </div>
              </div>

              {/* Enable / Disable toggle */}
              <button
                onClick={() => onUpdateModule(selectedModuleId, { enabled: !currentMod.enabled })}
                className={`px-3 py-1.5 rounded flex items-center gap-2 border text-xs font-bold transition-all cursor-pointer ${
                  currentMod.enabled
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
                }`}
                title={currentMod.enabled ? 'Ocultar módulo del menú' : 'Mostrar módulo en el menú'}
              >
                {currentMod.enabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Módulo Activo</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Módulo Oculto</span>
                  </>
                )}
              </button>
            </div>

            {/* Field 1: Custom Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Nombre del Módulo en el Menú & Barra Superior
              </label>
              <input
                type="text"
                value={currentMod.title}
                onChange={(e) => onUpdateModule(selectedModuleId, { title: e.target.value })}
                placeholder="Ej: Distritos de Neo-Tokio, Mapa del Feudo, Escenas del Crimen..."
                className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block">
                Aparecerá en el panel lateral, el encabezado superior y la tarjeta de la visión general.
              </span>
            </div>

            {/* Field 2: Custom Description / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Descripción Breve / Subtítulo
              </label>
              <textarea
                rows={2}
                value={currentMod.desc}
                onChange={(e) => onUpdateModule(selectedModuleId, { desc: e.target.value })}
                placeholder="Describe el propósito o contenido de este módulo para tu universo narrativo..."
                className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
              />
            </div>

            {/* Field 3: Icon Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Icono del Módulo
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {availableIcons.map(({ key, label, icon: IconComponent }) => {
                  const isCurrent = currentMod.iconName === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onUpdateModule(selectedModuleId, { iconName: key })}
                      className={`p-2 rounded border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'border-slate-800 bg-[#090b10] text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                      title={label}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[9px] truncate max-w-full font-mono">
                        {label.split('/')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-3 bg-black/40 border border-slate-800 rounded space-y-1 text-xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                Vista Previa en el Menú:
              </span>
              <div className="flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  {React.createElement(MODULE_ICON_MAP[currentMod.iconName] || Globe, { className: 'w-3.5 h-3.5' })}
                </div>
                <span className="font-bold text-xs">{currentMod.title}</span>
                <span className="text-slate-500 text-[10px]">[{currentMod.code}]</span>
                {!currentMod.enabled && (
                  <span className="text-[9px] px-1.5 bg-rose-950 border border-rose-800 text-rose-300 rounded ml-auto">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 pl-8">
                {currentMod.desc}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
