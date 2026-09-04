import React from 'react';
import { Camera, History, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { Chapter, ChapterSnapshot } from '../types';

interface ChapterSnapshotsModalProps {
  isOpen: boolean;
  currentChapter: Chapter;
  snapshots: ChapterSnapshot[];
  snapshotNote: string;
  onSnapshotNoteChange: (note: string) => void;
  previewingSnapshot: ChapterSnapshot | null;
  onTogglePreview: (snap: ChapterSnapshot | null) => void;
  onTakeSnapshot: () => void;
  onRestoreSnapshot: (snap: ChapterSnapshot) => void;
  onDeleteSnapshot: (snapId: string) => void;
  onClose: () => void;
}

/**
 * Version-history modal for the active chapter: take/preview/restore/delete
 * snapshots. All persistence lives in the parent (ChapterEditorView); this
 * component is purely presentational.
 */
export const ChapterSnapshotsModal: React.FC<ChapterSnapshotsModalProps> = ({
  isOpen,
  currentChapter,
  snapshots,
  snapshotNote,
  onSnapshotNoteChange,
  previewingSnapshot,
  onTogglePreview,
  onTakeSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onClose,
}) => {
  if (!isOpen || !currentChapter) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-200 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0d1017] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#080b12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>HISTORIAL DE INSTANTÁNEAS (SNAPSHOTS)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Capítulo {currentChapter.number}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guarda versiones históricas de tu capítulo antes de reescribir para nunca perder texto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Take Snapshot Form */}
          <div className="p-4 bg-[#090c14] rounded-xl border border-cyan-950/80">
            <h4 className="text-xs font-mono font-bold text-white mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Capturar estado actual del capítulo</span>
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => onSnapshotNoteChange(e.target.value)}
                placeholder="Nota o etiqueta (ej: 'Antes de cambiar el final del diálogo')..."
                className="w-full bg-[#121520] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none font-mono"
              />
              <button
                onClick={onTakeSnapshot}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-lg shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Capturar ({currentChapter.wordCount} pal.)</span>
              </button>
            </div>
          </div>

          {/* Snapshots List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Versiones Guardadas para este Capítulo ({snapshots.length})</span>
            </h4>

            {snapshots.length === 0 ? (
              <div className="text-center py-10 bg-[#090b10] border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No hay instantáneas registradas para el Capítulo {currentChapter.number}.
                <div className="text-[11px] text-slate-600 mt-1">
                  Haz clic en "Capturar" arriba para crear la primera versión de respaldo.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      previewingSnapshot?.id === snap.id
                        ? 'bg-cyan-950/30 border-cyan-500/60'
                        : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                          <span>{snap.description}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                            {snap.wordCount} palabras
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Guardado: {snap.createdAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onTogglePreview(previewingSnapshot?.id === snap.id ? null : snap)}
                          className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                            previewingSnapshot?.id === snap.id
                              ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                          }`}
                        >
                          {previewingSnapshot?.id === snap.id ? 'Ocultar' : 'Previsualizar'}
                        </button>
                        <button
                          onClick={() => onRestoreSnapshot(snap)}
                          className="px-2.5 py-1 text-xs font-mono bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Restaurar este texto en el editor"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>
                        <button
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Eliminar snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Snapshot Content Preview Drawer */}
                    {previewingSnapshot?.id === snap.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="text-[10px] font-mono text-cyan-400 mb-1 font-bold flex items-center justify-between">
                          <span>VISTA PREVIA DEL TEXTO GUARDADO:</span>
                          <span>{snap.wordCount} palabras</span>
                        </div>
                        <div className="p-3 bg-[#06070a] rounded-lg border border-slate-900 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {snap.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080b12] flex justify-end font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
