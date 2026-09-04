import React from 'react';
import { User } from 'firebase/auth';
import { 
  Cloud, 
  RefreshCw, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { DriveFileInfo } from '../services/googleDriveService';

interface SyncDriveTabProps {
  driveUser: User | null;
  isDriveAuthLoading: boolean;
  isDriveSyncing: boolean;
  driveSyncSuccess: boolean;
  driveSyncFiles: DriveFileInfo[];
  driveFolderLink: string | null;
  driveError: string | null;
  driveAutoSync: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSyncToDrive: () => void;
  onToggleDriveAutoSync: (enabled: boolean) => void;
}

export const SyncDriveTab: React.FC<SyncDriveTabProps> = ({
  driveUser,
  isDriveAuthLoading,
  isDriveSyncing,
  driveSyncSuccess,
  driveSyncFiles,
  driveFolderLink,
  driveError,
  driveAutoSync,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncToDrive,
  onToggleDriveAutoSync
}) => {
  return (
    <div className="space-y-6">
      {!driveUser ? (
        <div className="p-8 rounded-xl bg-[#0e1422] border border-cyan-900/60 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Cloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Conectar con Google Drive</h3>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            Inicia sesión para que la aplicación cree automáticamente una carpeta dedicada en tu Drive y resguarde tus manuscritos y la biblia canónica de la novela.
          </p>

          <button
            type="button"
            onClick={onGoogleSignIn}
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
              onClick={onGoogleSignOut}
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
                onClick={onSyncToDrive}
                disabled={isDriveSyncing}
                className="w-full py-2 px-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
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
                  onChange={(e) => onToggleDriveAutoSync(e.target.checked)}
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
  );
};
