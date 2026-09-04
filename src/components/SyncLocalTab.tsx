import React from 'react';
import { 
  HardDrive, 
  FolderCheck, 
  FolderOpen, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Download 
} from 'lucide-react';

interface SyncLocalTabProps {
  localFolderName: string | null;
  isLocalSyncing: boolean;
  localFilesSaved: string[];
  localError: string | null;
  localAutoSync: boolean;
  onPickLocalFolder: () => void;
  onSyncToLocalFolder: () => void;
  onToggleLocalAutoSync: (enabled: boolean) => void;
  onDownloadDirectBundle: () => void;
}

export const SyncLocalTab: React.FC<SyncLocalTabProps> = ({
  localFolderName,
  isLocalSyncing,
  localFilesSaved,
  localError,
  localAutoSync,
  onPickLocalFolder,
  onSyncToLocalFolder,
  onToggleLocalAutoSync,
  onDownloadDirectBundle
}) => {
  return (
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
            onClick={onPickLocalFolder}
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
              onClick={onSyncToLocalFolder}
              disabled={isLocalSyncing}
              className="py-2.5 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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
                onChange={(e) => onToggleLocalAutoSync(e.target.checked)}
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
          onClick={onDownloadDirectBundle}
          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar</span>
        </button>
      </div>
    </div>
  );
};
