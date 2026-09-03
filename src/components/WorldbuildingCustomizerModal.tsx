import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Building2, 
  Globe, 
  Map, 
  Users, 
  Layers, 
  Cpu, 
  Shield, 
  HardDrive, 
  Terminal, 
  Info,
  Wand2,
  Edit3,
  Plus,
  FolderPlus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { 
  useModuleConfig, 
  WORLDBUILDING_SCENARIOS, 
  MODULE_ICON_MAP 
} from '../services/moduleConfigService';
import { 
  useUserCustomModules, 
  CUSTOM_MODULE_PRESETS 
} from '../services/userCustomModuleService';
import { ModuleId, ModuleCategory, CustomModuleTemplateType } from '../types';

interface WorldbuildingCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (moduleId: string) => void;
}

const AVAILABLE_ICONS = [
  { key: 'building', label: 'Edificio / Ciudad', icon: Building2 },
  { key: 'globe', label: 'Planeta / Galaxia', icon: Globe },
  { key: 'map', label: 'Mapa / Cartografía', icon: Map },
  { key: 'castle', label: 'Castillo / Feudo', icon: MODULE_ICON_MAP.castle },
  { key: 'landmark', label: 'Monumento / Arqueología', icon: MODULE_ICON_MAP.landmark },
  { key: 'users', label: 'Facciones / Grupos', icon: Users },
  { key: 'shield', label: 'Escudo / Leyes', icon: Shield },
  { key: 'layers', label: 'Capas / Sustrato', icon: Layers },
  { key: 'flame', label: 'Fuego / Magia', icon: MODULE_ICON_MAP.flame },
  { key: 'scroll', label: 'Pergamino / Códice', icon: MODULE_ICON_MAP.scroll },
  { key: 'swords', label: 'Espadas / Clanes', icon: MODULE_ICON_MAP.swords },
  { key: 'cpu', label: 'Chip / Ciberware', icon: Cpu },
  { key: 'hard-drive', label: 'Archivo / Base de Datos', icon: HardDrive },
  { key: 'terminal', label: 'Terminal / Consola', icon: Terminal },
  { key: 'search', label: 'Lupa / Investigación', icon: MODULE_ICON_MAP.search },
  { key: 'crosshair', label: 'Mira / Táctica', icon: MODULE_ICON_MAP.crosshair },
  { key: 'book', label: 'Libro / Diario', icon: MODULE_ICON_MAP.book },
  { key: 'clock', label: 'Reloj / Cronología', icon: MODULE_ICON_MAP.clock },
  { key: 'compass', label: 'Brújula / Yermo', icon: MODULE_ICON_MAP.compass },
  { key: 'boxes', label: 'Cajas / Recursos', icon: MODULE_ICON_MAP.boxes }
];

