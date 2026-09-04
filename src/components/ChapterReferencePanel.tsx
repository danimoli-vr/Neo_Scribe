import React from 'react';
import { Clock, Layers } from 'lucide-react';
import { Chapter, NovelCharacter, StarSystem, Syscall, ExploitScript } from '../types';
import { CANONICAL_STAR_SYSTEMS, CANONICAL_SYSCALLS, CANONICAL_EXPLOITS, CANONICAL_FACTIONS } from '../data/canonicalLore';
import { ConceptTerm } from '../data/conceptDictionary';
import { ConceptDictionaryPanel } from './ConceptDictionaryPanel';

export type ReferenceTab = 'DICCIONARIO' | 'ENTORNO' | 'PERSONAJES' | 'HABILIDADES' | 'COHERENCIA';

interface ChapterReferencePanelProps {
  activeTab: ReferenceTab;
  onTabChange: (tab: ReferenceTab) => void;
  currentChapter: Chapter;
  currentSystem: StarSystem;
  characters: NovelCharacter[];
  sceneCharacters: NovelCharacter[];
  sceneAbilities: { syscalls: Syscall[]; exploits: ExploitScript[] };
  unifiedConcepts: ConceptTerm[];
  activeConceptsCount: number;
  onUpdateChapter: (updates: Partial<Chapter>) => void;
  onInsertTerm: (termText: string) => void;
  onToggleCharacter: (charId: string) => void;
  onToggleAbility: (abilityId: string) => void;
  onToggleChecklistItem: (key: keyof Chapter['coherenceChecklist']) => void;
  onOpenNewCharacterModal: () => void;
  onOpenTimeline?: () => void;
}

/**
 * Right column of ChapterEditorView: the tabbed "reference matrix"
 * (dictionary / environment / characters / abilities / coherence checklist)
 * for the chapter currently being edited. All state and persistence stay in
 * the parent — this component only reads and calls back up.
 */
