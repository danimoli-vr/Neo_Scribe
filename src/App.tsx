import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NavigationPanel } from './components/NavigationPanel';
import { NovelOverviewHub } from './components/NovelOverviewHub';
import { SubstrateArchitectureView } from './components/SubstrateArchitectureView';
import { ExploitSandbox } from './components/ExploitSandbox';
import { FactionsAndArcheologyView } from './components/FactionsAndArcheologyView';
import { StarSystemsAtlasView } from './components/StarSystemsAtlasView';
import { CoherenceAuditorView } from './components/CoherenceAuditorView';
import { LoreGeneratorView } from './components/LoreGeneratorView';
import { ChapterEditorView } from './components/ChapterEditorView';
import { StoryRelationsGraphView } from './components/StoryRelationsGraphView';
import { TimelineView } from './components/TimelineView';
import { CharactersRosterView } from './components/CharactersRosterView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { CustomModuleView } from './components/CustomModuleView';
import { WorldbuildingExportModal } from './components/WorldbuildingExportModal';
import { AutosaveStatusBadge } from './components/AutosaveStatusBadge';
import { EditorMetricsStatusBarIndicator } from './components/EditorMetricsStatusBarIndicator';
import { StorageSyncModal } from './components/StorageSyncModal';
import { GenreThemesModal } from './components/GenreThemesModal';
import { WorldbuildingCustomizerModal } from './components/WorldbuildingCustomizerModal';
import { autosaveService } from './services/autosaveService';
import { syncAllToGoogleDrive, getAccessToken } from './services/googleDriveService';
import { LocalDirectoryService } from './services/localDirectoryService';
import { useGenrePreset } from './services/genrePresetService';
import { Cloud, HardDrive, Palette } from 'lucide-react';
import { 
  INITIAL_CHAPTERS, 
  CANONICAL_CHARACTERS, 
  CANONICAL_STAR_SYSTEMS, 
  CANONICAL_SYSCALLS, 
  CANONICAL_EXPLOITS, 
  CANONICAL_FACTIONS,
  INITIAL_LORE_ITEMS
} from './data/canonicalLore';
import { extractStoryGraph } from './utils/storyGraphExtractor';
import { buildUnifiedTimeline, auditTimelineAnachronisms } from './utils/anachronismDetector';
import { Chapter, NovelCharacter, StarSystem, Syscall, ExploitScript, Faction } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isStorageSyncOpen, setIsStorageSyncOpen] = useState<boolean>(false);
  const [isGenreThemesOpen, setIsGenreThemesOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isNavPanelOpen, setIsNavPanelOpen] = useState<boolean>(false);
  const [isNavPanelCollapsed, setIsNavPanelCollapsed] = useState<boolean>(false);
  const [auditorPrefillText, setAuditorPrefillText] = useState<string | undefined>(undefined);
  const [auditorPrefillTitle, setAuditorPrefillTitle] = useState<string | undefined>(undefined);
  const [targetChapterNumber, setTargetChapterNumber] = useState<number | null>(null);
  const [timelineRefreshKey, setTimelineRefreshKey] = useState<number>(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const { terms, currentGenre, currentTheme } = useGenrePreset();

  // Characters from localStorage or fallback
  const [characters, setCharacters] = useState<NovelCharacter[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_characters_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return CANONICAL_CHARACTERS;
  });

  // Re-sync characters on refresh key change
  useEffect(() => {
    try {
      const saved = localStorage.getItem('krnl_characters_v1');
      if (saved) setCharacters(JSON.parse(saved));
    } catch (e) {}
  }, [timelineRefreshKey]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Lore items from localStorage or fallback
  const allLoreItems = useMemo(() => {
    try {
      const saved = localStorage.getItem('krnl_lore_items_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LORE_ITEMS;
  }, [timelineRefreshKey]);

  // Custom events from localStorage
  const allCustomEvents = useMemo(() => {
    try {
      const saved = localStorage.getItem('krnl_timeline_custom_events_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }, [timelineRefreshKey]);

  // Re-read storage and handle optional background auto-syncs when autosave service commits changes
  useEffect(() => {
    const handleStorageSynced = async () => {
      setTimelineRefreshKey(k => k + 1);

      // Auto-sync to local folder if enabled
      if (localStorage.getItem('krnl_local_autosync_enabled') === 'true' && LocalDirectoryService.hasSelectedFolder()) {
        try {
          const chs = JSON.parse(localStorage.getItem('krnl_chapters_v1') || '[]');
          const chars = JSON.parse(localStorage.getItem('krnl_characters_v1') || '[]');
          const events = JSON.parse(localStorage.getItem('krnl_timeline_custom_events_v1') || '[]');
          const lores = JSON.parse(localStorage.getItem('krnl_lore_items_v1') || '[]');
          await LocalDirectoryService.syncToLocalDirectory(
            chs.length ? chs : INITIAL_CHAPTERS,
            chars.length ? chars : CANONICAL_CHARACTERS,
            events,
            lores.length ? lores : INITIAL_LORE_ITEMS
          );
        } catch (err) {
          console.warn('Auto local folder sync notice:', err);
        }
      }

      // Auto-sync to Google Drive if enabled
      if (localStorage.getItem('krnl_drive_autosync_enabled') === 'true') {
        const token = await getAccessToken();
        if (token) {
          try {
            const chs = JSON.parse(localStorage.getItem('krnl_chapters_v1') || '[]');
            const chars = JSON.parse(localStorage.getItem('krnl_characters_v1') || '[]');
            const events = JSON.parse(localStorage.getItem('krnl_timeline_custom_events_v1') || '[]');
            const lores = JSON.parse(localStorage.getItem('krnl_lore_items_v1') || '[]');
            await syncAllToGoogleDrive(
              chs.length ? chs : INITIAL_CHAPTERS,
              chars.length ? chars : CANONICAL_CHARACTERS,
              events,
              lores.length ? lores : INITIAL_LORE_ITEMS
            );
          } catch (err) {
            console.warn('Auto Google Drive sync notice:', err);
          }
        }
      }
    };

    const handleOpenStorageSyncEvent = () => setIsStorageSyncOpen(true);
    window.addEventListener('krnl_storage_synced', handleStorageSynced);
    window.addEventListener('krnl_open_storage_sync', handleOpenStorageSyncEvent);
    return () => {
      window.removeEventListener('krnl_storage_synced', handleStorageSynced);
      window.removeEventListener('krnl_open_storage_sync', handleOpenStorageSyncEvent);
    };
  }, []);

  // Load chapters from localStorage with fallback to canonical chapters
  const chapters: Chapter[] = useMemo(() => {
    const saved = localStorage.getItem('krnl_chapters_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading chapters in App', e);
      }
    }
    return INITIAL_CHAPTERS;
  }, [activeTab, timelineRefreshKey]);

  // Compute graph data & inconsistency count for badges
  const graphSummary = useMemo(() => {
    try {
      const g = extractStoryGraph(
        chapters,
        CANONICAL_CHARACTERS,
        CANONICAL_STAR_SYSTEMS,
        CANONICAL_SYSCALLS,
        CANONICAL_EXPLOITS,
        CANONICAL_FACTIONS
      );
      return {
        inconsistenciesCount: g.inconsistencies.length,
        nodesCount: g.nodes.length
      };
    } catch (e) {
      return { inconsistenciesCount: 0, nodesCount: 0 };
    }
  }, [chapters]);

  // Compute timeline anachronisms for badges and health
  const timelineSummary = useMemo(() => {
    try {
      const unified = buildUnifiedTimeline(chapters);
      const audit = auditTimelineAnachronisms(unified, CANONICAL_CHARACTERS, CANONICAL_STAR_SYSTEMS);
      return {
        anachronismsCount: audit.anachronisms.length,
        criticalCount: audit.criticalCount,
        coherenceScore: audit.causalCoherenceScore
      };
    } catch (e) {
      return { anachronismsCount: 0, criticalCount: 0, coherenceScore: 100 };
    }
  }, [chapters]);

  const handleSendToAuditor = (text: string, title: string) => {
    setAuditorPrefillText(text);
    setAuditorPrefillTitle(`Auditoría de Manuscrito: ${title}`);
    setActiveTab('auditor');
  };

  const handleOpenChapterInEditor = (chapterNumber: number) => {
    setTargetChapterNumber(chapterNumber);
    setActiveTab('chapters');
  };

  return (
    <div className={`min-h-screen app-theme-root text-[#d1d5db] flex flex-col lg:flex-row selection:bg-cyan-500/30 selection:text-cyan-200 ${currentTheme.cssClass}`}>
      {/* Sidebar Navigation Panel (Main Menu) */}
      <NavigationPanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isNavPanelOpen}
        onCloseMobile={() => setIsNavPanelOpen(false)}
        isCollapsed={isNavPanelCollapsed}
        onToggleCollapse={() => setIsNavPanelCollapsed(prev => !prev)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGenreThemes={() => setIsGenreThemesOpen(true)}
        onOpenWorldbuildingCustomizer={() => setIsCustomizerOpen(true)}
        inconsistenciesCount={graphSummary.inconsistenciesCount}
        anachronismsCount={timelineSummary.anachronismsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Streamlined Top Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenStorageSync={() => setIsStorageSyncOpen(true)}
          onOpenGenreThemes={() => setIsGenreThemesOpen(true)}
          onOpenWorldbuildingCustomizer={() => setIsCustomizerOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleNavigation={() => {
            // In mobile open drawer, in desktop toggle collapsed
            if (window.innerWidth < 1024) {
              setIsNavPanelOpen(true);
            } else {
              setIsNavPanelCollapsed(prev => !prev);
            }
          }}
          inconsistenciesCount={graphSummary.inconsistenciesCount}
          anachronismsCount={timelineSummary.anachronismsCount}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 w-full max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 py-5 min-w-0">
          <div className="relative">
            {activeTab === 'overview' && (
              <NovelOverviewHub
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenGenreThemes={() => setIsGenreThemesOpen(true)}
                onOpenWorldbuildingCustomizer={() => setIsCustomizerOpen(true)}
                chapters={chapters}
                characters={characters}
                starSystems={CANONICAL_STAR_SYSTEMS}
                syscalls={CANONICAL_SYSCALLS}
                exploits={CANONICAL_EXPLOITS}
                inconsistenciesCount={graphSummary.inconsistenciesCount}
                anachronismsCount={timelineSummary.anachronismsCount}
              />
            )}
            {activeTab === 'chapters' && (
              <ChapterEditorView 
                onSendToAuditor={handleSendToAuditor}
                onOpenGraph={() => setActiveTab('graph')}
                onOpenTimeline={() => setActiveTab('timeline')}
                initialChapterNumber={targetChapterNumber}
              />
            )}
            {activeTab === 'characters' && (
              <CharactersRosterView
                characters={characters}
                setCharacters={setCharacters}
                onOpenChapterEditor={() => setActiveTab('chapters')}
              />
            )}
            {activeTab === 'graph' && (
              <StoryRelationsGraphView 
                onOpenChapterInEditor={handleOpenChapterInEditor}
                onSendToAuditor={handleSendToAuditor}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineView 
                chapters={chapters}
                characters={characters}
                starSystems={CANONICAL_STAR_SYSTEMS}
                syscalls={CANONICAL_SYSCALLS}
                exploits={CANONICAL_EXPLOITS}
                onOpenChapterInEditor={handleOpenChapterInEditor}
                onOpenGraph={() => setActiveTab('graph')}
                onSendToAuditor={handleSendToAuditor}
                onUpdateChapter={(updated) => {
                  const updatedChapters = chapters.map(c => c.id === updated.id ? updated : c);
                  autosaveService.scheduleSave('krnl_chapters_v1', updatedChapters, true);
                  setTimelineRefreshKey(k => k + 1);
                }}
              />
            )}
            {activeTab === 'architecture' && <SubstrateArchitectureView />}
            {activeTab === 'sandbox' && <ExploitSandbox />}
            {activeTab === 'factions' && <FactionsAndArcheologyView />}
            {activeTab === 'atlas' && <StarSystemsAtlasView />}
            {activeTab === 'auditor' && (
              <CoherenceAuditorView
                initialSceneText={auditorPrefillText}
                initialSceneTitle={auditorPrefillTitle}
                chapters={chapters}
                characters={characters}
                loreItems={allLoreItems}
                customTimelineEvents={allCustomEvents}
              />
            )}
            {activeTab === 'lore' && <LoreGeneratorView />}
            {activeTab.startsWith('custom_') && (
              <CustomModuleView 
                moduleId={activeTab} 
                onBackToOverview={() => setActiveTab('overview')} 
              />
            )}
          </div>
        </main>

        {/* Technical Footer */}
        <footer className="border-t border-[#1e293b] bg-[#090b10] py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rotate-45" />
              <span className="font-bold text-white tracking-wider">{terms.appName}</span>
              <span className="text-slate-600">—</span>
              <span className="text-slate-400">{terms.appTagline}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 tracking-wider">
              <span className="text-emerald-400">[{currentGenre.badge}]</span>
              <span>•</span>
              <button
                onClick={() => setIsGenreThemesOpen(true)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Cambiar tema o género"
              >
                <Palette className="w-3 h-3" />
                <span>TEMA: {currentTheme.name.toUpperCase()}</span>
              </button>
              <span>•</span>
              <span className="text-cyan-400">{currentGenre.name.toUpperCase()}</span>
            </div>
          </div>
        </footer>

        {/* Telemetry Bottom Bar with Autosave Status */}
        <div className="sticky bottom-0 z-40 h-8 bg-[#07090e]/95 backdrop-blur-md border-t border-cyan-900/50 flex items-center justify-between px-3 sm:px-6 text-[9px] text-cyan-400 tracking-wider font-mono uppercase shadow-2xl">
          <div className="flex items-center gap-3 truncate">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold hidden sm:inline">ALMACENAMIENTO:</span>
              <AutosaveStatusBadge />
              <button
                onClick={() => setIsStorageSyncOpen(true)}
                className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Configuración de almacenamiento: Google Drive y Carpeta Local"
              >
                <Cloud className="w-2.5 h-2.5 text-cyan-400" />
                <span className="hidden md:inline">NUBE / DISCO</span>
              </button>

              <span className="text-slate-700">|</span>

              {/* Real-time word and character count indicator */}
              <EditorMetricsStatusBarIndicator onOpenEditor={() => setActiveTab('chapters')} />
            </div>
            <span className="hidden lg:inline text-slate-700">|</span>
            <div className="truncate text-slate-400 hidden xl:block">
              COORD: <span className="text-cyan-400">12-B</span> // SECTOR: <span className="text-white">TENEBRAE</span> // ACCESO: <span className="text-emerald-400">READ_WRITE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <span className="hidden sm:inline text-slate-400">
              ATAJO: <kbd className="px-1 py-0.5 bg-black/60 border border-slate-700 rounded text-[8px] text-cyan-300 font-bold">Ctrl+S</kbd> FORZAR GUARDADO
            </span>
            <span className="hidden lg:inline text-slate-700">|</span>
            <span className="text-slate-500 hidden lg:inline">
              ENCRYPTION: <span className="text-cyan-400">RSA_4096</span>
            </span>
          </div>
        </div>
      </div>

      {/* Export Bible Modal */}
      <WorldbuildingExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Storage & Cloud Sync Modal */}
      <StorageSyncModal
        isOpen={isStorageSyncOpen}
        onClose={() => setIsStorageSyncOpen(false)}
        chapters={chapters}
        characters={characters}
        customTimelineEvents={allCustomEvents}
        loreItems={allLoreItems}
      />

      {/* Genre & Visual Themes Selector Modal */}
      <GenreThemesModal
        isOpen={isGenreThemesOpen}
        onClose={() => setIsGenreThemesOpen(false)}
        onOpenWorldbuildingCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* 100% Worldbuilding & Menu Modules Customizer Modal */}
      <WorldbuildingCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onNavigateToModule={(modId) => setActiveTab(modId)}
      />

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        chapters={chapters}
        characters={characters}
        onSelectChapter={(chapNum) => {
          setTargetChapterNumber(chapNum);
          setActiveTab('chapters');
        }}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGenreThemes={() => setIsGenreThemesOpen(true)}
        onOpenStorageSync={() => setIsStorageSyncOpen(true)}
        onOpenAuditor={() => setActiveTab('auditor')}
        onCreateNewChapter={() => {
          setActiveTab('chapters');
        }}
      />
    </div>
  );
}
