import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  HardDrive, 
  Database, 
  FolderCheck, 
  FolderOpen, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  LogOut, 
  Download, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles,
  Info,
  Monitor
} from 'lucide-react';
import { 
  initDriveAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  getAccessToken, 
  syncAllToGoogleDrive, 
  DriveFileInfo 
} from '../services/googleDriveService';
import { LocalDirectoryService } from '../services/localDirectoryService';
import { Chapter, NovelCharacter, TimelineEvent, LoreItem } from '../types';
import { User } from 'firebase/auth';
import { detectEnvironment, setSimulatedEnvironment, DesktopBridgeInfo } from '../utils/environment';

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
  const [localSupported, setLocalSupported] = useState<boolean>(true);
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
    setLocalSupported(LocalDirectoryService.isSupported());
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
      (user, token) => {
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
      const result = await syncAllToGoogleDrive(chapters, characters, customTimelineEvents, loreItems);
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
      const res = await LocalDirectoryService.syncToLocalDirectory(chapters, characters, customTimelineEvents, loreItems);
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
    LocalDirectoryService.exportDirectJsonBundle(chapters, characters, customTimelineEvents, loreItems);
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
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {envInfo.isDesktop ? (
                /* Desktop Native Notice */
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-4 text-xs leading-relaxed text-slate-300 flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-amber-300 font-semibold font-mono uppercase tracking-wider">
                        Modo App de Escritorio Nativa
                      </strong>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-500/40 font-mono">
                        {envInfo.platform.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-300">
                      En esta versión de escritorio la novela opera directamente sobre los archivos físicos de tu disco local (como Obsidian o Scrivener). El almacenamiento de navegador web ha sido retirado automáticamente por redundancia. Puedes vincular una carpeta como tu <strong>bóveda de trabajo</strong> y activar Google Drive si deseas copias de seguridad en la nube.
                    </p>
                  </div>
                </div>
              ) : (
                /* Web Triple Redundancy Notice */
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-xs leading-relaxed text-slate-300 flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Estrategia de triple redundancia:</strong>
                    <p className="mt-1">
                      Puedes combinar los tres métodos de guardado para máxima seguridad. El navegador guarda tus cambios automáticamente cada 3 segundos en segundo plano, tu carpeta local genera archivos Markdown legibles en tu ordenador, y Google Drive mantiene una copia de seguridad en la nube accesible desde cualquier lugar.
                    </p>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              <div className={`grid grid-cols-1 gap-4 ${envInfo.isDesktop ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                
                {/* 1. Navegador (ONLY in browser mode) */}
                {!envInfo.isDesktop && (
                  <div className="bg-[#0e1422] border border-emerald-500/30 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                          <Database className="w-4 h-4" />
                          <span>NAVEGADOR</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          ACTIVO
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Persistencia en caché interna (`localStorage`). No requiere inicio de sesión.
                      </p>
                      <div className="font-mono text-[11px] text-slate-300 space-y-1">
                        <div>Capítulos: <span className="text-white font-bold">{chapters.length}</span></div>
                        <div>Personajes: <span className="text-white font-bold">{characters.length}</span></div>
                        <div>Uso aprox: <span className="text-emerald-400">{storageUsage}</span></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('browser')}
                      className="mt-4 w-full py-1.5 px-3 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                )}

                {/* 2. Carpeta Local / Bóveda Nativa */}
                <div className={`bg-[#0e1422] rounded-lg p-4 flex flex-col justify-between ${
                  envInfo.isDesktop 
                    ? 'border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                    : 'border border-amber-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                        <HardDrive className="w-4 h-4" />
                        <span>{envInfo.isDesktop ? 'TU DISCO LOCAL (BÓVEDA NATIVA)' : 'TU DISCO LOCAL'}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        localFolderName 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {localFolderName ? 'VINCULADA' : 'NO VINCULADA'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      {envInfo.isDesktop
                        ? 'Almacenamiento nativo primario. Escribe y actualiza directamente carpetas y archivos .md en tu disco.'
                        : 'Guarda archivos `.md` y `.json` directamente en una carpeta de tu ordenador.'}
                    </p>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>Carpeta: <span className="text-amber-300 truncate block font-bold">{localFolderName || 'Ninguna seleccionada'}</span></div>
                      <div>Formato: <span className="text-slate-400">Markdown (.md) + JSON</span></div>
                      <div>Auto-sync: <span className={localAutoSync ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{localAutoSync ? 'Activado' : 'Desactivado'}</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('local')}
                    className="mt-4 w-full py-1.5 px-3 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono transition-colors"
                  >
                    {localFolderName ? 'Administrar carpeta' : 'Vincular carpeta'}
                  </button>
                </div>

                {/* 3. Google Drive */}
                <div className="bg-[#0e1422] border border-cyan-500/30 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                        <Cloud className="w-4 h-4" />
                        <span>{envInfo.isDesktop ? 'GOOGLE DRIVE (RESPALDO NUBE)' : 'GOOGLE DRIVE'}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        driveUser 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {driveUser ? 'CONECTADO' : 'DESCONECTADO'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      {envInfo.isDesktop
                        ? 'Copia de seguridad remota opcional para consultar o sincronizar entre distintos equipos.'
                        : 'Respalda y sincroniza con tu cuenta en la nube de Google Drive.'}
                    </p>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>Cuenta: <span className="text-cyan-300 truncate block font-bold">{driveUser ? driveUser.email : 'Sin iniciar'}</span></div>
                      <div>Auto-sync: <span className={driveAutoSync ? 'text-emerald-400' : 'text-slate-500'}>{driveAutoSync ? 'Activado' : 'Desactivado'}</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('drive')}
                    className="mt-4 w-full py-1.5 px-3 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
                  >
                    {driveUser ? 'Panel de Drive' : 'Conectar Drive'}
                  </button>
                </div>
              </div>

              {/* Action row */}
              <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-900/40 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white font-mono">¿Quieres una copia física descargable ahora?</span>
                  <p className="text-slate-400">Descarga un paquete JSON completo con todos los capítulos, personajes y líneas temporales.</p>
                </div>
                <button
                  onClick={handleDownloadDirectBundle}
                  className="py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              {!driveUser ? (
                <div className="bg-[#0e1422] border border-cyan-900/60 rounded-xl p-8 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">Conectar con Google Drive</h3>
                  <p className="text-xs text-slate-400 mt-2 mb-6">
                    Inicia sesión para que la aplicación cree automáticamente una carpeta dedicada en tu Drive y resguarde tus manuscritos y la biblia canónica de la novela.
                  </p>

                  {/* Google Sign-in standard button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isDriveAuthLoading}
                    className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isDriveAuthLoading ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
                  </button>

                  {driveError && (
                    <div className="mt-4 p-3 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs text-left flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{driveError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Connected Profile Bar */}
                  <div className="p-4 rounded-lg bg-[#0e1422] border border-cyan-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {driveUser.photoURL ? (
                        <img 
                          src={driveUser.photoURL} 
                          alt={driveUser.displayName || 'Usuario'} 
                          className="w-10 h-10 rounded-full border border-cyan-500/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-900/60 border border-cyan-500 flex items-center justify-center font-bold text-cyan-300">
                          {driveUser.email ? driveUser.email[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{driveUser.displayName || 'Usuario de Google'}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                            AUTORIZADO
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{driveUser.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleGoogleSignOut}
                      className="py-1.5 px-3 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>

                  {/* Sync Action & Automation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0e1422] border border-slate-800 space-y-3">
                      <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                        <span>Sincronización Manual</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Sube y actualiza en tu Drive el manuscrito completo en Markdown y la base de datos de worldbuilding.
                      </p>
                      <button
                        onClick={handleSyncToDrive}
                        disabled={isDriveSyncing}
                        className="w-full py-2 px-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                      >
                        {isDriveSyncing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>SINCRONIZANDO CON DRIVE...</span>
                          </>
                        ) : (
                          <>
                            <Cloud className="w-4 h-4" />
                            <span>SINCRONIZAR A GOOGLE DRIVE AHORA</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0e1422] border border-slate-800 space-y-3">
                      <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Respaldo Automático a Drive</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cada vez que se complete un ciclo de autoguardado (tras 3s de inactividad de teclado), se enviará un respaldo a Drive.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={driveAutoSync}
                          onChange={(e) => toggleDriveAutoSync(e.target.checked)}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                        />
                        <span className="text-xs text-slate-200 font-mono">
                          {driveAutoSync ? 'Auto-sincronización activada' : 'Auto-sincronización desactivada'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Sync Feedback */}
                  {driveSyncSuccess && (
                    <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Sincronización con Google Drive exitosa!</span>
                        </div>
                        {driveFolderLink && (
                          <a
                            href={driveFolderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
                          >
                            <span>Abrir carpeta en Google Drive</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {driveSyncFiles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {driveSyncFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 rounded bg-black/40 border border-emerald-900/50 text-[11px] font-mono">
                              <span className="text-slate-300 truncate">{file.name}</span>
                              {file.webViewLink ? (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                                  title="Ver en Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {driveError && (
                    <div className="p-3 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{driveError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCAL DIRECTORY (DEVICE DISK) */}
          {activeTab === 'local' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-[#0e1422] border border-amber-500/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                        <span>SISTEMA DE ARCHIVOS LOCAL (TU EQUIPO)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                          FILE SYSTEM ACCESS API
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Escribe carpetas y archivos Markdown reales en tu ordenador (como Obsidian o Scrivener).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="p-3 rounded bg-black/50 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Carpeta vinculada:</span>
                    {localFolderName ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <FolderCheck className="w-4 h-4" />
                        {localFolderName}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Ninguna carpeta elegida</span>
                    )}
                  </div>

                  <button
                    onClick={handlePickLocalFolder}
                    className="py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{localFolderName ? 'Cambiar carpeta' : 'Seleccionar carpeta local'}</span>
                  </button>
                </div>

                {/* Controls if folder is chosen */}
                {localFolderName && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleSyncToLocalFolder}
                      disabled={isLocalSyncing}
                      className="py-2.5 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLocalSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>ESCRIBIENDO EN DISCO...</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-4 h-4" />
                          <span>GUARDAR EN TU CARPETA AHORA</span>
                        </>
                      )}
                    </button>

                    <label className="flex items-center gap-2 px-3 py-2 rounded bg-black/40 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localAutoSync}
                        onChange={(e) => toggleLocalAutoSync(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-mono">
                        Auto-escribir en disco al autoguardar (3s)
                      </span>
                    </label>
                  </div>
                )}

                {/* Files saved feedback */}
                {localFilesSaved.length > 0 && (
                  <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                    <div className="text-emerald-300 font-bold font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{localFilesSaved.length} archivos guardados correctamente en tu disco:</span>
                    </div>
                    <ul className="text-[11px] font-mono text-slate-300 list-disc list-inside space-y-0.5">
                      {localFilesSaved.slice(0, 5).map((f) => (
                        <li key={f} className="truncate">{f}</li>
                      ))}
                      {localFilesSaved.length > 5 && (
                        <li className="text-slate-500">...y {localFilesSaved.length - 5} archivos más en /capitulos/</li>
                      )}
                    </ul>
                  </div>
                )}

                {localError && (
                  <div className="p-3 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p>{localError}</p>
                      <p className="mt-1 text-slate-400">
                        * Nota: Algunos navegadores o entornos embebidos requieren que abras la aplicación en una pestaña independiente para conceder acceso a directorios locales.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative direct download */}
              <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white font-mono">Opción alternativa sin permisos de disco:</span>
                  <p className="text-slate-400">Descarga directa manual en formato JSON estructurado.</p>
                </div>
                <button
                  onClick={handleDownloadDirectBundle}
                  className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BROWSER STORAGE */}
          {activeTab === 'browser' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0e1422] border border-emerald-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>ALMACENAMIENTO INTERNO (LOCALSTORAGE)</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    {storageUsage} usado
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este es el motor de autoguardado predeterminado de la aplicación. Guarda automáticamente cada cambio 3 segundos después de que dejas de teclear. Es ultrarrápido, funciona sin conexión a internet y se mantiene guardado al cerrar o recargar la pestaña.
                </p>

                <div className="border-t border-slate-800 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">CAPÍTULOS</div>
                    <div className="text-white font-bold text-sm">{chapters.length}</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">PERSONAJES</div>
                    <div className="text-white font-bold text-sm">{characters.length}</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EVENTOS TIMELINE</div>
                    <div className="text-white font-bold text-sm">{customTimelineEvents.length}</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">ENTRADAS LORE</div>
                    <div className="text-white font-bold text-sm">{loreItems.length}</div>
                  </div>
                </div>
              </div>
            </div>
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
