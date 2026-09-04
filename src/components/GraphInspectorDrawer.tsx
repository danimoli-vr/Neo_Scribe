import React from 'react';
import {
  AlertTriangle, BookOpen, CheckCircle2, ChevronRight, ExternalLink,
  FileText, Info, Network, ShieldAlert, Sparkles, X,
} from 'lucide-react';
import { PlotInconsistency, StoryGraphLink, StoryGraphNode } from '../types';

export type SidePanelTab = 'INSPECTOR' | 'INCONSISTENCIAS';

interface GraphInspectorDrawerProps {
  sidePanelTab: SidePanelTab;
  onTabChange: (tab: SidePanelTab) => void;

  // Inconsistencies tab
  inconsistencies: PlotInconsistency[];
  criticalCount: number;
  warningCount: number;
  selectedInconsistencyId: string | null;
  onSelectInconsistency: (inc: PlotInconsistency) => void;
  onAuditorDispatch: (inc: PlotInconsistency) => void;

  // Inspector tab
  selectedNode: StoryGraphNode | null;
  selectedNodeInconsistencies: PlotInconsistency[];
  selectedNodeConnections: { link: StoryGraphLink; otherNode: StoryGraphNode | undefined }[];
  onDeselectNode: () => void;
  onInspectFullCard: (node: StoryGraphNode) => void;
  onFocusNode: (nodeId: string) => void;
  onJumpToInconsistency: (incId: string) => void;

  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onSendToAuditor?: (text: string, title: string) => void;
}

/**
 * Right-hand analysis drawer of StoryRelationsGraphView: the
 * inconsistencies list and the per-node inspector, tabbed. Purely
 * presentational — the graph data, selection state and D3 focusing all
 * live in the parent.
 */
