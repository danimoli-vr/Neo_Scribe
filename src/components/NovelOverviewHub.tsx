import React from 'react';
import { 
  BookOpen, Network, Terminal, ShieldCheck, Layers, Globe, 
  Users, HardDrive, Download, ArrowRight, Sparkles, AlertTriangle, 
  CheckCircle2, Compass, Cpu, Flame, ShieldAlert, FileText, Clock, Palette, Sliders
} from 'lucide-react';
import { Chapter, NovelCharacter, StarSystem, Syscall, ExploitScript, Faction, ModuleId, UserCustomModule } from '../types';
import { useGenrePreset } from '../services/genrePresetService';
import { useModuleConfig, MODULE_ICON_MAP } from '../services/moduleConfigService';
import { useUserCustomModules } from '../services/userCustomModuleService';

interface NovelOverviewHubProps {
  onNavigateTab: (tabId: string) => void;
  onOpenExport: () => void;
  onOpenGenreThemes?: () => void;
  onOpenWorldbuildingCustomizer?: () => void;
  chapters: Chapter[];
  characters: NovelCharacter[];
  starSystems: StarSystem[];
  syscalls: Syscall[];
  exploits: ExploitScript[];
  inconsistenciesCount: number;
  anachronismsCount?: number;
}

export const NovelOverviewHub: React.FC<NovelOverviewHubProps> = ({
  onNavigateTab,
  onOpenExport,
  onOpenGenreThemes,
  onOpenWorldbuildingCustomizer,
  chapters,
  characters,
  starSystems,
  syscalls,
  exploits,
  inconsistenciesCount,
  anachronismsCount = 0
}) => {
  const { terms, currentGenre, isDefaultSciFi } = useGenrePreset();
  const { modules, sectionTitles } = useModuleConfig();
  const { customModules } = useUserCustomModules();
  const totalWords = chapters.reduce((acc, c) => acc + (c.content ? c.content.trim().split(/\s+/).filter(Boolean).length : 0), 0);
  const completedChapters = chapters.filter(c => c.status === 'CANON').length;

  const buildItem = (
    id: ModuleId,
    defaultColor: string,
    defaultBorder: string,
    defaultBg: string,
    defaultBadge: string
  ) => {
    const mod = modules[id];
    if (!mod || !mod.enabled) return null;
    const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;

    return {
      id: mod.id,
      title: mod.title,
      code: mod.code,
      icon: IconComp,
      color: defaultColor,
      border: defaultBorder,
      bg: defaultBg,
      description: mod.desc,
      badge: defaultBadge
    };
  };

  // Helper for custom user-created modules
  const buildCustomItem = (mod: UserCustomModule) => {
    if (!mod.enabled) return null;
    const IconComp = MODULE_ICON_MAP[mod.iconName] || Globe;
    return {
      id: mod.id,
      title: mod.title,
      code: mod.code,
      icon: IconComp,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      bg: 'bg-cyan-950/20',
      description: mod.desc,
      badge: `${mod.items.length} ${mod.items.length === 1 ? 'Entrada' : 'Entradas'}`
    };
  };

  const moduleGroups = [
    {
      category: sectionTitles.writing,
      items: [
        buildItem(
          'chapters',
          'text-cyan-400',
          'border-cyan-500/40 hover:border-cyan-400',
          'bg-cyan-950/15',
          `${chapters.length} Capítulos (${totalWords.toLocaleString()} palabras)`
        ),
        buildItem(
          'graph',
          'text-amber-400',
          'border-amber-500/40 hover:border-amber-400',
          'bg-amber-950/15',
          inconsistenciesCount > 0 ? `${inconsistenciesCount} Inconsistencias detectadas` : 'Coherencia verificada'
        ),
        buildItem(
          'timeline',
          'text-rose-400',
          'border-rose-500/40 hover:border-rose-400',
          'bg-rose-950/15',
          anachronismsCount > 0 ? `${anachronismsCount} Anacronismos detectados` : 'Cronología Sincronizada'
        ),
        ...customModules.filter(m => m.category === 'writing').map(buildCustomItem)
      ].filter(Boolean)
    },
    {
      category: sectionTitles.worldbuilding,
      items: [
        buildItem(
          'architecture',
          'text-blue-400',
          'border-blue-500/40 hover:border-blue-400',
          'bg-blue-950/15',
          isDefaultSciFi ? '4 Capas // 5 Axiomas' : 'Reglas del Mundo'
        ),
        buildItem(
          'atlas',
          'text-emerald-400',
          'border-emerald-500/40 hover:border-emerald-400',
          'bg-emerald-950/15',
          `${starSystems.length} ${terms.entityLocations}`
        ),
        buildItem(
          'factions',
          'text-purple-400',
          'border-purple-500/40 hover:border-purple-400',
          'bg-purple-950/15',
          `${characters.length} ${terms.entityCharacters}`
        ),
        buildItem(
          'lore',
          'text-slate-300',
          'border-slate-500/40 hover:border-slate-300',
          'bg-slate-900/30',
          isDefaultSciFi ? 'Generador Determinista' : 'Archivo & Reliquias'
        ),
        ...customModules.filter(m => m.category === 'worldbuilding').map(buildCustomItem)
      ].filter(Boolean)
    },
    {
      category: sectionTitles.auditor,
      items: [
        buildItem(
          'sandbox',
          'text-emerald-400',
          'border-emerald-500/40 hover:border-emerald-400',
          'bg-emerald-950/15',
          isDefaultSciFi ? `${syscalls.length} Syscalls • ${exploits.length} Exploits` : 'Simulador & Taller'
        ),
        buildItem(
          'auditor',
          'text-rose-400',
          'border-rose-500/40 hover:border-rose-400',
          'bg-rose-950/15',
          'Auditoría IA Asistida'
        ),
        ...customModules.filter(m => m.category === 'auditor').map(buildCustomItem)
      ].filter(Boolean)
    }
  ].filter(group => group.items.length > 0);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hero Welcome Banner */}
      <div className="bg-[#0e1118] border border-[#1e293b] rounded-sm p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-500 rotate-45" />
              <span className="text-cyan-400 uppercase tracking-widest text-[11px] font-bold">
                {terms.overviewTitle.toUpperCase()} // {currentGenre.badge}
              </span>
            </div>

            {onOpenGenreThemes && (
              <button
                onClick={onOpenGenreThemes}
                className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-600/40 flex items-center gap-1.5 text-[10px] transition-all cursor-pointer shadow-xs"
                title="Cambiar género o tema estético de la aplicación"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Género: <strong className="text-white">{currentGenre.shortName}</strong></span>
              </button>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            {terms.appName} <span className="text-slate-500 text-lg font-normal">// {currentGenre.shortName}</span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed font-sans sm:font-mono">
            {isDefaultSciFi 
              ? 'Suite integrada para la escritura y verificación de ciencia ficción dura. En este universo, la materia, la gravedad y la termodinámica son registros en un sustrato de cómputo a escala de Planck (10⁻³⁵ m), gobernado por licencias DRM sagradas y explotable mediante desensamblado de código.'
              : `${terms.appTagline}. ${currentGenre.description}`
            }
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-[#090b10] border border-[#1e293b] p-3 rounded-sm">
              <div className="text-[10px] text-slate-500 uppercase">Capítulos</div>
              <div className="text-lg font-bold text-white mt-0.5">{chapters.length}</div>
              <div className="text-[10px] text-cyan-400">{completedChapters} completados</div>
            </div>

            <div className="bg-[#090b10] border border-[#1e293b] p-3 rounded-sm">
              <div className="text-[10px] text-slate-500 uppercase">Palabras Totales</div>
              <div className="text-lg font-bold text-white mt-0.5">{totalWords.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">En manuscrito</div>
            </div>

            <div className="bg-[#090b10] border border-[#1e293b] p-3 rounded-sm">
              <div className="text-[10px] text-slate-500 uppercase">Entidades en Grafo</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{characters.length + starSystems.length + syscalls.length + exploits.length}</div>
              <div className="text-[10px] text-slate-400">Interconectadas</div>
            </div>

            <div className={`border p-3 rounded-sm ${
              inconsistenciesCount > 0 
                ? 'bg-rose-950/20 border-rose-600/70 text-rose-300' 
                : 'bg-emerald-950/20 border-emerald-700/70 text-emerald-300'
            }`}>
              <div className="text-[10px] uppercase opacity-70">Coherencia de Trama</div>
              <div className="text-lg font-bold mt-0.5 flex items-center gap-1.5">
                {inconsistenciesCount > 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{inconsistenciesCount} Alertas</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>100% Coherente</span>
                  </>
                )}
              </div>
              <div className="text-[10px] opacity-80">
                {inconsistenciesCount > 0 ? 'Revisar en Grafo' : 'Sin violaciones'}
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('chapters')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Abrir Editor de Capítulos</span>
            </button>

            <button
              onClick={() => onNavigateTab('graph')}
              className="px-4 py-2 bg-[#131622] hover:bg-[#1a1f30] text-amber-300 border border-amber-500/60 rounded-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Network className="w-4 h-4 text-amber-400" />
              <span>Explorar Grafo de Relaciones</span>
            </button>

            <button
              onClick={onOpenExport}
              className="px-4 py-2 bg-[#090b10] hover:bg-[#151722] text-slate-300 border border-[#1e293b] rounded-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Exportar Biblia</span>
            </button>

            {onOpenWorldbuildingCustomizer && (
              <button
                onClick={onOpenWorldbuildingCustomizer}
                className="px-4 py-2 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-600/50 hover:border-cyan-400 rounded-sm flex items-center gap-2 cursor-pointer transition-colors shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                title="Personalizar Nombres, Iconos y Visibilidad de los Módulos de WorldBuilding"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Personalizar Módulos de Mundo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Structured Modules Directory */}
      <div className="space-y-6">
        {moduleGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-slate-500 rotate-45" />
                <span>{group.category}</span>
              </div>
              {group.category === sectionTitles.worldbuilding && onOpenWorldbuildingCustomizer && (
                <button
                  onClick={onOpenWorldbuildingCustomizer}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                  title="Configurar los módulos de esta sección"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Editar nombres e iconos</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab(item.id)}
                    className={`bg-[#0d0f17] border ${item.border} rounded-sm p-4 space-y-3 transition-all cursor-pointer hover:scale-[1.01] shadow-sm flex flex-col justify-between`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-sm ${item.bg} flex items-center justify-center border border-white/10 shrink-0`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              MOD_{item.code}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#121520] border border-[#1e293b] text-slate-300 font-mono shrink-0">
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed font-sans sm:font-mono">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1e293b]/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        Acceso al módulo
                      </span>
                      <span className={`${item.color} flex items-center gap-1 font-bold`}>
                        <span>Entrar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