export const WorldbuildingCustomizerModal: React.FC<WorldbuildingCustomizerModalProps> = ({ isOpen, onClose, onNavigateToModule }) => {
  const { 
    modules, 
    sectionTitles, 
    updateModule, 
    updateSectionTitle, 
    applyScenario, 
    resetAllToDefault 
  } = useModuleConfig();

  const { 
    customModules, 
    createFromPreset, 
    createCustom, 
    deleteModule 
  } = useUserCustomModules();

  const [activeTab, setActiveTab] = useState<'custom' | 'scenarios' | 'modules' | 'sections'>('custom');
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId>('atlas');
  const [appliedScenarioId, setAppliedScenarioId] = useState<string | null>(null);

  // Form for creating new custom module
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModIcon, setNewModIcon] = useState('boxes');
  const [newModCategory, setNewModCategory] = useState<ModuleCategory>('worldbuilding');
  const [newModTemplate, setNewModTemplate] = useState<CustomModuleTemplateType>('catalog');
  const [creationSuccessMsg, setCreationSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMod = modules[selectedModuleId];

  // Group modules by category
  const worldbuildingModules: ModuleId[] = ['architecture', 'atlas', 'factions', 'lore'];
  const writingModules: ModuleId[] = ['chapters', 'graph', 'timeline'];
  const auditorModules: ModuleId[] = ['sandbox', 'auditor'];

  const handleApplyScenario = (scenarioId: string) => {
    applyScenario(scenarioId);
    setAppliedScenarioId(scenarioId);
    setTimeout(() => setAppliedScenarioId(null), 2500);
  };

  const handleCreateFromPreset = (presetId: string) => {
    const created = createFromPreset(presetId);
    setCreationSuccessMsg(`¡Módulo "${created.title}" creado con éxito!`);
    setTimeout(() => setCreationSuccessMsg(null), 3000);
  };

  const handleCreateCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle.trim()) return;

    const created = createCustom({
      title: newModTitle.trim(),
      desc: newModDesc.trim() || 'Módulo personalizado de usuario',
      iconName: newModIcon,
      category: newModCategory,
      templateType: newModTemplate
    });

    setCreationSuccessMsg(`¡Módulo "${created.title}" creado con éxito!`);
    setIsCreatingCustom(false);
    setNewModTitle('');
    setNewModDesc('');
    setTimeout(() => setCreationSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn font-mono text-xs select-none">
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-gradient-to-r from-[#0d121c] via-[#0b1019] to-[#080b11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  PERSONALIZACIÓN TOTAL DE MENÚ & WORLDBUILDING
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  100% EDITABLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adapta nombres, descripciones, iconos y visibilidad de cada módulo para que encajen exactamente con tu historia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#070a0f] px-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span>Añadir Módulos Propios</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold ml-1">
                {customModules.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Escenarios Rápidos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 ml-1">
                {WORLDBUILDING_SCENARIOS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'modules'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Editar Módulos Nativos</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sections'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Encabezados de Secciones</span>
            </button>
          </div>

          <button
            onClick={() => resetAllToDefault()}
            className="py-1.5 px-3 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors text-[11px] cursor-pointer shrink-0 ml-2"
            title="Restablecer todos los nombres y módulos a los valores del género actual"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Restablecer Original</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 0: AÑADIR MÓDULOS PROPIOS */}
          {activeTab === 'custom' && (
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
                <form onSubmit={handleCreateCustomModule} className="bg-[#0e121a] border border-cyan-500/40 rounded-lg p-5 space-y-4 shadow-xl animate-fadeIn">
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
                      {AVAILABLE_ICONS.map((iconItem) => {
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
                            onClick={() => handleCreateFromPreset(preset.id)}
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
                                  deleteModule(mod.id);
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
          )}

          {/* TAB 1: ESCENARIOS RÁPIDOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <strong className="text-white">¿Tu historia transcurre en una sola ciudad, en un reino feudal o en un búnker subterráneo?</strong>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Aplica una plantilla con un solo clic. Por ejemplo, en <strong className="text-cyan-300">Metrópolis Cyberpunk</strong> el Atlas se convierte en "Distritos de la Metrópolis" con icono de rascacielos, las Facciones en "Megacorporaciones & Cárteles" y el Sustrato en "Arquitectura de Red & Ciberware". Después podrás retocar cada nombre como prefieras.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WORLDBUILDING_SCENARIOS.map((sc) => {
                  const isJustApplied = appliedScenarioId === sc.id;
                  const IconComp = MODULE_ICON_MAP[sc.icon] || Building2;

                  return (
                    <div
                      key={sc.id}
                      className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                        isJustApplied 
                          ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'border-[#1e293b] bg-[#0e121a] hover:border-cyan-500/60 hover:bg-[#121624]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-xs tracking-wide">
                                {sc.name}
                              </h3>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                                {sc.badge}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {sc.description}
                        </p>

                        {/* Quick preview of changes */}
                        <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 space-y-1.5 text-[10px]">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500">Atlas:</span>
                            <span className="text-cyan-300 font-bold truncate max-w-[170px] text-right">
                              {sc.modules.atlas?.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500">Facciones:</span>
                            <span className="text-purple-300 font-bold truncate max-w-[170px] text-right">
                              {sc.modules.factions?.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500">Sustrato/Leyes:</span>
                            <span className="text-emerald-300 font-bold truncate max-w-[170px] text-right">
                              {sc.modules.architecture?.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => handleApplyScenario(sc.id)}
                          className={`w-full py-2 px-3 rounded flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                            isJustApplied
                              ? 'bg-emerald-600 text-black shadow-lg'
                              : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300'
                          }`}
                        >
                          {isJustApplied ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>¡Aplicado con Éxito!</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Aplicar Este Escenario</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EDITOR DETALLADO MÓDULO A MÓDULO */}
          {activeTab === 'modules' && (
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
                    const isSelected = selectedModuleId === mId;
                    const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;

                    return (
                      <button
                        key={mId}
                        onClick={() => setSelectedModuleId(mId)}
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
                    const isSelected = selectedModuleId === mId;
                    const IconComp = MODULE_ICON_MAP[mod.iconName] || Terminal;

                    return (
                      <button
                        key={mId}
                        onClick={() => setSelectedModuleId(mId)}
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
                    <MODULE_ICON_MAP.book className="w-3 h-3" />
                    <span>MANUSCRITO & TRAMA</span>
                  </div>
                  {writingModules.map(mId => {
                    const mod = modules[mId];
                    const isSelected = selectedModuleId === mId;
                    const IconComp = MODULE_ICON_MAP[mod.iconName] || MODULE_ICON_MAP.book;

                    return (
                      <button
                        key={mId}
                        onClick={() => setSelectedModuleId(mId)}
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
                        onClick={() => updateModule(selectedModuleId, { enabled: !currentMod.enabled })}
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
                        onChange={(e) => updateModule(selectedModuleId, { title: e.target.value })}
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
                        onChange={(e) => updateModule(selectedModuleId, { desc: e.target.value })}
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
                        {AVAILABLE_ICONS.map(({ key, label, icon: IconComponent }) => {
                          const isCurrent = currentMod.iconName === key;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateModule(selectedModuleId, { iconName: key })}
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
          )}

          {/* TAB 3: ENCABEZADOS DE SECCIONES */}
          {activeTab === 'sections' && (
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
                    onChange={(e) => updateSectionTitle('worldbuilding', e.target.value)}
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
                    onChange={(e) => updateSectionTitle('writing', e.target.value)}
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
                    onChange={(e) => updateSectionTitle('auditor', e.target.value)}
                    placeholder="Ej: AUDITORÍA & CONSISTENCIA, FORENSE, ORÁCULO..."
                    className="w-full px-3 py-2 bg-[#090b10] border border-slate-700 rounded text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1e293b] bg-[#090c12] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Los cambios se guardan automáticamente en tu sesión local.
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs transition-colors cursor-pointer"
          >
            Listo / Guardar
          </button>
        </div>

      </div>
    </div>
  );
};
