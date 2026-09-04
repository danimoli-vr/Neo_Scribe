import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  Building2, 
  Globe, 
  Map, 
  Users, 
  Layers, 
  Cpu, 
  Shield, 
  HardDrive, 
  Terminal, 
  Wand2,
  Edit3,
  Sparkles
} from 'lucide-react';
import { 
  useModuleConfig, 
  WORLDBUILDING_SCENARIOS, 
  MODULE_ICON_MAP 
} from '../services/moduleConfigService';
import { 
  useUserCustomModules 
} from '../services/userCustomModuleService';
import { ModuleId, ModuleCategory, CustomModuleTemplateType } from '../types';
import { CustomizerCustomTab } from './CustomizerCustomTab';
import { CustomizerScenariosTab } from './CustomizerScenariosTab';
import { CustomizerModulesTab } from './CustomizerModulesTab';
import { CustomizerSectionsTab } from './CustomizerSectionsTab';

interface WorldbuildingCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const AVAILABLE_ICONS = [
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

export const WorldbuildingCustomizerModal: React.FC<WorldbuildingCustomizerModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToModule 
}) => {
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
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Módulos Propios ({customModules.length})</span>
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
          {activeTab === 'custom' && (
            <CustomizerCustomTab
              customModules={customModules}
              onCreateFromPreset={handleCreateFromPreset}
              onCreateCustomModule={handleCreateCustomModule}
              onDeleteModule={deleteModule}
              onNavigateToModule={onNavigateToModule}
              onClose={onClose}
              creationSuccessMsg={creationSuccessMsg}
              isCreatingCustom={isCreatingCustom}
              setIsCreatingCustom={setIsCreatingCustom}
              newModTitle={newModTitle}
              setNewModTitle={setNewModTitle}
              newModDesc={newModDesc}
              setNewModDesc={setNewModDesc}
              newModIcon={newModIcon}
              setNewModIcon={setNewModIcon}
              newModCategory={newModCategory}
              setNewModCategory={setNewModCategory}
              availableIcons={AVAILABLE_ICONS}
            />
          )}

          {activeTab === 'scenarios' && (
            <CustomizerScenariosTab
              appliedScenarioId={appliedScenarioId}
              onApplyScenario={handleApplyScenario}
            />
          )}

          {activeTab === 'modules' && (
            <CustomizerModulesTab
              modules={modules}
              selectedModuleId={selectedModuleId}
              onSelectModuleId={setSelectedModuleId}
              onUpdateModule={updateModule}
              availableIcons={AVAILABLE_ICONS}
            />
          )}

          {activeTab === 'sections' && (
            <CustomizerSectionsTab
              sectionTitles={sectionTitles}
              onUpdateSectionTitle={updateSectionTitle}
            />
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
