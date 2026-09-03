import React from 'react';
import { 
  BookOpen, Network, Terminal, ShieldCheck, Layers, Globe, 
  Users, HardDrive, Download, LayoutDashboard, ChevronLeft, 
  ChevronRight, X, Sparkles, AlertTriangle, ShieldAlert, Cpu, Clock, Palette, Sliders, Plus
} from 'lucide-react';
import { useGenrePreset } from '../services/genrePresetService';
import { useModuleConfig, MODULE_ICON_MAP } from '../services/moduleConfigService';
import { useUserCustomModules } from '../services/userCustomModuleService';
import { ModuleId, UserCustomModule } from '../types';

interface NavigationPanelProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isOpen: boolean; // For mobile / drawer open state
  onCloseMobile: () => void;
  isCollapsed: boolean; // For desktop collapsed state (compact icons)
  onToggleCollapse: () => void;
  onOpenExport: () => void;
  onOpenGenreThemes?: () => void;
  onOpenWorldbuildingCustomizer?: () => void;
  inconsistenciesCount: number;
  anachronismsCount?: number;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenExport,
  onOpenGenreThemes,
  onOpenWorldbuildingCustomizer,
  inconsistenciesCount,
  anachronismsCount = 0
}) => {
  const { terms, currentGenre } = useGenrePreset();
  const { modules, sectionTitles } = useModuleConfig();
  const { customModules } = useUserCustomModules();

  // Helper to build nav items dynamically from effective configuration
  const buildItem = (id: ModuleId, highlight = false, alertBadge?: string) => {
    const mod = modules[id];
    if (!mod || !mod.enabled) return null;
    const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;
    return {
      id: mod.id,
      label: mod.title,
      code: mod.code,
      icon: IconComp,
      hint: mod.desc,
      highlight,
      alertBadge
    };
  };

  // Helper for user-created custom modules
  const buildCustomItem = (mod: UserCustomModule) => {
    if (!mod.enabled) return null;
    const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;
    return {
      id: mod.id,
      label: mod.title,
      code: mod.code,
      icon: IconComp,
      hint: mod.desc,
      highlight: false,
      alertBadge: mod.items.length > 0 ? `${mod.items.length}` : undefined
    };
  };

  const navSections = [
    {
      label: 'PANEL PRINCIPAL',
      items: [
        buildItem('overview')
      ].filter(Boolean)
    },
    {
      label: sectionTitles.writing,
      items: [
        buildItem('chapters', true),
        buildItem('graph', true, inconsistenciesCount > 0 ? `${inconsistenciesCount}` : undefined),
        buildItem('timeline', true, anachronismsCount > 0 ? `${anachronismsCount}` : undefined),
        ...customModules.filter(m => m.category === 'writing').map(buildCustomItem)
      ].filter(Boolean)
    },
    {
      label: sectionTitles.worldbuilding,
      items: [
        buildItem('architecture'),
        buildItem('atlas'),
        buildItem('factions'),
        buildItem('lore'),
        ...customModules.filter(m => m.category === 'worldbuilding').map(buildCustomItem)
      ].filter(Boolean)
    },
    {
      label: sectionTitles.auditor,
      items: [
        buildItem('sandbox'),
        buildItem('auditor'),
        ...customModules.filter(m => m.category === 'auditor').map(buildCustomItem)
      ].filter(Boolean)
    }
  ].filter(section => section.items.length > 0);

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 flex flex-col 
          bg-[#0d0e14] border-r border-[#1e293b] text-xs font-mono transition-all duration-200 select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16 w-64' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#090a0f]">
          <div 
            onClick={() => handleItemClick('overview')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            title="Ir al Menú Principal"
          >
            <div className="w-8 h-8 border-2 border-cyan-500 rounded-xs flex items-center justify-center rotate-45 shrink-0 bg-[#0d0d12] shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <div className="w-3.5 h-3.5 bg-cyan-500 rotate-[-45deg]" />
            </div>

            {!isCollapsed && (
              <div className="leading-tight truncate">
                <div className="font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span className="truncate">{terms.appName}</span>
                  <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/60 px-1 py-0.2 rounded-xs border border-cyan-800/60 shrink-0">{currentGenre.badge}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentGenre.shortName.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Close mobile button */}
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            aria-label="Cerrar panel de navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5 no-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.label}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      title={isCollapsed ? `${item.label} (${item.hint})` : undefined}
                      className={`
                        w-full text-left rounded-sm transition-all cursor-pointer flex items-center gap-2.5
                        ${isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2'}
                        ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#151722] border border-transparent'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />

                      {!isCollapsed && (
                        <div className="flex-1 truncate">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-xs">{item.label}</span>
                            {item.alertBadge && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-600 text-black rounded-xs shrink-0 animate-pulse">
                                {item.alertBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-sans">
                            {item.hint}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#1e293b] bg-[#090a0f] space-y-2 shrink-0">
          {/* Worldbuilding and Menu Modules Customizer Button */}
          {onOpenWorldbuildingCustomizer && (
            <button
              onClick={onOpenWorldbuildingCustomizer}
              className={`
                w-full py-2 px-3 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 
                border border-cyan-700/50 hover:border-cyan-400 flex items-center gap-2 
                transition-colors cursor-pointer text-xs shadow-[0_0_8px_rgba(6,182,212,0.1)]
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title="Personalizar Nombres, Iconos y Visibilidad de Módulos (WorldBuilding)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {!isCollapsed && <span className="truncate font-bold">Personalizar Menú</span>}
            </button>
          )}

          {onOpenGenreThemes && (
            <button
              onClick={onOpenGenreThemes}
              className={`
                w-full py-2 px-3 rounded-sm bg-[#12141e] hover:bg-slate-800 text-slate-200 
                border border-[#1e293b] hover:border-amber-500/60 flex items-center gap-2 
                transition-colors cursor-pointer text-xs
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title="Personalizar Género Literario & Paleta de Color"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Temas & Género</span>}
            </button>
          )}

          <button
            onClick={onOpenExport}
            className={`
              w-full py-2 px-3 rounded-sm bg-[#12141e] hover:bg-slate-800 text-slate-200 
              border border-[#1e293b] hover:border-cyan-500/60 flex items-center gap-2 
              transition-colors cursor-pointer text-xs
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
            title="Exportar Biblia Completa de la Novela"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Exportar Biblia</span>}
          </button>

          {/* Collapse/Expand Toggle (Desktop only) */}
          <div className="hidden lg:flex items-center justify-between pt-1">
            {!isCollapsed && (
              <span className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">
                Colapsar Menú
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-auto"
              title={isCollapsed ? 'Expandir panel de navegación' : 'Contraer panel'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
