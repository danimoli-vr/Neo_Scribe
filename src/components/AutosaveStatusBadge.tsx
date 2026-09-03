import React, { useState } from 'react';
import { useAutosave } from '../hooks/useAutosave';
import { Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface AutosaveStatusBadgeProps {
  minimal?: boolean;
}

export const AutosaveStatusBadge: React.FC<AutosaveStatusBadgeProps> = ({ minimal = false }) => {
  const { status, lastSaved, error, flushImmediate } = useAutosave();
  const [justClicked, setJustClicked] = useState<boolean>(false);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    flushImmediate();
    setJustClicked(true);
    setTimeout(() => setJustClicked(false), 1500);
  };

  if (minimal) {
    if (status === 'saving') {
      return (
        <span 
          onClick={handleClick}
          title="Guardando cambios en localStorage..."
          className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 cursor-pointer"
        >
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>GUARDANDO</span>
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span 
          onClick={handleClick}
          title="Guardando tras 3s de inactividad de teclado. Clic para guardar ya."
          className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40 cursor-pointer animate-pulse"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>PENDIENTE (3s)</span>
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span 
          onClick={handleClick}
          title={`Error de guardado: ${error || 'Fallo de storage'}. Clic para reintentar.`}
          className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/40 cursor-pointer"
        >
          <AlertCircle className="w-2.5 h-2.5" />
          <span>ERR_STORAGE</span>
        </span>
      );
    }
    return (
      <span 
        onClick={handleClick}
        title={`Guardado en localStorage a las ${formatTime(lastSaved)}. Clic o Ctrl+S para forzar sincronización.`}
        className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors hover:bg-emerald-900/60"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>SYNCED</span>
        <span className="text-[8px] text-emerald-400/70 font-normal">({formatTime(lastSaved)})</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Servicio de autoguardado en localStorage (3s debounce tras escribir o Ctrl+S). Haz clic para forzar guardado."
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer select-none ${
        status === 'saving'
          ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          : status === 'pending'
          ? 'bg-amber-950/80 border border-amber-500/70 text-amber-300 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          : status === 'error'
          ? 'bg-rose-950/80 border border-rose-500 text-rose-300'
          : 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400'
      }`}
    >
      {status === 'saving' && (
        <>
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-300" />
          <span className="font-bold">GUARDANDO...</span>
        </>
      )}

      {status === 'pending' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold">MODIFICADO</span>
          <span className="text-amber-400/80 text-[8px]">[AUTO 3s]</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
          <span className="font-bold text-rose-300">ERROR_STORAGE</span>
        </>
      )}

      {status === 'synced' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
          <span className="font-bold tracking-widest text-emerald-300">SYNCED</span>
          <span className="text-emerald-400/70 text-[8px] font-normal">
            {justClicked ? '¡GUARDADO!' : formatTime(lastSaved)}
          </span>
        </>
      )}
    </button>
  );
};
