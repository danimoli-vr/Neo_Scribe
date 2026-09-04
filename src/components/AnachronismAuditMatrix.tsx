import React from 'react';
import { BookOpen, Check, CheckCircle2, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { NarrativeAnachronism } from '../types';

interface AnachronismAuditMatrixProps {
  anachronisms: NarrativeAnachronism[];
  onSendToAuditor?: (text: string, title: string) => void;
  onReconcileFtl: (anac: NarrativeAnachronism) => void;
  onMarkAsFlashback: (chapterNumber: number) => void;
  onOpenChapterInEditor?: (chapterNumber: number) => void;
}

/**
 * "Radar" view of TimelineView: an exhaustive list of detected anachronisms
 * with one-click reconciliation actions. Read-only aside from the callbacks
 * it forwards — all mutation logic stays in the parent.
 */
export const AnachronismAuditMatrix: React.FC<AnachronismAuditMatrixProps> = ({
  anachronisms,
  onSendToAuditor,
  onReconcileFtl,
  onMarkAsFlashback,
  onOpenChapterInEditor,
}) => {
  return (
    <div className="space-y-4 font-mono">
      <div className="bg-[#0f1017] border border-[#1e293b] rounded-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
          <div>
            <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              RADAR DE ANACRONISMOS NARRATIVOS & MATRIZ DE CAUSALIDAD
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Listado exhaustivo de paradojas de viaje FTL, discrepancias de orden narrativo e invenciones de tecnología antes de tiempo.
            </p>
          </div>

          {onSendToAuditor && anachronisms.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const report = `AUDITORÍA DE CRONOLOGÍA Y ANACRONISMOS:\n\n${anachronisms.map(a => `[${a.severity}] ${a.title}\n${a.description}\nRecomendación: ${a.recommendation}`).join('\n\n')}`;
                onSendToAuditor(report, 'Análisis de Paradojas Temporales y FTL');
              }}
              className="px-3 py-1.5 rounded-sm bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auditar Informe con Gemini</span>
            </button>
          )}
        </div>

        {anachronisms.length === 0 ? (
          <div className="p-8 text-center bg-[#0a0a0e] border border-[#1e293b] rounded-sm space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">Causalidad Espaciotemporal 100% Coherente</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No se han detectado teletransportaciones imposibles, saltos de FTL deficitarios ni uso anacrónico de reliquias en los capítulos actuales.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anachronisms.map((anac) => {
              const isFtl = anac.type === 'DESPLAZAMIENTO_FTL_IMPOSIBLE';
              const isOrder = anac.type === 'DISCREPANCIA_ORDEN_DIEGETICO';

              return (
                <div
                  key={anac.id}
                  className={`p-4 rounded-sm border transition-all ${
                    anac.severity === 'CRITICA'
                      ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-600'
                      : 'bg-amber-950/20 border-amber-800/80 hover:border-amber-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                          anac.severity === 'CRITICA'
                            ? 'bg-rose-500 text-black'
                            : 'bg-amber-500 text-black'
                        }`}>
                          {anac.severity} // {anac.type.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {anac.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {anac.description}
                      </p>

                      {/* Physics causality breakdown */}
                      <div className="p-2.5 bg-[#090a0f] border border-[#1e293b] rounded-xs text-[11px] text-slate-400 space-y-1">
                        <div>
                          <strong className="text-cyan-400">Explicación de Física del Sustrato:</strong> {anac.explanation}
                        </div>
                        <div className="text-emerald-400 font-bold">
                          💡 Solución Recomendada: <span className="font-normal text-slate-300">{anac.recommendation}</span>
                        </div>
                      </div>
                    </div>

                    {/* One-click Reconciliation Actions */}
                    <div className="flex flex-col gap-2 shrink-0 sm:min-w-[180px]">
                      {isFtl && anac.requiredDeltaCycle !== undefined && (
                        <button
                          type="button"
                          onClick={() => onReconcileFtl(anac)}
                          className="w-full px-3 py-1.5 rounded-sm bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          title="Ajusta automáticamente la fecha diegética para cumplir con la velocidad de salto FTL"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Reconciliar FTL</span>
                        </button>
                      )}

                      {isOrder && anac.affectedChapterNumbers && anac.affectedChapterNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onMarkAsFlashback(anac.affectedChapterNumbers![1])}
                          className="w-full px-3 py-1.5 rounded-sm bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          title="Marcar este capítulo como flashback / analepsis legítimo"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Marcar Analepsis</span>
                        </button>
                      )}

                      {anac.affectedChapterNumbers && anac.affectedChapterNumbers.length > 0 && onOpenChapterInEditor && (
                        <button
                          type="button"
                          onClick={() => onOpenChapterInEditor(anac.affectedChapterNumbers![0])}
                          className="w-full px-3 py-1.5 rounded-sm bg-[#12141c] hover:bg-[#1a1c26] border border-[#1e293b] text-slate-300 hover:text-white text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>Abrir Cap {anac.affectedChapterNumbers[0]}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