export const ChapterReferencePanel: React.FC<ChapterReferencePanelProps> = ({
  activeTab,
  onTabChange,
  currentChapter,
  currentSystem,
  characters,
  sceneCharacters,
  sceneAbilities,
  unifiedConcepts,
  activeConceptsCount,
  onUpdateChapter,
  onInsertTerm,
  onToggleCharacter,
  onToggleAbility,
  onToggleChecklistItem,
  onOpenNewCharacterModal,
  onOpenTimeline,
}) => {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 space-y-4">
        {/* Tab Navigation for References */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            MATRIZ DE REFERENCIAS DEL CAPÍTULO
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="grid grid-cols-5 gap-1 border-b border-[#1e293b] pb-2 text-[9px] font-mono uppercase tracking-wider">
          <button
            onClick={() => onTabChange('DICCIONARIO')}
            className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
              activeTab === 'DICCIONARIO' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white bg-[#111114]'
            }`}
          >
            Diccionario ({activeConceptsCount})
          </button>
          <button
            onClick={() => onTabChange('ENTORNO')}
            className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
              activeTab === 'ENTORNO' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white bg-[#111114]'
            }`}
          >
            Planeta
          </button>
          <button
            onClick={() => onTabChange('PERSONAJES')}
            className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
              activeTab === 'PERSONAJES' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white bg-[#111114]'
            }`}
          >
            Personajes ({sceneCharacters.length})
          </button>
          <button
            onClick={() => onTabChange('HABILIDADES')}
            className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
              activeTab === 'HABILIDADES' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white bg-[#111114]'
            }`}
          >
            Poderes ({currentChapter.abilityIds.length})
          </button>
          <button
            onClick={() => onTabChange('COHERENCIA')}
            className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
              activeTab === 'COHERENCIA' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white bg-[#111114]'
            }`}
          >
            Leyes
          </button>
        </div>

        {/* TAB 0: DICCIONARIO DE CONCEPTOS */}
        {activeTab === 'DICCIONARIO' && (
          <ConceptDictionaryPanel
            concepts={unifiedConcepts}
            chapterText={currentChapter.content}
            onInsertTerm={onInsertTerm}
          />
        )}

        {/* TAB 1: ENTORNO (PLANET / SECTOR) */}
        {activeTab === 'ENTORNO' && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Sistema Estelar / Sector Astrográfico:
              </label>
              <select
                value={currentChapter.systemId}
                onChange={(e) => onUpdateChapter({ systemId: e.target.value })}
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500 outline-none"
              >
                {CANONICAL_STAR_SYSTEMS.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Diegetic Timing & Anachronism Controls */}
            <div className="p-3 bg-[#0a0a0e] border border-[#1e293b] rounded-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  CRONOLOGÍA DIEGÉTICA DE PLANCK:
                </span>
                {onOpenTimeline && (
                  <button
                    type="button"
                    onClick={onOpenTimeline}
                    className="text-[9px] font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer uppercase"
                  >
                    Ver Línea Temporal →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase block mb-0.5">
                    Ciclo / Año:
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={currentChapter.diegeticCycle ?? 3042.188}
                    onChange={(e) => {
                      const cycle = parseFloat(e.target.value);
                      onUpdateChapter({
                        diegeticCycle: cycle,
                        diegeticDateLabel: `Ciclo ${cycle.toFixed(3)} // Planck Tick 0x${(currentChapter.number * 17).toString(16).toUpperCase()}`,
                      });
                    }}
                    className="w-full bg-[#12131b] border border-[#1e293b] rounded-sm px-2 py-1 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase block mb-0.5">
                    Etiqueta Diegética:
                  </label>
                  <input
                    type="text"
                    value={currentChapter.diegeticDateLabel ?? `Ciclo ${(currentChapter.diegeticCycle ?? 3042.188).toFixed(3)}`}
                    onChange={(e) => onUpdateChapter({ diegeticDateLabel: e.target.value })}
                    className="w-full bg-[#12131b] border border-[#1e293b] rounded-sm px-2 py-1 text-xs text-cyan-300 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id={`chk_flashback_${currentChapter.id}`}
                  checked={!!currentChapter.isFlashback}
                  onChange={(e) => onUpdateChapter({ isFlashback: e.target.checked })}
                  className="rounded-xs bg-[#12131b] border-[#1e293b] text-cyan-500 focus:ring-0"
                />
                <label
                  htmlFor={`chk_flashback_${currentChapter.id}`}
                  className="text-[10px] font-mono text-slate-300 cursor-pointer select-none"
                >
                  Analepsis / Flashback (no penaliza inversión temporal)
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Localización Exacta en la Escena:
              </label>
              <input
                type="text"
                value={currentChapter.locationDetails}
                onChange={(e) => onUpdateChapter({ locationDetails: e.target.value })}
                placeholder="ej. Escombros de la boya 404 / Puente de mando de la fragata..."
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Star System Live Card */}
            <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1e293b]">
                <span className="text-cyan-400 font-bold">{currentSystem.name}</span>
                <span className="text-[10px] text-slate-400">{currentSystem.coordinates}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-[#0a0a0c] rounded-sm border border-[#1e293b]">
                  <span className="text-slate-500 block uppercase">Ancho de Banda</span>
                  <strong className="text-cyan-300">{currentSystem.bandwidthFlops}</strong>
                </div>
                <div className="p-2 bg-[#0a0a0c] rounded-sm border border-[#1e293b]">
                  <span className="text-slate-500 block uppercase">Régimen DRM</span>
                  <strong className="text-amber-300">{currentSystem.drmPolicy.replace(/_/g, ' ')}</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-[#0a0a0c] p-2.5 rounded-sm border border-[#1e293b] leading-relaxed font-sans">
                <span className="text-cyan-400 font-mono font-semibold block text-[10px] uppercase mb-0.5">
                  Ruinas & Entorno:
                </span>
                {currentSystem.precursorRuins}
              </div>

              <div className="text-[11px] text-amber-200/90 bg-amber-950/20 p-2.5 rounded-sm border border-amber-900/30 leading-relaxed font-sans">
                <span className="text-amber-400 font-mono font-semibold block text-[10px] uppercase mb-0.5">
                  ⚠️ Restricción de Física Local:
                </span>
                {currentSystem.knownAnomalies[0] || 'Sin anomalías severas de sustrato registradas.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAJES (CHARACTERS) */}
        {activeTab === 'PERSONAJES' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Personajes en esta Escena:
              </span>
              <button
                onClick={onOpenNewCharacterModal}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline uppercase cursor-pointer"
              >
                + Nuevo Personaje
              </button>
            </div>

            {/* Characters Multi-selector pills */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
              {characters.map((char) => {
                const isPresent = currentChapter.characterIds.includes(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => onToggleCharacter(char.id)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-sm uppercase transition-all cursor-pointer flex items-center gap-1 border ${
                      isPresent
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-[#111114] border-[#1e293b] text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{isPresent ? '✓' : '+'}</span>
                    <span>{char.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Character reference sheets */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {sceneCharacters.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No hay personajes seleccionados para esta escena. Haz clic en las etiquetas arriba para agregarlos.
                </div>
              ) : (
                sceneCharacters.map((char) => {
                  const faction = CANONICAL_FACTIONS.find((f) => f.id === char.factionId);
                  return (
                    <div
                      key={char.id}
                      className="bg-[#111114] border border-[#1e293b] rounded-sm p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-[#1e293b]">
                        <div>
                          <span className="font-bold text-white font-mono uppercase tracking-wide">
                            {char.name}
                          </span>
                          <span className="text-[10px] text-cyan-400 block font-mono">
                            {char.role}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0a0a0c] text-slate-400 border border-[#1e293b] rounded-sm uppercase">
                          {faction?.shortName || 'Independiente'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-[#0a0a0c] p-2 rounded-sm border border-[#1e293b] leading-relaxed font-sans">
                        <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block mb-0.5">
                          Implantes & Disipadores:
                        </span>
                        {char.signatureImplants}
                      </div>

                      {char.notes && (
                        <div className="text-[11px] text-slate-400 font-sans italic bg-[#0a0a0c] p-2 rounded-sm border border-[#1e293b]">
                          "{char.notes}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HABILIDADES & EXPLOITS */}
        {activeTab === 'HABILIDADES' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Syscalls y Exploits Empleados en el Capítulo:
            </span>

            {/* Multi-selector pills for abilities */}
            <div className="space-y-2">
              <div className="text-[9px] font-mono text-slate-500 uppercase">Syscalls Básicas:</div>
              <div className="flex flex-wrap gap-1">
                {CANONICAL_SYSCALLS.map((sys) => {
                  const isSelected = currentChapter.abilityIds.includes(sys.id);
                  return (
                    <button
                      key={sys.id}
                      onClick={() => onToggleAbility(sys.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#111114] border-[#1e293b] text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{sys.name}
                    </button>
                  );
                })}
              </div>

              <div className="text-[9px] font-mono text-slate-500 uppercase mt-2">Exploits Tácticos:</div>
              <div className="flex flex-wrap gap-1">
                {CANONICAL_EXPLOITS.map((exp) => {
                  const isSelected = currentChapter.abilityIds.includes(exp.id);
                  return (
                    <button
                      key={exp.id}
                      onClick={() => onToggleAbility(exp.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-[#111114] border-[#1e293b] text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{exp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Abilities Detail Cards */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {sceneAbilities.syscalls.map((sys) => (
                <div
                  key={sys.id}
                  className="p-3 bg-[#111114] border border-[#1e293b] rounded-sm space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{sys.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-sm">
                      {sys.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {sys.description}
                  </p>
                  <div className="p-2 bg-[#0a0a0c] rounded-sm border border-red-900/30 text-red-300 text-[10px] leading-snug">
                    <strong className="text-red-400 uppercase block mb-0.5">⚠️ Riesgo de Disipador / Pánico:</strong>
                    {sys.panicTrigger}
                  </div>
                </div>
              ))}

              {sceneAbilities.exploits.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-[#111114] border border-[#1e293b] rounded-sm space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{exp.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded-sm">
                      EXPLOIT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {exp.tacticalApplication}
                  </p>
                  <div className="p-2 bg-[#0a0a0c] rounded-sm border border-amber-900/40 text-amber-200 text-[10px] leading-snug">
                    <strong className="text-amber-400 uppercase block mb-0.5">Manifestación Física:</strong>
                    {exp.physicalManifestation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COHERENCIA & LEYES DEL KERNEL */}
        {activeTab === 'COHERENCIA' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-[#111114] border border-[#1e293b] rounded-sm space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Checklist de Físicas de Planck para el Autor:
              </span>

              <div className="space-y-2 text-[11px]">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentChapter.coherenceChecklist.entropyRespected}
                    onChange={() => onToggleChecklistItem('entropyRespected')}
                    className="mt-0.5 accent-cyan-500 cursor-pointer"
                  />
                  <span className={currentChapter.coherenceChecklist.entropyRespected ? 'text-white' : 'text-slate-400'}>
                    <strong>1. Conservación de Entropía:</strong> ¿Se ha mencionado el radiador, aleta o disipador térmico al enfriar o alterar materia?
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentChapter.coherenceChecklist.bandwidthChecked}
                    onChange={() => onToggleChecklistItem('bandwidthChecked')}
                    className="mt-0.5 accent-cyan-500 cursor-pointer"
                  />
                  <span className={currentChapter.coherenceChecklist.bandwidthChecked ? 'text-white' : 'text-slate-400'}>
                    <strong>2. Límite de Ancho de Banda:</strong> ¿El volumen de cómputo encaja con los {currentSystem.bandwidthFlops} del sector sin causar lag irreal?
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentChapter.coherenceChecklist.memoryLeaksCleaned}
                    onChange={() => onToggleChecklistItem('memoryLeaksCleaned')}
                    className="mt-0.5 accent-cyan-500 cursor-pointer"
                  />
                  <span className={currentChapter.coherenceChecklist.memoryLeaksCleaned ? 'text-white' : 'text-slate-400'}>
                    <strong>3. Gestión de Memoria:</strong> ¿El operador liberó los búferes ontológicos o dejó un residuo estático en el vacío?
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentChapter.coherenceChecklist.drmRulesRespected}
                    onChange={() => onToggleChecklistItem('drmRulesRespected')}
                    className="mt-0.5 accent-cyan-500 cursor-pointer"
                  />
                  <span className={currentChapter.coherenceChecklist.drmRulesRespected ? 'text-white' : 'text-slate-400'}>
                    <strong>4. Régimen Político/DRM:</strong> ¿Las autoridades locales o la Inquisición reaccionan al uso del sustrato según las leyes del planeta?
                  </span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-sm text-cyan-200 text-[11px] leading-relaxed font-sans">
              💡 <strong>Regla Inquebrantable de la Saga:</strong> En esta ópera espacial nunca hay generación espontánea. La tecnomagia es ingeniería extrema a 10⁻³⁵ metros. Si algo parece mágico, debes explicitar la llamada a bajo nivel y su coste en hardware.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
