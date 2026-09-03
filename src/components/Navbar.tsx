import React from 'react';
import { 
  Menu, Download, LayoutDashboard, Layers, BookOpen, 
  Network, Terminal, ShieldCheck, Globe, Users, HardDrive, 
  Sparkles, Compass, Clock, Cloud, Palette, Sliders
} from 'lucide-react';
import { useGenrePreset } from '../services/genrePresetService';
import { useModuleConfig, MODULE_ICON_MAP } from '../services/moduleConfigService';
import { userCustomModuleService } from '../services/userCustomModuleService';
import { ModuleId } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExport: () => void;
  onOpenStorageSync: () => void;
  onOpenGenreThemes?: () => void;
  onOpenWorldbuildingCustomizer?: () => void;
  onToggleNavigation: () => void;
  inconsistenciesCount?: number;
  anachronismsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenExport, 
  onOpenStorageSync,
  onOpenGenreThemes,
  onOpenWorldbuildingCustomizer,
  onToggleNavigation,
  inconsistenciesCount = 0,
  anachronismsCount = 0
}) => {
  const { currentGenre } = useGenrePreset();
  const { modules } = useModuleConfig();

  const customMod = activeTab.startsWith('custom_') ? userCustomModuleService.getById(activeTab) : undefined;
  const currentMod = modules[activeTab as ModuleId] || (customMod ? {
    id: customMod.id as any,
    title: customMod.title,
    desc: customMod.desc,
    code: customMod.code,
    iconName: customMod.iconName,
    enabled: customMod.enabled,
    category: customMod.category
  } : undefined);

  const CurrentIcon = currentMod ? (MODULE_ICON_MAP[currentMod.iconName] || Globe) : Compass;
  const currentLabel = currentMod ? currentMod.title : 'Workspace';
  const currentCode = currentMod ? currentMod.code : '--';

  return (
    <header className="sticky top-0 z-30 bg-[#0c0d12]/95 backdrop-blur-md border-b border-[#1e293b] font-mono text-xs select-none">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left Section: Navigation Panel Toggle & Current Module Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Main Menu Sidebar Toggle Button */}
          <button
            onClick={onToggleNavigation}
            className="px-3 py-1.5 rounded-sm bg-[#12141e] hover:bg-slate-800 text-cyan-300 border border-cyan-800/70 hover:border-cyan-400 flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] active:scale-95"
            title="Abrir / Desplegar Panel de Navegación Lateral"
            aria-label="Menú Principal"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wider uppercase text-[11px] hidden sm:inline">
              Menú Principal
            </span>
          </button>

          {/* Current Section Indicator / Breadcrumb */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#1e293b]">
            <div className="w-6 h-6 rounded-xs bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <CurrentIcon className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
                [{currentCode}]
              </span>
              <span className="font-bold text-white text-xs tracking-tight truncate">
                {currentLabel}
              </span>

              {activeTab === 'graph' && inconsistenciesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-rose-600 text-black font-bold rounded-xs animate-pulse">
                  {inconsistenciesCount} alertas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Section: Quick Switch to Overview Hub & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Return to Main Overview Hub (if not on overview) */}
          {activeTab !== 'overview' && (
            <button
              onClick={() => setActiveTab('overview')}
              className="px-2.5 py-1.5 rounded-sm bg-[#10121a] hover:bg-[#161824] text-slate-300 hover:text-white border border-[#1e293b] hover:border-slate-500 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
              title="Volver a la Visión General de la Novela"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Visión General</span>
            </button>
          )}

          {/* Worldbuilding & Navigation Modules Customizer Button */}
          {onOpenWorldbuildingCustomizer && (
            <button
              onClick={onOpenWorldbuildingCustomizer}
              className="px-2.5 py-1.5 rounded-sm bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-600/50 hover:border-cyan-400 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.15)]"
              title="Personalizar Nombres, Iconos y Módulos de WorldBuilding"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Personalizar Menú</span>
            </button>
          )}

          {/* Themes & Genre Preset Selector Button */}
          {onOpenGenreThemes && (
            <button
              onClick={onOpenGenreThemes}
              className="px-2.5 py-1.5 rounded-sm bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-white border border-amber-700/60 hover:border-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
              title="Personalizar Género Narrativo & Paleta de Color"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Temas</span>
            </button>
          )}

          {/* Cloud & Local Storage Sync Button */}
          <button
            onClick={onOpenStorageSync}
            className="px-2.5 py-1.5 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-700/60 hover:border-cyan-400 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            title="Configuración de Almacenamiento: Google Drive y Carpeta Local"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Nube & Disco</span>
          </button>

          {/* Export Novel Bible Button */}
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-sm bg-[#0e1017] hover:bg-[#161924] text-slate-200 hover:text-white border border-[#1e293b] hover:border-cyan-500/60 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            title="Exportar Biblia Completa de la Novela en Markdown"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exportar Biblia</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
