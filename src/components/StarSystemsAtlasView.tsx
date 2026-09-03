import React, { useState } from 'react';
import { CANONICAL_STAR_SYSTEMS } from '../data/canonicalLore';
import { StarSystem } from '../types';
import { Globe, Radio, Shield, AlertTriangle, Plus, HardDrive, Compass, ArrowUpRight } from 'lucide-react';

export const StarSystemsAtlasView: React.FC = () => {
  const [systems, setSystems] = useState<StarSystem[]>(CANONICAL_STAR_SYSTEMS);
  const [selectedSystem, setSelectedSystem] = useState<StarSystem>(CANONICAL_STAR_SYSTEMS[0]);
  const [filterDrm, setFilterDrm] = useState<string>('TODOS');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New system form state
  const [newSys, setNewSys] = useState<Partial<StarSystem>>({
    name: '',
    coordinates: 'Grid ',
    planckBandwidth: 'ESTÁNDAR',
    bandwidthFlops: '2,000 PFlops/m³',
    kernelStabilityPercent: 90,
    drmPolicy: 'FOSS_LIBRE',
    politicalControl: '',
    precursorRuins: '',
    ftlRoutingLatency: '0.8 seg',
    economicModel: '',
    knownAnomalies: []
  });
  const [anomalyInput, setAnomalyInput] = useState<string>('');

  const filteredSystems = filterDrm === 'TODOS'
    ? systems
    : systems.filter(s => s.drmPolicy === filterDrm);

  const handleAddSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSys.name) return;

    const created: StarSystem = {
      id: `SYS_${Date.now()}`,
      name: newSys.name,
      coordinates: newSys.coordinates || 'Grid 50.50 // Frontera Media',
      planckBandwidth: newSys.planckBandwidth || 'ESTÁNDAR',
      bandwidthFlops: newSys.bandwidthFlops || '1,000 PFlops/m³',
      kernelStabilityPercent: newSys.kernelStabilityPercent || 85,
      drmPolicy: newSys.drmPolicy || 'ZONA_NEUTRAL_HACKEADA',
      politicalControl: newSys.politicalControl || 'Gobierno Colonial Independiente',
      precursorRuins: newSys.precursorRuins || 'Ruinas menores sin explorar.',
      ftlRoutingLatency: newSys.ftlRoutingLatency || '1.5 seg',
      economicModel: newSys.economicModel || 'Comercio de recursos brutos.',
      knownAnomalies: anomalyInput ? [anomalyInput] : ['Ninguna anomalía crítica reportada.']
    };

    setSystems([...systems, created]);
    setSelectedSystem(created);
    setShowAddModal(false);
    setNewSys({
      name: '',
      coordinates: 'Grid ',
      planckBandwidth: 'ESTÁNDAR',
      bandwidthFlops: '2,000 PFlops/m³',
      kernelStabilityPercent: 90,
      drmPolicy: 'FOSS_LIBRE',
      politicalControl: '',
      precursorRuins: '',
      ftlRoutingLatency: '0.8 seg',
      economicModel: '',
      knownAnomalies: []
    });
    setAnomalyInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header - Geometric Balance with background dot matrix */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/30 border border-cyan-800/80 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              ASTROFÍSICA_DEL_KERNEL // MATRIZ_POLÍTICA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
              Atlas de Sistemas Estelares y Leyes de Planck
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              En tu ópera espacial, la política y la economía interestelar dependen del 
              <strong className="text-white"> ancho de banda del sustrato de Planck</strong> de cada sector. 
              Los mundos centrales disfrutan de física instantánea y DRM imperial; los mundos frontera sufren lag y fragmentación métrica.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir Sistema
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e293b] pb-3">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-2">FILTRAR_POR_DRM:</span>
        {['TODOS', 'DRM_ORTODOXO_ESTRICTO', 'FOSS_LIBRE', 'ANARQUÍA_FRAGMENTADA'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterDrm(filter)}
            className={`text-xs px-3 py-1.5 rounded-sm font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              filterDrm === filter
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#0d0d0f] text-slate-400 hover:bg-[#15151a] hover:text-white border border-[#1e293b]'
            }`}
          >
            {filter === 'TODOS' ? 'Todos los Sistemas' :
             filter === 'DRM_ORTODOXO_ESTRICTO' ? 'Imperio / DRM Sagrado' :
             filter === 'FOSS_LIBRE' ? 'Territorio Libre FOSS' : 'Anarquía Fragmentada'}
          </button>
        ))}
      </div>

      {/* Systems Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Systems List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredSystems.map((sys) => {
            const isSelected = selectedSystem.id === sys.id;
            return (
              <div
                key={sys.id}
                onClick={() => setSelectedSystem(sys)}
                className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 border-l-4 border-l-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-[#0d0d0f] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">{sys.coordinates}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    sys.drmPolicy === 'DRM_ORTODOXO_ESTRICTO' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    sys.drmPolicy === 'FOSS_LIBRE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {sys.drmPolicy === 'DRM_ORTODOXO_ESTRICTO' ? 'DRM SACRO' : sys.drmPolicy === 'FOSS_LIBRE' ? 'FOSS LIBRE' : 'FRAGMENTADO'}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white mb-1 font-mono uppercase tracking-wide">{sys.name}</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-2">
                  <span>Estabilidad: <strong className={sys.kernelStabilityPercent < 60 ? 'text-red-400' : 'text-emerald-400'}>{sys.kernelStabilityPercent}%</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Ancho de Banda: <strong className="text-slate-300">{sys.bandwidthFlops}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected System Inspector */}
        <div className="lg:col-span-7">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{selectedSystem.coordinates}</span>
                <h3 className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5 uppercase tracking-tight">{selectedSystem.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Control Político: <strong className="text-slate-200">{selectedSystem.politicalControl}</strong></p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Estabilidad del Kernel:</div>
                <div className={`text-xl font-bold font-mono ${
                  selectedSystem.kernelStabilityPercent < 60 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {selectedSystem.kernelStabilityPercent}%
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#111114] rounded-sm border border-[#1e293b] font-mono text-xs">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider">ANCHO DE BANDA PLANCK</div>
                <div className="text-cyan-400 font-bold mt-0.5 text-xs">{selectedSystem.bandwidthFlops}</div>
                <div className="text-[10px] text-slate-400 mt-1">{selectedSystem.planckBandwidth}</div>
              </div>

              <div className="p-3 bg-[#111114] rounded-sm border border-[#1e293b] font-mono text-xs">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider">LATENCIA DE SALTO FTL</div>
                <div className="text-amber-400 font-bold mt-0.5 text-xs">{selectedSystem.ftlRoutingLatency}</div>
                <div className="text-[10px] text-slate-400 mt-1">Enrutamiento métrico</div>
              </div>

              <div className="p-3 bg-[#111114] rounded-sm border border-[#1e293b] font-mono text-xs col-span-2 sm:col-span-1">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider">RÉGIMEN DE REALIDAD</div>
                <div className="text-emerald-400 font-bold mt-0.5 text-xs">
                  {selectedSystem.drmPolicy === 'DRM_ORTODOXO_ESTRICTO' ? 'Diezmo Obligatorio' :
                   selectedSystem.drmPolicy === 'FOSS_LIBRE' ? 'Malla Abierta P2P' : 'Desregulado'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Permisos de inyección</div>
              </div>
            </div>

            {/* In-depth lore sections */}
            <div className="space-y-3.5 text-xs">
              <div>
                <h4 className="font-mono uppercase text-[10px] font-bold tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  Ruinas y Megaestructuras Precursoras del Sistema:
                </h4>
                <p className="text-slate-300 bg-[#111114] p-3 rounded-sm border border-[#1e293b] leading-relaxed font-sans">
                  {selectedSystem.precursorRuins}
                </p>
              </div>

              <div>
                <h4 className="font-mono uppercase text-[10px] font-bold tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Modelo Económico & Tráfico de Librerías:
                </h4>
                <p className="text-slate-300 bg-[#111114] p-3 rounded-sm border border-[#1e293b] leading-relaxed font-sans">
                  {selectedSystem.economicModel}
                </p>
              </div>

              <div>
                <h4 className="font-mono uppercase text-[10px] font-bold tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Anomalías del Vacío y Residuos de Memoria:
                </h4>
                <div className="space-y-1.5">
                  {selectedSystem.knownAnomalies.map((anom, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-950/20 rounded-sm border border-amber-900/30 text-amber-200/90 text-xs font-sans">
                      • {anom}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Star System Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Nuevo Sistema Estelar</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSystem} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Nombre del Sistema:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sistema Solaris-Theta"
                  value={newSys.name}
                  onChange={(e) => setNewSys({ ...newSys, name: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Coordenadas / Cuadrante:</label>
                  <input
                    type="text"
                    value={newSys.coordinates}
                    onChange={(e) => setNewSys({ ...newSys, coordinates: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Régimen DRM:</label>
                  <select
                    value={newSys.drmPolicy}
                    onChange={(e) => setNewSys({ ...newSys, drmPolicy: e.target.value as any })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  >
                    <option value="FOSS_LIBRE">FOSS Libre (Código Abierto)</option>
                    <option value="DRM_ORTODOXO_ESTRICTO">Ortodoxia Sacra / DRM Estricto</option>
                    <option value="ZONA_NEUTRAL_HACKEADA">Zona Neutral Hackeada</option>
                    <option value="ANARQUÍA_FRAGMENTADA">Anarquía Fragmentada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Ancho de Banda de Planck:</label>
                  <input
                    type="text"
                    placeholder="ej. 3,500 PFlops/m³"
                    value={newSys.bandwidthFlops}
                    onChange={(e) => setNewSys({ ...newSys, bandwidthFlops: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Estabilidad del Kernel (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newSys.kernelStabilityPercent}
                    onChange={(e) => setNewSys({ ...newSys, kernelStabilityPercent: parseInt(e.target.value) })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Ruinas Precursoras en el Sistema:</label>
                <textarea
                  rows={2}
                  placeholder="ej. Estación orbital abandonada que alberga una subrutina de aceleración solar..."
                  value={newSys.precursorRuins}
                  onChange={(e) => setNewSys({ ...newSys, precursorRuins: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Economía y Política:</label>
                <input
                  type="text"
                  placeholder="ej. Protectorado teocrático financiado por peajes de combustible de salto"
                  value={newSys.politicalControl}
                  onChange={(e) => setNewSys({ ...newSys, politicalControl: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Anomalía o Residuos de Memoria:</label>
                <input
                  type="text"
                  placeholder="ej. Ecos de luz retardada y distorsión inercial cerca del cinturón de cometas"
                  value={anomalyInput}
                  onChange={(e) => setAnomalyInput(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-sm bg-[#111114] text-slate-300 text-xs font-mono uppercase tracking-wider cursor-pointer border border-[#1e293b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Guardar Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
