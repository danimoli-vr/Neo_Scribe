import React, { useState } from 'react';
import { CANONICAL_AXIOMS, UNIVERSAL_CONSTANTS, CANONICAL_SYSCALLS } from '../data/canonicalLore';
import { UniversalConstant, Syscall } from '../types';
import { Layers, Cpu, ShieldAlert, Zap, Terminal, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

export const SubstrateArchitectureView: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(0);
  const [selectedConstant, setSelectedConstant] = useState<UniversalConstant | null>(UNIVERSAL_CONSTANTS[0]);
  const [selectedSyscall, setSelectedSyscall] = useState<Syscall | null>(CANONICAL_SYSCALLS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('TODAS');

  const layers = [
    {
      level: 0,
      title: 'Capa 0: El Sustrato de Planck (Kernel de la Realidad)',
      subtitle: 'Malla primordial invisible a escala 10⁻³⁵ m',
      description: 'Permea todo el vacío. Compila continuamente las constantes físicas universales (c, G, ℏ, entropía). No es misticismo ni energía espiritual: es la infraestructura de cómputo sobre la cual se renderiza la materia.',
      tag: 'KERNEL BASE'
    },
    {
      level: 1,
      title: 'Capa 1: Relés y Controladores Precursores (HAL)',
      subtitle: 'Hardware Abstracto de la Civilización Primigenia',
      description: 'Nodos, cristales de cómputo de vacío y megaestructuras que conectan el sustrato cuántico con la escala macroscópica. Actúan como la placa base y los buses de datos del universo.',
      tag: 'HARDWARE'
    },
    {
      level: 2,
      title: 'Capa 2: Motor de Syscalls y Librerías de Materia',
      subtitle: 'Conjunto de instrucciones ontológicas primitivas',
      description: 'Las llamadas al sistema primordiales (`sys_thermal_clamp`, `sys_inertia_null`). Permiten sobreescribir temporalmente registros locales a cambio de compute y disipación de calor.',
      tag: 'API PRIMORDIAL'
    },
    {
      level: 3,
      title: 'Capa 3: Interfaces e Implantes de Compilación',
      subtitle: 'Herramientas de los "Magos" (Inyectores y Depuradores)',
      description: 'Coprocesadores biológicos, terminales rígidas "slates de debug" y acoples neurales. Traducen el pensamiento y el código del operador en paquetes de inyección que el sustrato acepta.',
      tag: 'INTERFACES'
    },
    {
      level: 4,
      title: 'Capa 4: Exploits, Scripts y Parches en Caliente',
      subtitle: 'La Tecnomagia Aplicada y la Ciberguerra',
      description: 'El nivel de combate e investigación: race conditions en naves, desensamblado de blindajes, trampas de desbordamiento de búfer y campos de contención.',
      tag: 'APLICACIONES'
    }
  ];

  const categories = ['TODAS', 'TERMODINÁMICA', 'INERCIA', 'ESPACIO_TIEMPO', 'MEMORIA_MATERIA'];
  const filteredSyscalls = activeCategory === 'TODAS'
    ? CANONICAL_SYSCALLS
    : CANONICAL_SYSCALLS.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-10">
      {/* Header Banner - Geometric Balance with radial grid background */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-6 relative overflow-hidden bg-grid-dots">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Terminal className="w-56 h-56 text-cyan-400" />
        </div>
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/40 border border-cyan-800/80 text-cyan-400 text-xs font-mono mb-3 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            ARQUITECTURA_ONTOLÓGICA // L0_L4_CORE_STACK
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
            El Kernel de la Realidad y sus Capas de Operación
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            En este universo, no existe la magia como fuerza mística ni el maná espiritual. Toda alteración de la física es una 
            <span className="text-cyan-400 font-semibold"> excepción forzada en los registros del sustrato</span>. Para que tu novela sea 
            impecablemente sólida, cada efecto debe obedecer estas capas, respetar la termodinámica y calcular su coste de procesamiento.
          </p>
        </div>
      </div>

      {/* Layer Interactive Explorer */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-[#1e293b] pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            Pila de Ejecución del Sustrato (Capas L0 a L4)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
            SELECCIONA_CAPA // INSPECCIÓN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {layers.map((layer) => {
            const isActive = selectedLayer === layer.level;
            return (
              <button
                key={layer.level}
                onClick={() => setSelectedLayer(layer.level)}
                className={`text-left p-3.5 rounded-sm border transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500 border-l-4 border-l-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-100'
                    : 'bg-[#0d0d0f] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a] text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    isActive ? 'bg-cyan-500 text-black' : 'bg-[#1e293b] text-slate-300'
                  }`}>
                    {layer.tag}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-bold">L{layer.level}</span>
                </div>
                <h4 className={`text-xs font-bold mb-1 line-clamp-1 uppercase tracking-wide font-mono ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {layer.title.split(':')[1] || layer.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{layer.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Detail Box */}
        <div className="mt-3 p-4 sm:p-5 rounded-sm bg-[#0d0d0f] border border-[#1e293b] flex flex-col md:flex-row gap-5 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-cyan-950/80 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
                CAPA L{selectedLayer}
              </span>
              <h4 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                {layers[selectedLayer].title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              {layers[selectedLayer].description}
            </p>
          </div>
          <div className="w-full md:w-80 bg-[#111114] rounded-sm p-3.5 border border-[#1e293b] text-xs font-mono space-y-2 text-slate-400">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">RESTRICCIÓN DE ESCRITURA:</div>
            <div>• <span className="text-slate-300">Permisos:</span> {selectedLayer === 0 ? 'Exclusivo del Kernel Primordial' : selectedLayer === 1 ? 'Hardware Precursor / Relés' : selectedLayer === 2 ? 'Syscalls Homologadas' : 'Inyectores y Slates'}</div>
            <div>• <span className="text-slate-300">Riesgo si falla:</span> {selectedLayer <= 1 ? 'Colapso métrico universal' : selectedLayer === 2 ? 'Kernel Panic sectorial' : 'Memory Leak / Fritura neural'}</div>
          </div>
        </div>
      </div>

      {/* Axioms of Worldbuilding */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 border-b border-[#1e293b] pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Axiomas Físicos Inviolables (Evita Incoherencias en tu Libro)
          </h3>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-semibold">
            HARD_SF // REGLAS_BASE
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CANONICAL_AXIOMS.map((axiom) => (
            <div key={axiom.id} className="bg-[#0d0d0f] border border-[#1e293b] hover:border-amber-500/50 rounded-sm p-4 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">{axiom.id}</span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-amber-950/40 text-amber-400 border border-amber-800/60 font-semibold tracking-wider">
                    AXIOMA CANÓNICO
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono mb-1">{axiom.name}</h4>
                <p className="text-xs text-amber-300/90 font-mono mb-2">{axiom.summary}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{axiom.rule}</p>
              </div>
              <div className="mt-2 pt-2.5 border-t border-[#1e293b] text-[11px] text-slate-400 bg-[#111114] -mx-4 -mb-4 p-3 rounded-b-sm font-mono">
                <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Manifestación en prosa:</span>
                <span className="italic text-slate-300">"{axiom.narrativeSign}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Constants Register Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 space-y-3">
          <div className="border-b border-[#1e293b] pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Mapa de Registros de Constantes Universales
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Los inyectores sobreescriben temporalmente estos registros en la malla de Planck.
            </p>
          </div>

          <div className="space-y-1.5">
            {UNIVERSAL_CONSTANTS.map((c) => {
              const isSelected = selectedConstant?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConstant(c)}
                  className={`p-3 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 border-l-4 border-l-cyan-400'
                      : 'bg-[#0d0d0f] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-sm bg-[#111114] text-cyan-400 font-mono font-bold flex items-center justify-center text-xs border border-[#1e293b]">
                        {c.symbol}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">{c.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-500/80">{c.registerAddress}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 px-2 py-0.5 bg-[#111114] rounded-sm border border-[#1e293b]">
                      {c.nominalValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Constant Detailed Inspector */}
        <div className="lg:col-span-6">
          {selectedConstant ? (
            <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-bold font-mono text-cyan-400">{selectedConstant.symbol}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">{selectedConstant.name}</h4>
                      <p className="text-[10px] font-mono text-cyan-500">{selectedConstant.registerAddress}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#111114] text-slate-300 border border-[#1e293b]">
                    Nominal: {selectedConstant.nominalValue}
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-green-400 font-bold flex items-center gap-1.5 mb-1 tracking-wider">
                      <Zap className="w-3 h-3" />
                      Potencial de Exploit en Combate / Trama:
                    </label>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#111114] p-3 rounded-sm border border-[#1e293b]">
                      {selectedConstant.exploitPotential}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-red-400 font-bold flex items-center gap-1.5 mb-1 tracking-wider">
                      <AlertTriangle className="w-3 h-3" />
                      Peligro de Kernel Panic / Efecto Catastrófico:
                    </label>
                    <p className="text-xs text-red-200/90 leading-relaxed bg-red-950/20 p-3 rounded-sm border border-red-900/30">
                      {selectedConstant.panicRisk}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1e293b] text-[10px] font-mono text-slate-500 flex items-center justify-between uppercase tracking-wider">
                <span>Capa: <strong className="text-slate-300">{selectedConstant.layer}</strong></span>
                <span className="text-cyan-400">STATUS: DETERMINISTIC_LOCK</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-8 text-center text-slate-500 font-mono text-xs">
              Selecciona una constante para ver su manual de exploit y riesgos.
            </div>
          )}
        </div>
      </div>

      {/* Syscall API Reference */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#1e293b] pb-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Librerías de Realidad y Syscalls Canónicas
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Los "hechizos" que los personajes ejecutan mediante sus terminales portátiles o implantes neurales.
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] px-2.5 py-1 rounded-sm font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-black font-bold border-cyan-500'
                    : 'bg-[#0d0d0f] text-slate-400 hover:text-slate-200 border-[#1e293b]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredSyscalls.map((syscall) => (
            <div
              key={syscall.id}
              className="bg-[#0d0d0f] border border-[#1e293b] hover:border-cyan-500/50 rounded-sm p-4 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-300 font-bold bg-[#111114] px-2 py-0.5 rounded-sm border border-cyan-900/50">
                  {syscall.name}
                </span>
                <span className="text-[9px] uppercase font-mono text-slate-400 bg-[#1e293b] px-1.5 py-0.5 rounded-sm tracking-wider">
                  {syscall.category}
                </span>
              </div>

              <pre className="text-xs font-mono bg-[#111114] p-2 rounded-sm border border-[#1e293b] text-green-400 overflow-x-auto my-2">
                <code>{syscall.signature}</code>
              </pre>

              <p className="text-xs text-slate-300 leading-relaxed mb-3 font-sans">
                {syscall.description}
              </p>

              {/* Resource specifications */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-sm bg-[#111114] border border-[#1e293b] text-center font-mono text-xs mb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">COMPUTE</div>
                  <div className="text-cyan-400 font-bold">{syscall.computeCostMFlops} MFlops</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">RAM ÁREA</div>
                  <div className="text-amber-400 font-bold">{syscall.ramAreaKb} KB</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">RIESGO LEAK</div>
                  <div className="text-red-400 font-bold">{syscall.leakRiskPercent}%</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-red-300/90 text-[11px]">
                  <span className="font-bold text-red-400 uppercase tracking-wider">TRIGGER DE PANIC:</span> {syscall.panicTrigger}
                </div>
                <div className="text-slate-400 bg-[#111114] p-2 rounded-sm border border-[#1e293b] text-[11px]">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider">SENSACIÓN SENSORIAL:</span> {syscall.sensorySensation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
