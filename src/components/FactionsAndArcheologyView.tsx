import React, { useState } from 'react';
import { CANONICAL_FACTIONS } from '../data/canonicalLore';
import { Faction } from '../types';
import { Shield, Users, Crosshair, HardDrive, Compass, Plus, Trash2, CheckCircle2, Bookmark } from 'lucide-react';

interface CustomCharacter {
  id: string;
  name: string;
  factionId: string;
  role: string;
  implants: string;
  terminalTool: string;
  archeologicalMission: string;
  personalConflict: string;
}

export const FactionsAndArcheologyView: React.FC = () => {
  const [selectedFaction, setSelectedFaction] = useState<Faction>(CANONICAL_FACTIONS[0]);
  const [characters, setCharacters] = useState<CustomCharacter[]>([
    {
      id: 'CHAR_01',
      name: 'Dra. Sura Vance',
      factionId: 'FOSS_COLLECTIVE',
      role: 'Cripto-Arqueóloga Principal',
      implants: 'Coprocesador neural suboccipital de 64 núcleos con puerto de fibra y purga de nitrógeno.',
      terminalTool: 'Slate de grafeno con teclado mecánico desmontable y firmware libre lib_planck_open.',
      archeologicalMission: 'Descifrar la librería de métrica gravitacional en la luna helada de Tychos-4.',
      personalConflict: 'Su hermana mayor es Inquisidora del Root en la flota pontificia.'
    },
    {
      id: 'CHAR_02',
      name: 'Cardenal-Sysadmin Malichor',
      factionId: 'SACRED_ROOT',
      role: 'Prefecto de la Inquisición Ontológica',
      implants: 'Ojo de validación criptográfica con clave pública sagrada incrustada en retina.',
      terminalTool: 'Báculo ceremonial superconductor de oro y rodio con transmisor de DRM orbital.',
      archeologicalMission: 'Sellar y purgar con plasma el yacimiento precursor de Xylar.',
      personalConflict: 'Sospecha en secreto que el código original de los Arquitectos fue concebido sin DRM.'
    }
  ]);

  // Form to add custom character
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newChar, setNewChar] = useState<Partial<CustomCharacter>>({
    name: '',
    factionId: 'FOSS_COLLECTIVE',
    role: '',
    implants: '',
    terminalTool: '',
    archeologicalMission: '',
    personalConflict: ''
  });

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name || !newChar.role) return;

    const created: CustomCharacter = {
      id: `CHAR_${Date.now()}`,
      name: newChar.name || 'Nuevo Personaje',
      factionId: newChar.factionId || 'FOSS_COLLECTIVE',
      role: newChar.role || 'Arqueólogo',
      implants: newChar.implants || 'Implante de compilación estándar.',
      terminalTool: newChar.terminalTool || 'Terminal portátil reforzada.',
      archeologicalMission: newChar.archeologicalMission || 'Búsqueda de librerías del sustrato.',
      personalConflict: newChar.personalConflict || 'Dilema ético frente a la distribución de tecnomagia.'
    };

    setCharacters([created, ...characters]);
    setNewChar({
      name: '',
      factionId: 'FOSS_COLLECTIVE',
      role: '',
      implants: '',
      terminalTool: '',
      archeologicalMission: '',
      personalConflict: ''
    });
    setShowAddForm(false);
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Factions Section Header - Geometric Balance with background dot pattern */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-emerald-950/30 border border-emerald-800/80 text-emerald-400 text-xs font-mono mb-2 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            CONFRONTACIÓN_IDEOLÓGICA // FOSS_VS_ROOT_DRM
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
            El Conflicto: Código Abierto vs. DRM Ontológico
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            La guerra central de tu historia no es un clásico choque de imperios por territorio, sino una 
            <strong className="text-white"> lucha por el control de los permisos de superusuario de la realidad</strong>. 
            ¿Debe el Sustrato ser desensamblado y liberado para todos los seres sintientes, o custodiado por un sacerdocio monopolista?
          </p>
        </div>
      </div>

      {/* Faction Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CANONICAL_FACTIONS.map((f) => {
          const isSelected = selectedFaction.id === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFaction(f)}
              className={`p-4 rounded-sm border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? f.id === 'FOSS_COLLECTIVE'
                    ? 'bg-emerald-950/30 border-emerald-500 border-l-4 border-l-emerald-400 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : f.id === 'SACRED_ROOT'
                    ? 'bg-amber-950/30 border-amber-500 border-l-4 border-l-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-cyan-950/30 border-cyan-500 border-l-4 border-l-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-[#0d0d0f] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                  f.id === 'FOSS_COLLECTIVE' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60' :
                  f.id === 'SACRED_ROOT' ? 'bg-amber-900/80 text-amber-300 border border-amber-700/60' :
                  'bg-cyan-900/80 text-cyan-300 border border-cyan-700/60'
                }`}>
                  {f.shortName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">FACTION_ID</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5 font-mono uppercase tracking-wide">{f.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3 font-sans">
                {f.ideology}
              </p>
              <div className="text-[10px] font-mono italic text-slate-400 border-t border-[#1e293b] pt-2">
                "{f.motto}"
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Faction Detailed Dossier */}
      <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 mb-0.5 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              EXPEDIENTE_ESTRATÉGICO // DOCTRINA
            </div>
            <h3 className="text-base sm:text-lg font-bold font-mono text-white uppercase tracking-tight">{selectedFaction.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-sm bg-[#111114] text-slate-300 border border-[#1e293b]">
              LEMA: <strong className="text-white">"{selectedFaction.motto}"</strong>
            </span>
          </div>
        </div>

        {/* Detailed Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1 tracking-wider">
                Postura frente al DRM de la Realidad:
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#111114] p-3 rounded-sm border border-[#1e293b]">
                {selectedFaction.drmStance}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1 tracking-wider">
                Tecnología de Compilación & Hardware de Campo:
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#111114] p-3 rounded-sm border border-[#1e293b]">
                {selectedFaction.compilerTech}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1 tracking-wider">
                Doctrina de Combate & Guerra de Exploits:
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#111114] p-3 rounded-sm border border-[#1e293b]">
                {selectedFaction.combatDoctrine}
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1 tracking-wider">
                Método de Arqueología y Excavación:
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#111114] p-3 rounded-sm border border-[#1e293b]">
                {selectedFaction.archeologyMethod}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2 tracking-wider">
                Arquetipos Clave de la Facción (Personajes Típicos):
              </label>
              <div className="space-y-2">
                {selectedFaction.keyArchetypes.map((arch, idx) => (
                  <div key={idx} className="p-3 bg-[#111114] rounded-sm border border-[#1e293b] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-cyan-400 font-mono uppercase text-[11px]">{arch.title}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{arch.role}</span>
                    </div>
                    <p className="text-slate-300 mb-1.5 text-xs font-sans">{arch.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      <strong className="text-slate-300">IMPLANTES:</strong> {arch.typicalImplants}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character and Expedition Roster */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Fichas de Personajes y Arqueólogos de tu Libro
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Crea los protagonistas y antagonistas de tus expediciones con sus implantes específicos y terminales.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Cancelar' : 'Nueva Ficha'}
          </button>
        </div>

        {/* Create Character Form */}
        {showAddForm && (
          <form onSubmit={handleAddCharacter} className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Nueva Ficha de Personaje</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Dra. Lyra Thorne"
                  value={newChar.name}
                  onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Facción:</label>
                <select
                  value={newChar.factionId}
                  onChange={(e) => setNewChar({ ...newChar, factionId: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                >
                  <option value="FOSS_COLLECTIVE">Arqueólogos FOSS (Código Abierto)</option>
                  <option value="SACRED_ROOT">Ortodoxia Sacra (Sacerdocio del Root)</option>
                  <option value="VOID_CORSAIRS">Corsarios del Buffer Libre</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Rol / Especialidad:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Depuradora de Inercia / Piloto de Salto"
                  value={newChar.role}
                  onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Implantes Neurales & Co-procesadores:</label>
                <input
                  type="text"
                  placeholder="ej. Chip cuántico de compilación L2 con purga criogénica en clavícula"
                  value={newChar.implants}
                  onChange={(e) => setNewChar({ ...newChar, implants: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Terminal de Mano / Herramienta de Inyección:</label>
                <input
                  type="text"
                  placeholder="ej. Slate rígida de aleación cerámica con cable óptico a la columna"
                  value={newChar.terminalTool}
                  onChange={(e) => setNewChar({ ...newChar, terminalTool: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Misión Arqueológica Actual:</label>
                <input
                  type="text"
                  placeholder="ej. Recuperar el dump de memoria del satélite precursor 0xAF"
                  value={newChar.archeologicalMission}
                  onChange={(e) => setNewChar({ ...newChar, archeologicalMission: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Conflicto Personal / Tensión Dramática:</label>
                <input
                  type="text"
                  placeholder="ej. Su implante tiene un memory leak que le causa alucinaciones matemáticas"
                  value={newChar.personalConflict}
                  onChange={(e) => setNewChar({ ...newChar, personalConflict: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-sm bg-[#111114] text-slate-300 text-xs font-mono uppercase tracking-wider cursor-pointer border border-[#1e293b]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                Guardar Personaje
              </button>
            </div>
          </form>
        )}

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {characters.map((char) => {
            const fac = CANONICAL_FACTIONS.find(f => f.id === char.factionId);
            return (
              <div
                key={char.id}
                className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 relative group hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      char.factionId === 'FOSS_COLLECTIVE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                      char.factionId === 'SACRED_ROOT' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                      'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                    }`}>
                      {fac?.shortName || char.factionId}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 font-mono uppercase tracking-wide">{char.name}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono">{char.role}</p>
                  </div>
                  <button
                    onClick={() => removeCharacter(char.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-opacity cursor-pointer"
                    title="Eliminar personaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                    <span className="text-slate-400 font-mono block mb-0.5 font-bold uppercase text-[10px]">Implantes:</span>
                    <span className="text-slate-300 font-sans text-xs">{char.implants}</span>
                  </div>

                  <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                    <span className="text-slate-400 font-mono block mb-0.5 font-bold uppercase text-[10px]">Terminal / Interfaz:</span>
                    <span className="text-slate-300 font-sans text-xs">{char.terminalTool}</span>
                  </div>

                  <div className="bg-[#111114] p-2.5 rounded-sm border border-[#1e293b]">
                    <span className="text-emerald-400 font-mono block mb-0.5 font-bold uppercase text-[10px]">Misión Arqueológica:</span>
                    <span className="text-slate-300 font-sans text-xs">{char.archeologicalMission}</span>
                  </div>

                  <div className="bg-red-950/20 p-2.5 rounded-sm border border-red-900/30 text-red-200">
                    <span className="text-red-400 font-mono block mb-0.5 font-bold uppercase text-[10px]">Conflicto & Tensión:</span>
                    <span className="text-slate-300 font-sans text-xs">{char.personalConflict}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
