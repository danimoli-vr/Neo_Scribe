import React from 'react';
import { User } from 'firebase/auth';
import { 
  Monitor, 
  Info, 
  Database, 
  HardDrive, 
  Cloud, 
  Download 
} from 'lucide-react';
import { Chapter, NovelCharacter } from '../types';
import { DesktopBridgeInfo } from '../utils/environment';

interface SyncOverviewTabProps {
  envInfo: DesktopBridgeInfo;
  chapters: Chapter[];
  characters: NovelCharacter[];
  storageUsage: string;
  localFolderName: string | null;
  localAutoSync: boolean;
  driveUser: User | null;
  driveAutoSync: boolean;
  onSelectTab: (tab: 'overview' | 'drive' | 'local' | 'browser') => void;
  onDownloadDirectBundle: () => void;
}

export const SyncOverviewTab: React.FC<SyncOverviewTabProps> = ({
  envInfo,
  chapters,
  characters,
  storageUsage,
  localFolderName,
  localAutoSync,
  driveUser,
  driveAutoSync,
  onSelectTab,
  onDownloadDirectBundle
}) => {
  return (
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
              onClick={() => onSelectTab('browser')}
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
            onClick={() => onSelectTab('local')}
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
            onClick={() => onSelectTab('drive')}
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
          onClick={onDownloadDirectBundle}
          className="py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Archivo JSON</span>
        </button>
      </div>
    </div>
  );
};