export const GraphInspectorDrawer: React.FC<GraphInspectorDrawerProps> = ({
  sidePanelTab,
  onTabChange,
  inconsistencies,
  criticalCount,
  warningCount,
  selectedInconsistencyId,
  onSelectInconsistency,
  onAuditorDispatch,
  selectedNode,
  selectedNodeInconsistencies,
  selectedNodeConnections,
  onDeselectNode,
  onInspectFullCard,
  onFocusNode,
  onJumpToInconsistency,
  onOpenChapterInEditor,
  onSendToAuditor,
}) => {
  return (
    <div className="lg:col-span-4 bg-[#0d0d12] border border-[#1e293b] rounded-sm flex flex-col min-h-[580px] sm:min-h-[660px]">
      {/* Drawer Navigation Tabs */}
      <div className="grid grid-cols-2 border-b border-[#1e293b] text-xs font-mono uppercase tracking-wider">
        <button
          type="button"
          onClick={() => onTabChange('INCONSISTENCIAS')}
          className={`py-3 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
            sidePanelTab === 'INCONSISTENCIAS'
              ? 'border-rose-500 text-rose-300 bg-rose-950/20 font-bold'
              : 'border-transparent text-slate-400 hover:text-white bg-[#0a0a0d]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Inconsistencias ({inconsistencies.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('INSPECTOR')}
          className={`py-3 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
            sidePanelTab === 'INSPECTOR'
              ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20 font-bold'
              : 'border-transparent text-slate-400 hover:text-white bg-[#0a0a0d]'
          }`}
        >
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Inspector {selectedNode ? `(${selectedNode.name.slice(0, 10)}…)` : ''}</span>
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[600px] text-xs font-mono">
        {/* TAB 1: INCONSISTENCIAS DE TRAMA */}
        {sidePanelTab === 'INCONSISTENCIAS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                AUDITORÍA DETERMINISTA DE TRAMA
              </span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-rose-400 font-bold">{criticalCount} Críticas</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">{warningCount} Advertencias</span>
              </div>
            </div>

            {inconsistencies.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-[#0a0a0e] border border-[#1e293b] rounded-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-white font-bold text-sm">COHERENCIA PERFECTA</div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  No se han detectado saltos estelares instantáneos, sobrecargas de entropía ni anomalías DRM entre los capítulos analizados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inconsistencies.map(inc => {
                  const isSelected = selectedInconsistencyId === inc.id;
                  const severityStyles = inc.severity === 'CRITICA'
                    ? 'border-rose-600 bg-rose-950/25 text-rose-300'
                    : inc.severity === 'ADVERTENCIA'
                      ? 'border-amber-600 bg-amber-950/25 text-amber-300'
                      : 'border-cyan-600 bg-cyan-950/25 text-cyan-300';

                  return (
                    <div
                      key={inc.id}
                      onClick={() => onSelectInconsistency(inc)}
                      className={`border rounded-sm p-3.5 space-y-2.5 transition-all cursor-pointer ${severityStyles} ${
                        isSelected ? 'ring-1 ring-white/50 scale-[1.01]' : 'hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                          {inc.severity === 'CRITICA' ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : inc.severity === 'ADVERTENCIA' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <span>{inc.title}</span>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-bold ${
                          inc.severity === 'CRITICA'
                            ? 'bg-rose-600 text-black'
                            : inc.severity === 'ADVERTENCIA'
                              ? 'bg-amber-500 text-black'
                              : 'bg-cyan-600 text-black'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {inc.description}
                      </p>

                      {/* Recommendation Box */}
                      <div className="bg-[#090b10] border border-[#1e293b] p-2 rounded-xs text-[10px] space-y-1">
                        <div className="text-cyan-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Sugerencia de Reconciliación:</span>
                        </div>
                        <div className="text-slate-300">
                          {inc.recommendation}
                        </div>
                      </div>

                      {/* Affected chapters & nodes tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px]">
                        {inc.affectedChapterNumbers.map(n => (
                          <span key={n} className="bg-[#111115] text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded-xs">
                            Cap. {n}
                          </span>
                        ))}

                        {inc.affectedNodeIds.map(nid => (
                          <span key={nid} className="bg-[#111115] text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-xs">
                            {nid}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]/60">
                        {inc.affectedChapterNumbers.length > 0 && onOpenChapterInEditor && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChapterInEditor(inc.affectedChapterNumbers[0]);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] underline cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Abrir Cap. {inc.affectedChapterNumbers[0]} en Editor</span>
                          </button>
                        )}

                        {onSendToAuditor && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAuditorDispatch(inc);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-xs text-[9px] flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Auditar con Gemini</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSPECTOR DE NODO */}
        {sidePanelTab === 'INSPECTOR' && (
          <div className="space-y-4">
            {!selectedNode ? (
              <div className="p-8 text-center space-y-2 bg-[#0a0a0e] border border-[#1e293b] rounded-sm text-slate-500">
                <Network className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">
                  Haz clic en cualquier nodo del grafo (personaje, planeta o tecnología) para inspeccionar sus relaciones y coherencia.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Header Card */}
                <div className="bg-[#0e1219] border border-[#1e293b] rounded-sm p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider ${
                        selectedNode.type === 'PERSONAJE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : selectedNode.type === 'PLANETA'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {selectedNode.type} • {selectedNode.subType || selectedNode.roleOrCategory}
                      </span>
                      <h3 className="text-base font-bold text-white font-mono">
                        {selectedNode.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={onDeselectNode}
                      className="text-slate-500 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedNode.description}
                  </p>

                  {selectedNode.factionOrSystem && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1e293b]">
                      <strong className="text-slate-300">Alineación / Entorno:</strong> {selectedNode.factionOrSystem}
                    </div>
                  )}

                  {/* Prominent Entity Full Data Card Button */}
                  <button
                    type="button"
                    onClick={() => onInspectFullCard(selectedNode)}
                    className="w-full mt-2 py-2 px-3 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/70 hover:border-cyan-400 text-cyan-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] text-xs"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Ver Tarjeta Completa de la Entidad</span>
                  </button>
                </div>

                {/* Node Inconsistencies Alert */}
                {selectedNodeInconsistencies.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Inconsistencias Asociadas ({selectedNodeInconsistencies.length})</span>
                    </div>

                    <div className="space-y-2">
                      {selectedNodeInconsistencies.map(inc => (
                        <div
                          key={inc.id}
                          onClick={() => onJumpToInconsistency(inc.id)}
                          className="p-2.5 rounded-sm bg-rose-950/30 border border-rose-600/70 text-rose-200 text-xs space-y-1 cursor-pointer hover:border-rose-400"
                        >
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{inc.title}</span>
                            <span className="text-[9px] bg-rose-600 text-black px-1 rounded-xs uppercase">
                              {inc.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300">
                            {inc.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapter Occurrences */}
                <div className="space-y-2">
                  <div className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Presencia en Capítulos ({selectedNode.chapterOccurrences.length})</span>
                  </div>

                  {selectedNode.chapterOccurrences.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic p-2 bg-[#090b10] rounded-sm border border-[#1e293b]">
                      Entidad huérfana: Todavía no aparece en el texto de ningún capítulo.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.chapterOccurrences.map(cNum => (
                        <button
                          key={cNum}
                          type="button"
                          onClick={() => onOpenChapterInEditor && onOpenChapterInEditor(cNum)}
                          className="px-2 py-1 rounded-sm bg-[#111116] border border-[#1e293b] hover:border-cyan-500 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs"
                        >
                          <span className="text-cyan-400 font-bold">Capítulo {cNum}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connected Nodes List */}
                <div className="space-y-2">
                  <div className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-slate-400" />
                    <span>Relaciones Directas ({selectedNodeConnections.length})</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {selectedNodeConnections.map(({ link, otherNode }) => {
                      if (!otherNode) return null;
                      return (
                        <div
                          key={link.id}
                          onClick={() => onFocusNode(otherNode.id)}
                          className="p-2 rounded-sm bg-[#090b10] border border-[#1e293b] hover:border-cyan-600 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                otherNode.type === 'PERSONAJE' ? 'bg-amber-400' :
                                otherNode.type === 'PLANETA' ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`} />
                              <span>{otherNode.name}</span>
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {link.label} • {link.weight} aparición{link.weight > 1 ? 'es' : ''}
                            </div>
                          </div>

                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
