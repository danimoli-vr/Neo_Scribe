import React, { useState } from 'react';
import { 
  X, User, Globe, Cpu, Terminal, ShieldAlert, AlertTriangle, 
  ExternalLink, Copy, Check, Sparkles, BookOpen, Layers, 
  Flame, Zap, Compass, ChevronRight, Info, ShieldCheck, Share2
} from 'lucide-react';
import { 
  StoryGraphNode, 
  NovelCharacter, 
  StarSystem, 
  Syscall, 
  ExploitScript, 
  Faction,
  PlotInconsistency,
  Chapter
} from '../types';

interface EntityCardModalProps {
  node: StoryGraphNode | null;
  onClose: () => void;
  onSelectNodeById: (nodeId: string) => void;
  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onSendToAuditor?: (text: string, title: string) => void;
  onFocusNodeInGraph?: (nodeId: string) => void;
  inconsistencies: PlotInconsistency[];
  allNodes: StoryGraphNode[];
  canonicalCharacters: NovelCharacter[];
  canonicalStarSystems: StarSystem[];
  canonicalSyscalls: Syscall[];
  canonicalExploits: ExploitScript[];
  canonicalFactions: Faction[];
  chapters: Chapter[];
}

export const EntityCardModal: React.FC<EntityCardModalProps> = ({
  node,
  onClose,
  onSelectNodeById,
  onOpenChapterInEditor,
  onSendToAuditor,
  onFocusNodeInGraph,
  inconsistencies,
  allNodes,
  canonicalCharacters,
  canonicalStarSystems,
  canonicalSyscalls,
  canonicalExploits,
  canonicalFactions,
  chapters
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!node) return null;

  // Matching canonical records for deep specs
  const matchedCharacter = canonicalCharacters.find(c => c.id === node.id || c.name.toLowerCase() === node.name.toLowerCase());
  const matchedSystem = canonicalStarSystems.find(s => s.id === node.id || s.name.toLowerCase().includes(node.name.toLowerCase()) || node.name.toLowerCase().includes(s.name.toLowerCase()));
  const matchedSyscall = canonicalSyscalls.find(s => s.id === node.id || s.name.toLowerCase() === node.name.toLowerCase());
  const matchedExploit = canonicalExploits.find(e => e.id === node.id || e.name.toLowerCase() === node.name.toLowerCase());
  const matchedFaction = canonicalFactions.find(f => f.id === node.factionOrSystem || f.name.toLowerCase() === (node.factionOrSystem || '').toLowerCase());

  // Connected nodes from node's connectedLinks
  const relatedNodes = (node.connectedLinks || []).map(link => {
    const sId = typeof link.source === 'string' ? link.source : link.source.id;
    const tId = typeof link.target === 'string' ? link.target : link.target.id;
    const otherId = sId === node.id ? tId : sId;
    const otherNode = allNodes.find(n => n.id === otherId);
    return {
      node: otherNode,
      label: link.label,
      weight: link.weight
    };
  }).filter((item): item is { node: StoryGraphNode; label: string; weight: number } => item.node !== undefined);

  // Inconsistencies for this node
  const nodeInconsistencies = inconsistencies.filter(i => i.affectedNodeIds.includes(node.id));

  // Copy dossier handler
  const handleCopyDossier = () => {
    let text = `DOSSIER TÉCNICO // KRNL.VACUO\n`;
    text += `ENTIDAD: ${node.name} [ID: ${node.id}]\n`;
    text += `CATEGORÍA: ${node.type} | SUBTIPO: ${node.subType || node.roleOrCategory}\n`;
    text += `DESCRIPCIÓN: ${node.description}\n`;
    if (node.factionOrSystem) text += `AFILIACIÓN: ${node.factionOrSystem}\n`;
    text += `APARICIONES EN CAPÍTULOS: ${node.chapterOccurrences.map(c => `Cap. ${c}`).join(', ') || 'Sin registrar'}\n`;
    if (nodeInconsistencies.length > 0) {
      text += `\nALERTAS DE COHERENCIA (${nodeInconsistencies.length}):\n`;
      nodeInconsistencies.forEach(inc => {
        text += `- [${inc.severity}] ${inc.title}: ${inc.description}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color theme per type
  const theme = {
    PERSONAJE: {
      border: 'border-amber-500/80',
      badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-600/60',
      accentColor: 'text-amber-400',
      glow: 'shadow-[0_0_24px_rgba(245,158,11,0.12)]',
      icon: User
    },
    PLANETA: {
      border: 'border-emerald-500/80',
      badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60',
      accentColor: 'text-emerald-400',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.12)]',
      icon: Globe
    },
    TECNOLOGIA: {
      border: 'border-cyan-500/80',
      badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-600/60',
      accentColor: 'text-cyan-400',
      glow: 'shadow-[0_0_24px_rgba(6,182,212,0.12)]',
      icon: Cpu
    }
  }[node.type];

  const Icon = theme.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0c0d12] border ${theme.border} rounded-sm shadow-2xl ${theme.glow} overflow-hidden font-mono text-xs`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#10121a] border-b border-[#1e293b] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-sm border flex items-center justify-center ${theme.badgeBg}`}>
              <Icon className={`w-5 h-5 ${theme.accentColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                  {node.type}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  ID: {node.id}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                {node.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDossier}
              className="p-2 rounded-sm bg-[#151722] hover:bg-slate-800 text-slate-300 border border-[#1e293b] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copiar Ficha Técnica de la Entidad"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline text-[11px]">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            {onFocusNodeInGraph && (
              <button
                onClick={() => {
                  onFocusNodeInGraph(node.id);
                  onClose();
                }}
                className="p-2 rounded-sm bg-[#151722] hover:bg-slate-800 text-cyan-300 border border-[#1e293b] hover:border-cyan-600 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Centrar y hacer foco en el Grafo"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">Enfocar Grafo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#151722] hover:bg-rose-950/60 text-slate-400 hover:text-white border border-[#1e293b] hover:border-rose-700 transition-colors cursor-pointer"
              title="Cerrar Ficha"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-300">
          
          {/* Main Summary & Lore Description Card */}
          <div className="bg-[#11131c] border border-[#1e293b] p-4 rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-[#1e293b] pb-2">
              <span className="uppercase tracking-wider font-bold text-slate-200">
                REGISTRO CANÓNICO DEL SUSTRATO
              </span>
              <span className={theme.accentColor}>
                {node.subType || node.roleOrCategory}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans sm:font-mono">
              {node.description}
            </p>
            {node.factionOrSystem && (
              <div className="text-[11px] text-slate-400 pt-2 flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase">Alineación / Entorno:</span>
                <span className="text-cyan-300 font-bold">{node.factionOrSystem}</span>
              </div>
            )}
          </div>

          {/* Canonical Deep Data Specific to Type */}
          {/* 1. PERSONAJE DETAILED SPECS */}
          {node.type === 'PERSONAJE' && matchedCharacter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#10121a] border border-[#1e293b] p-3.5 rounded-sm space-y-2">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Implantes Neurales & Térmica</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {matchedCharacter.signatureImplants || 'Sin implantes declarados en bio-registro.'}
                </p>
              </div>

              <div className="bg-[#10121a] border border-[#1e293b] p-3.5 rounded-sm space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Habilidades & Inyecciones Habituales</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedCharacter.typicalAbilities && matchedCharacter.typicalAbilities.length > 0 ? (
                    matchedCharacter.typicalAbilities.map(abId => (
                      <button
                        key={abId}
                        onClick={() => onSelectNodeById(abId)}
                        className="px-2 py-0.5 rounded-xs bg-[#161824] border border-cyan-800/60 text-cyan-300 hover:border-cyan-400 cursor-pointer text-[10px]"
                      >
                        {abId}
                      </button>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No registradas en base canónica.</span>
                  )}
                </div>
                {matchedCharacter.notes && (
                  <div className="pt-2 text-[10px] text-slate-400 border-t border-[#1e293b]">
                    <span className="text-slate-500 font-bold">Protocolo Operativo:</span> {matchedCharacter.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PLANETA / SISTEMA DETAILED SPECS */}
          {node.type === 'PLANETA' && matchedSystem && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Política DRM</div>
                <div className="font-bold text-emerald-300 text-xs">{matchedSystem.drmPolicy}</div>
                <div className="text-[10px] text-slate-400">Control: {matchedSystem.politicalControl}</div>
              </div>

              <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Ancho de Banda de Planck</div>
                <div className="font-bold text-cyan-300 text-xs">{matchedSystem.planckBandwidth}</div>
                <div className="text-[10px] text-slate-400">{matchedSystem.bandwidthFlops}</div>
              </div>

              <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Estabilidad de Kernel</div>
                <div className="font-bold text-white text-xs">{matchedSystem.kernelStabilityPercent}%</div>
                <div className="text-[10px] text-slate-400">Latencia FTL: {matchedSystem.ftlRoutingLatency}</div>
              </div>

              <div className="sm:col-span-2 md:col-span-3 bg-[#10121a] border border-[#1e293b] p-3 rounded-sm space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ruinas Precursoras en Sector:</div>
                <p className="text-slate-300 text-xs leading-relaxed">{matchedSystem.precursorRuins}</p>
                {matchedSystem.knownAnomalies && matchedSystem.knownAnomalies.length > 0 && (
                  <div className="text-[10px] text-amber-300/90 pt-1 border-t border-[#1e293b]">
                    <strong className="text-amber-400">Anomalías Detectadas:</strong> {matchedSystem.knownAnomalies.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. TECNOLOGÍA (SYSCALL / EXPLOIT) DETAILED SPECS */}
          {node.type === 'TECNOLOGIA' && (matchedSyscall || matchedExploit) && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {matchedSyscall && (
                  <>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Capa del Sustrato</div>
                      <div className="font-bold text-cyan-400">{matchedSyscall.category}</div>
                    </div>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Firma Hexadecimal</div>
                      <div className="font-bold text-amber-300">{matchedSyscall.signature}</div>
                    </div>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Coste de Cómputo</div>
                      <div className="font-bold text-white">{matchedSyscall.computeCostMFlops} MFlops</div>
                    </div>
                  </>
                )}

                {matchedExploit && (
                  <>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Vector Objetivo</div>
                      <div className="font-bold text-rose-400">{matchedExploit.targetDomain}</div>
                    </div>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Fuga de Memoria / Entropía</div>
                      <div className="font-bold text-amber-400">{matchedExploit.leakGenerationRate}% / min</div>
                    </div>
                    <div className="bg-[#10121a] border border-[#1e293b] p-3 rounded-sm">
                      <div className="text-[10px] text-slate-500 uppercase">Umbral de Kernel Panic</div>
                      <div className="font-bold text-rose-300">{matchedExploit.panicThreshold} MFlops</div>
                    </div>
                  </>
                )}
              </div>

              {matchedExploit && (
                <div className="bg-[#090b10] border border-[#1e293b] p-3.5 rounded-sm space-y-2">
                  <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Fallo Catastrófico & Riesgo Ontológico</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {matchedExploit.catastrophicFailure}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e293b]">
                    <strong className="text-slate-300">Manifestación Física:</strong> {matchedExploit.physicalManifestation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inconsistencies Alert Box */}
          {nodeInconsistencies.length > 0 && (
            <div className="border border-rose-600 bg-rose-950/20 p-4 rounded-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>ALERTAS DE COHERENCIA EN TRAMA ({nodeInconsistencies.length})</span>
                </div>
                {onSendToAuditor && (
                  <button
                    onClick={() => {
                      const inc = nodeInconsistencies[0];
                      const prompt = `AUDITORÍA DE ENTIDAD: ${node.name} [ID: ${node.id}]
Conflicto: ${inc.title} - ${inc.description}
Recomendación canónica: ${inc.recommendation}`;
                      onSendToAuditor(prompt, `Conflicto de ${node.name}`);
                      onClose();
                    }}
                    className="px-2 py-1 rounded-xs bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Auditar con Gemini</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {nodeInconsistencies.map(inc => (
                  <div key={inc.id} className="bg-[#0e0c10] border border-rose-900/60 p-2.5 rounded-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{inc.title}</span>
                      <span className="text-[9px] px-1 bg-rose-600 text-black font-bold uppercase">{inc.severity}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{inc.description}</p>
                    <div className="text-[10px] text-cyan-400 bg-[#06080d] p-1.5 rounded-xs mt-1">
                      <strong>Reconciliación:</strong> {inc.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Occurrences Row */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aparición en Capítulos del Manuscrito ({node.chapterOccurrences.length})</span>
            </div>

            {node.chapterOccurrences.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic p-3 bg-[#0a0c12] rounded-sm border border-[#1e293b]">
                Esta entidad está declarada en el worldbuilding canónico pero todavía no interviene en el texto de ningún capítulo.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {node.chapterOccurrences.map(cNum => {
                  const chap = chapters.find(c => c.number === cNum);
                  return (
                    <button
                      key={cNum}
                      type="button"
                      onClick={() => {
                        if (onOpenChapterInEditor) {
                          onOpenChapterInEditor(cNum);
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 rounded-sm bg-[#131622] hover:bg-[#1a1f30] border border-[#1e293b] hover:border-cyan-500 text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors text-xs"
                    >
                      <span className="text-cyan-400 font-bold">Capítulo {cNum}</span>
                      {chap && <span className="text-slate-400 text-[10px]">({chap.title})</span>}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Relationships Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Relaciones Directas en el Grafo ({relatedNodes.length})</span>
            </div>

            {relatedNodes.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic p-3 bg-[#0a0c12] rounded-sm border border-[#1e293b]">
                No posee enlaces directos calculados en el segmento actual.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {relatedNodes.map(({ node: relNode, label, weight }) => (
                  <div
                    key={relNode.id}
                    onClick={() => onSelectNodeById(relNode.id)}
                    className="p-2.5 rounded-sm bg-[#0e1017] border border-[#1e293b] hover:border-cyan-500 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span className={`w-2 h-2 rounded-full ${
                          relNode.type === 'PERSONAJE' ? 'bg-amber-400' :
                          relNode.type === 'PLANETA' ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`} />
                        <span>{relNode.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {label} • {weight} aparición{weight > 1 ? 'es' : ''}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0e1017] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            Entidad verificada bajo leyes de Planck del <strong className="text-slate-300">Kernel v0.8.4</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
