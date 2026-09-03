import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, Shield, 
  Cpu, BookOpen, Tag, Sparkles, X, Check, Copy, UserCheck, AlertCircle
} from 'lucide-react';
import { NovelCharacter, Faction } from '../types';
import { CANONICAL_FACTIONS } from '../data/canonicalLore';
import { autosaveService } from '../services/autosaveService';

interface CharactersRosterViewProps {
  characters: NovelCharacter[];
  setCharacters: React.Dispatch<React.SetStateAction<NovelCharacter[]>>;
  onOpenChapterEditor?: () => void;
}

export const CharactersRosterView: React.FC<CharactersRosterViewProps> = ({
  characters,
  setCharacters,
  onOpenChapterEditor
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<string>('TODAS');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<NovelCharacter | null>(null);
  const [abilitiesInput, setAbilitiesInput] = useState<string>('');

  // Form State for Create / Edit
  const [formName, setFormName] = useState<string>('');
  const [formRole, setFormRole] = useState<string>('');
  const [formFactionId, setFormFactionId] = useState<string>(CANONICAL_FACTIONS[0]?.id || 'FOSS_COLLECTIVE');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formImplants, setFormImplants] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Helper map for factions
  const factionMap = useMemo(() => {
    const map = new Map<string, Faction>();
    CANONICAL_FACTIONS.forEach(f => map.set(f.id, f));
    return map;
  }, []);

  // Filtered list
  const filteredCharacters = useMemo(() => {
    return characters.filter(c => {
      const matchesFaction = selectedFaction === 'TODAS' || c.factionId === selectedFaction;
      const q = searchQuery.toLowerCase();
      const matchesQuery = !searchQuery || 
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.signatureImplants.toLowerCase().includes(q) ||
        (c.typicalAbilities && c.typicalAbilities.some(a => a.toLowerCase().includes(q)));
      return matchesFaction && matchesQuery;
    });
  }, [characters, selectedFaction, searchQuery]);

  // Open modal for NEW character
  const handleOpenCreateModal = () => {
    setEditingCharacter(null);
    setFormName('');
    setFormRole('');
    setFormFactionId(CANONICAL_FACTIONS[0]?.id || 'FOSS_COLLECTIVE');
    setFormSummary('');
    setFormImplants('');
    setAbilitiesInput('');
    setFormNotes('');
    setIsEditModalOpen(true);
  };

  // Open modal for EDIT character
  const handleOpenEditModal = (char: NovelCharacter) => {
    setEditingCharacter(char);
    setFormName(char.name);
    setFormRole(char.role);
    setFormFactionId(char.factionId);
    setFormSummary(char.summary);
    setFormImplants(char.signatureImplants || '');
    setAbilitiesInput((char.typicalAbilities || []).join(', '));
    setFormNotes(char.notes || '');
    setIsEditModalOpen(true);
  };

  // Save (Create or Edit)
  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedAbilities = abilitiesInput
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    let updatedList: NovelCharacter[];

    if (editingCharacter) {
      // Update existing
      updatedList = characters.map(c => {
        if (c.id === editingCharacter.id) {
          return {
            ...c,
            name: formName.trim(),
            role: formRole.trim(),
            factionId: formFactionId,
            summary: formSummary.trim(),
            signatureImplants: formImplants.trim(),
            typicalAbilities: parsedAbilities,
            notes: formNotes.trim()
          };
        }
        return c;
      });
    } else {
      // Create new
      const newChar: NovelCharacter = {
        id: `CHAR_${Date.now().toString(36).toUpperCase()}`,
        name: formName.trim(),
        role: formRole.trim() || 'Operador / Protagonista',
        factionId: formFactionId,
        summary: formSummary.trim() || 'Sin biografía disponible.',
        signatureImplants: formImplants.trim() || 'Implante de enlace cuántico estándar.',
        typicalAbilities: parsedAbilities.length > 0 ? parsedAbilities : ['Compilación de Planck'],
        notes: formNotes.trim()
      };
      updatedList = [...characters, newChar];
    }

    setCharacters(updatedList);
    autosaveService.scheduleSave('krnl_characters_v1', updatedList);
    setIsEditModalOpen(false);
  };

  // Delete
  const handleDeleteCharacter = (charId: string, charName: string) => {
    if (characters.length <= 1) {
      alert('Debes conservar al menos un personaje en el elenco de la novela.');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar al personaje "${charName}"? Esta acción se sincronizará con el autoguardado.`)) {
      const remaining = characters.filter(c => c.id !== charId);
      setCharacters(remaining);
      autosaveService.scheduleSave('krnl_characters_v1', remaining);
    }
  };

  // Duplicate
  const handleDuplicateCharacter = (char: NovelCharacter) => {
    const copy: NovelCharacter = {
      ...char,
      id: `CHAR_${Date.now().toString(36).toUpperCase()}`,
      name: `${char.name} (Copia)`,
      notes: `${char.notes ? char.notes + '\n' : ''}[Duplicado de ${char.name}]`
    };
    const nextList = [...characters, copy];
    setCharacters(nextList);
    autosaveService.scheduleSave('krnl_characters_v1', nextList);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0f] text-slate-200 font-sans">
      {/* Top Header */}
      <div className="p-6 border-b border-[#1e293b] bg-[#0d0e14]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-mono tracking-wide flex items-center gap-2">
                <span>ELENCO DE PERSONAJES & OPERADORES</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  {characters.length} Canónicos
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Fichas completas, lealtades de facción, implantes de compilación y roles dramáticos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-lg shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Personaje</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 border-b border-[#1e293b] bg-[#090b10] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, rol, implantes o habilidades..."
              className="w-full bg-[#12141c] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Facción:
          </span>
          <button
            onClick={() => setSelectedFaction('TODAS')}
            className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
              selectedFaction === 'TODAS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-white bg-[#12141c] border border-slate-800'
            }`}
          >
            Todas ({characters.length})
          </button>
          {CANONICAL_FACTIONS.map(f => {
            const count = characters.filter(c => c.factionId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFaction(f.id)}
                className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
                  selectedFaction === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'text-slate-400 hover:text-white bg-[#12141c] border border-slate-800'
                }`}
              >
                {f.shortName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Roster Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-16 bg-[#0e1118]/50 border border-dashed border-slate-800 rounded-xl">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300 font-mono mb-1">
              No se encontraron personajes
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Prueba con otro término de búsqueda o limpia los filtros activos.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedFaction('TODAS'); }}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white rounded-lg transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCharacters.map((char) => {
              const faction = factionMap.get(char.factionId);
              const badgeColor = faction?.badgeColor || 'border-cyan-500 text-cyan-400';

              return (
                <div
                  key={char.id}
                  className="bg-[#0e1118] border border-[#1e293b] hover:border-cyan-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-cyan-950/20"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold font-mono text-base">
                          {char.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                            {char.name}
                          </h3>
                          <div className="text-[11px] text-cyan-400 font-medium">
                            {char.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(char)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-md transition-colors"
                          title="Editar ficha"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateCharacter(char)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-colors"
                          title="Duplicar personaje"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCharacter(char.id, char.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
                          title="Eliminar personaje"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Faction Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                        <Shield className="w-3 h-3" />
                        <span>{faction?.name || char.factionId}</span>
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                      {char.summary}
                    </p>

                    {/* Implants & Abilities */}
                    <div className="space-y-2 mb-4 text-[11px] font-mono bg-[#090b10] p-2.5 rounded-lg border border-slate-900">
                      {char.signatureImplants && (
                        <div className="flex items-start gap-1.5 text-slate-400">
                          <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="truncate">{char.signatureImplants}</span>
                        </div>
                      )}
                      {char.typicalAbilities && char.typicalAbilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {char.typicalAbilities.slice(0, 3).map((ab, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-300">
                              {ab}
                            </span>
                          ))}
                          {char.typicalAbilities.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-slate-500">
                              +{char.typicalAbilities.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer / Quick Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> @{char.name.toLowerCase().replace(/\s+/g, '_')}
                    </span>
                    {onOpenChapterEditor && (
                      <button
                        onClick={onOpenChapterEditor}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3 h-3" /> Ir al Editor
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Character Modal */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#0d1017] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#090b10] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  {editingCharacter ? `Editar Personaje: ${editingCharacter.name}` : 'Crear Nuevo Personaje'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCharacter} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">NOMBRE COMPLETO:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Kaelen Voss"
                    className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">ROL DRAMÁTICO / TÍTULO:</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Ej: Inyector de Vacío / Depurador Proscrito"
                    className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">FACCIÓN O LEALTAD:</label>
                <select
                  value={formFactionId}
                  onChange={(e) => setFormFactionId(e.target.value)}
                  className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {CANONICAL_FACTIONS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">BIOGRAFÍA & RESUMEN:</label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Historia breve, motivación personal, conflicto de intereses..."
                  className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">IMPLANTES / TECNOLOGÍA DISTINTIVA:</label>
                  <input
                    type="text"
                    value={formImplants}
                    onChange={(e) => setFormImplants(e.target.value)}
                    placeholder="Ej: Neural Shunt L2, Disipador Criogénico"
                    className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">HABILIDADES TÍPICAS (separadas por coma):</label>
                  <input
                    type="text"
                    value={abilitiesInput}
                    onChange={(e) => setAbilitiesInput(e.target.value)}
                    placeholder="Ej: Desplazamiento FTL, Salto Planck, Inversión Térmica"
                    className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">NOTAS SECRETAS / ARCO DRAMÁTICO:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Secretos que el lector descubre más adelante, debilidades, traiciones planeadas..."
                  className="w-full bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-sans"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-md shadow-cyan-950/50"
                >
                  {editingCharacter ? 'Guardar Cambios' : 'Crear Personaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
