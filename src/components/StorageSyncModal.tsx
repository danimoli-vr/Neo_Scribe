import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  HardDrive, 
  Database, 
  ShieldCheck, 
  Monitor
} from 'lucide-react';
import { 
  initDriveAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  syncAllToGoogleDrive, 
  DriveFileInfo 
} from '../services/googleDriveService';
import { LocalDirectoryService } from '../services/localDirectoryService';
import { Chapter, NovelCharacter, TimelineEvent, LoreItem } from '../types';
import { User } from 'firebase/auth';
import { detectEnvironment, setSimulatedEnvironment, DesktopBridgeInfo } from '../utils/environment';
import { useNovelData } from '../store/NovelDataContext';
import { useGenrePreset } from '../services/genrePresetService';
import { SyncOverviewTab } from './SyncOverviewTab';
import { SyncDriveTab } from './SyncDriveTab';
import { SyncLocalTab } from './SyncLocalTab';
import { SyncBrowserTab } from './SyncBrowserTab';

interface StorageSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  characters: NovelCharacter[];
  customTimelineEvents?: TimelineEvent[];
  loreItems?: LoreItem[];
}

export const StorageSyncModal: React.FC<StorageSyncModalProps> = ({
  isOpen,
  onClose,
  chapters,
  characters,
  customTimelineEvents = [],
  loreItems = []
}) => {
  // Author's chosen title for their bible/manuscript (falls back to the
  // active preset's name — never a hardcoded universe name — when unset).
  const { novelTitle } = useNovelData();
  const { terms } = useGenrePreset();
  const effectiveNovelTitle = novelTitle.trim() || terms.appName;

  // Active sub-tab in modal
  const [activeTab, setActiveTab] = useState<'overview' | 'drive' | 'local' | 'browser'>('overview');

  // Environment state (Desktop vs Web)
  const [envInfo, setEnvInfo] = useState<DesktopBridgeInfo>(() => detectEnvironment());

  useEffect(() => {
    const handleEnvChange = () => {
      const current = detectEnvironment();
      setEnvInfo(current);
      if (current.isDesktop && activeTab === 'browser') {
        setActiveTab('local');
      }
    };
    window.addEventListener('krnl_environment_changed', handleEnvChange);
    return () => window.removeEventListener('krnl_environment_changed', handleEnvChange);
  }, [activeTab]);

  // Google Drive state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isDriveAuthLoading, setIsDriveAuthLoading] = useState<boolean>(true);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [driveSyncSuccess, setDriveSyncSuccess] = useState<boolean>(false);
  const [driveSyncFiles, setDriveSyncFiles] = useState<DriveFileInfo[]>([]);
  const [driveFolderLink, setDriveFolderLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveAutoSync, setDriveAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('krnl_drive_autosync_enabled') === 'true';
  });

  // Local Directory state
  const [localFolderName, setLocalFolderName] = useState<string | null>(null);
  const [isLocalSyncing, setIsLocalSyncing] = useState<boolean>(false);
  const [localFilesSaved, setLocalFilesSaved] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localAutoSync, setLocalAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('krnl_local_autosync_enabled') === 'true';
  });

  // Browser storage stats
  const [storageUsage, setStorageUsage] = useState<string>('Calculando...');

  useEffect(() => {
    if (!isOpen) return;

    // Check Local Directory Support
    setLocalFolderName(LocalDirectoryService.getFolderName());

    // Calculate approximate localStorage size
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('krnl_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approximate
        }
      }
      setStorageUsage(`${(totalBytes / 1024).toFixed(1)} KB`);
    } catch {
      setStorageUsage('~45 KB');
    }

    // Init Drive Auth Listener
    setIsDriveAuthLoading(true);
    const unsubscribe = initDriveAuth(
      (user) => {
        setDriveUser(user);
        setIsDriveAuthLoading(false);
      },
      () => {
        setDriveUser(null);
        setIsDriveAuthLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsDriveAuthLoading(true);
      setDriveError(null);
      const res = await signInWithGoogle();
      if (res?.user) {
        setDriveUser(res.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setDriveError(err?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsDriveAuthLoading(false);
    }
  };

  // Handle Google Sign-out
  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setDriveUser(null);
    setDriveSyncSuccess(false);
    setDriveSyncFiles([]);
  };

  // Handle Sync to Google Drive
  const handleSyncToDrive = async () => {
    setIsDriveSyncing(true);
    setDriveError(null);
    try {
      const result = await syncAllToGoogleDrive(chapters, characters, customTimelineEvents, loreItems, effectiveNovelTitle);
      if (result.success) {
        setDriveSyncSuccess(true);
        setDriveSyncFiles(result.files);
        if (result.folderLink) setDriveFolderLink(result.folderLink);
      } else {
        setDriveError(result.error || 'Error al sincronizar con Google Drive');
      }
    } catch (err: any) {
      setDriveError(err?.message || 'Fallo inesperado al conectar con Drive');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // Toggle Drive Auto-Sync
  const toggleDriveAutoSync = (enabled: boolean) => {
    setDriveAutoSync(enabled);
    localStorage.setItem('krnl_drive_autosync_enabled', enabled ? 'true' : 'false');
  };

  // Pick Local Folder on Device
  const handlePickLocalFolder = async () => {
    setLocalError(null);
    const res = await LocalDirectoryService.pickDirectory();
    if (res.success && res.folderName) {
      setLocalFolderName(res.folderName);
    } else if (res.error) {
      setLocalError(res.error);
    }
  };

  // Sync to Local Directory
  const handleSyncToLocalFolder = async () => {
    setIsLocalSyncing(true);
    setLocalError(null);
    try {
      const res = await LocalDirectoryService.syncToLocalDirectory(chapters, characters, customTimelineEvents, loreItems, effectiveNovelTitle);
      if (res.success) {
        setLocalFilesSaved(res.filesSaved);
      } else {
        setLocalError(res.error || 'Error escribiendo en la carpeta local');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Fallo de acceso al sistema de archivos');
    } finally {
      setIsLocalSyncing(false);
    }
  };

  // Toggle Local Auto-Sync
  const toggleLocalAutoSync = (enabled: boolean) => {
    setLocalAutoSync(enabled);
    localStorage.setItem('krnl_local_autosync_enabled', enabled ? 'true' : 'false');
  };

  // Direct Download JSON
  const handleDownloadDirectBundle = () => {
    LocalDirectoryService.exportDirectJsonBundle(chapters, characters, customTimelineEvents, loreItems, effectiveNovelTitle);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#0b0f17] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] overflow-hidden text-slate-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/80 bg-gradient-to-r from-[#0d1524] to-[#070a10]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
              envInfo.isDesktop 
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-400' 
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
            }`}>
              {envInfo.isDesktop ? <HardDrive className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-mono flex items-center gap-2">
                <span>CONFIGURACIÓN DE ALMACENAMIENTO & NUBE</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1.5 ${
                  envInfo.isDesktop 
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50' 
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {envInfo.isDesktop ? (
                    <>
                      <Monitor className="w-3 h-3 text-amber-400" />
                      <span>ESCRITORIO NATIVO ({envInfo.platform.toUpperCase()})</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>ENTORNO WEB (MULTICAPA)</span>
                    </>
                  )}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {envInfo.isDesktop 
                  ? 'Modo aplicación de escritorio: tus archivos se guardan directamente en tu disco local.'
                  : 'Elige dónde se resguardan tus manuscritos, personajes y biblia de worldbuilding.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center border-b border-slate-800/80 bg-[#080b12] px-6 gap-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Resumen General</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'local'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>{envInfo.isDesktop ? 'Bóveda Local (Tu Disco)' : 'Carpeta Local (Tu Disco)'}</span>
            {localFolderName && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Carpeta activa" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'drive'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Google Drive</span>
            {driveUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Conectado" />
            )}
          </button>

          {/* Web storage tab ONLY shown in browser environment */}
          {!envInfo.isDesktop && (
            <button
              onClick={() => setActiveTab('browser')}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === 'browser'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Almacenamiento Web (Navegador)</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <SyncOverviewTab
              envInfo={envInfo}
              chapters={chapters}
              characters={characters}
              storageUsage={storageUsage}
              localFolderName={localFolderName}
              localAutoSync={localAutoSync}
              driveUser={driveUser}
              driveAutoSync={driveAutoSync}
              onSelectTab={setActiveTab}
              onDownloadDirectBundle={handleDownloadDirectBundle}
            />
          )}

          {activeTab === 'drive' && (
            <SyncDriveTab
              driveUser={driveUser}
              isDriveAuthLoading={isDriveAuthLoading}
              isDriveSyncing={isDriveSyncing}
              driveSyncSuccess={driveSyncSuccess}
              driveSyncFiles={driveSyncFiles}
              driveFolderLink={driveFolderLink}
              driveError={driveError}
              driveAutoSync={driveAutoSync}
              onGoogleSignIn={handleGoogleSignIn}
              onGoogleSignOut={handleGoogleSignOut}
              onSyncToDrive={handleSyncToDrive}
              onToggleDriveAutoSync={toggleDriveAutoSync}
            />
          )}

          {activeTab === 'local' && (
            <SyncLocalTab
              localFolderName={localFolderName}
              isLocalSyncing={isLocalSyncing}
              localFilesSaved={localFilesSaved}
              localError={localError}
              localAutoSync={localAutoSync}
              onPickLocalFolder={handlePickLocalFolder}
              onSyncToLocalFolder={handleSyncToLocalFolder}
              onToggleLocalAutoSync={toggleLocalAutoSync}
              onDownloadDirectBundle={handleDownloadDirectBundle}
            />
          )}

          {activeTab === 'browser' && (
            <SyncBrowserTab
              chapters={chapters}
              characters={characters}
              customTimelineEvents={customTimelineEvents}
              loreItems={loreItems}
              storageUsage={storageUsage}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-[#07090e] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                envInfo.isDesktop ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span>
                {envInfo.isDesktop 
                  ? `KRNL_DESKTOP_RUNTIME // ${envInfo.platform.toUpperCase()} NATIVE FS` 
                  : 'KRNL_STORAGE_SUBSYSTEM // WEB MULTI-TIER'}
              </span>
            </div>

            {/* Environment Toggle Simulator for testing desktop behavior */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800 text-[10px]">
              <span className="text-slate-500 hidden sm:inline">Modo:</span>
              <select
                value={localStorage.getItem('krnl_environment_mode') || 'auto'}
                onChange={(e) => {
                  setSimulatedEnvironment(e.target.value as any);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-1.5 py-0.5 font-mono cursor-pointer hover:border-cyan-500 transition-colors"
                title="Simula la vista de escritorio para comprobar cómo la app se desentiende del almacenamiento web"
              >
                <option value="auto">Auto ({envInfo.isDesktop ? 'Escritorio' : 'Web'})</option>
                <option value="desktop">Forzar Escritorio (Oculta Web)</option>
                <option value="web">Forzar Web (Muestra localStorage)</option>
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
