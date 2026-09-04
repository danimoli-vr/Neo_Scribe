import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { STORAGE_CORRUPTION_EVENT, StorageCorruptionDetail, getCorruptionLog } from '../utils/safeStorage';

const KEY_LABELS: Record<string, string> = {
  krnl_chapters_v1: 'los capítulos del manuscrito',
  krnl_characters_v1: 'el reparto de personajes',
  krnl_lore_items_v1: 'los elementos de lore',
  krnl_timeline_custom_events_v1: 'los eventos personalizados de la línea temporal',
};

/**
 * Surfaces a visible, dismissible warning whenever `safeStorage.readJSON`
 * detects that a localStorage entry was corrupted and had to fall back to
 * default data. Without this, that fallback happens silently and the user
 * has no way to know their real data is still sitting in a backup key
 * instead of quietly assuming it was lost forever.
 */
export const StorageCorruptionBanner: React.FC = () => {
  // Seed with anything detected before this component had a chance to mount
  // (e.g. corruption found while parsing state during the very first render).
  const [incidents, setIncidents] = useState<StorageCorruptionDetail[]>(() => getCorruptionLog());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<StorageCorruptionDetail>).detail;
      if (!detail) return;
      setIncidents((prev) => (prev.some((i) => i.key === detail.key) ? prev : [...prev, detail]));
    };
    window.addEventListener(STORAGE_CORRUPTION_EVENT, handler);
    return () => window.removeEventListener(STORAGE_CORRUPTION_EVENT, handler);
  }, []);

  if (incidents.length === 0) return null;

  return (
    <div className="bg-amber-950/90 border-b border-amber-600/50 text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-mono flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
      <div className="flex-1 space-y-1">
        {incidents.map((incident) => (
          <div key={incident.key}>
            No se pudieron leer {KEY_LABELS[incident.key] || `los datos guardados ("${incident.key}")`} porque
            estaban dañados. Se está mostrando un contenido por defecto para que puedas seguir trabajando, pero
            {incident.backupKey
              ? ' tus datos originales NO se han borrado: quedaron guardados en el almacenamiento del navegador para poder recuperarlos.'
              : ' no fue posible guardar una copia de seguridad (almacenamiento lleno).'}
          </div>
        ))}
      </div>
      <button
        onClick={() => setIncidents([])}
        className="shrink-0 text-amber-400 hover:text-amber-200 cursor-pointer"
        title="Descartar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
