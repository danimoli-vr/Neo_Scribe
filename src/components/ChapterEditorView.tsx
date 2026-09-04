import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Clock, Network, Plus, Upload, User } from 'lucide-react';
import { Chapter, NovelCharacter, ChapterSnapshot } from '../types';
import {
  CANONICAL_STAR_SYSTEMS,
  CANONICAL_SYSCALLS,
  CANONICAL_EXPLOITS
} from '../data/canonicalLore';
import { getUnifiedConceptDictionary, ConceptTerm, countOccurrencesInText } from '../data/conceptDictionary';
import { ManuscriptImportModal } from './ManuscriptImportModal';
import { ChapterListSidebar } from './ChapterListSidebar';
import { ChapterTextEditorPanel, AutocompleteState } from './ChapterTextEditorPanel';
import { ChapterReferencePanel, ReferenceTab } from './ChapterReferencePanel';
import { NewCharacterModal } from './NewCharacterModal';
import { ChapterSnapshotsModal } from './ChapterSnapshotsModal';
import { editorMetricsService } from '../services/editorMetricsService';
import { readJSON, writeJSON, isArray } from '../utils/safeStorage';
import { useNovelData } from '../store/NovelDataContext';

interface ChapterEditorViewProps {
  onSendToAuditor?: (text: string, title: string) => void;
  onOpenGraph?: () => void;
  onOpenTimeline?: () => void;
  initialChapterNumber?: number | null;
}

/**
 * The manuscript's chapter editor. This is the busiest screen in the app, so
 * its rendering is split across a handful of focused components:
 * - ChapterListSidebar: the filterable chapter index (left column)
 * - ChapterTextEditorPanel: toolbar + title + main textarea (center column)
 * - ChapterReferencePanel: the tabbed dictionary/environment/characters/
 *   abilities/coherence matrix (right column)
 * - NewCharacterModal / ChapterSnapshotsModal: the two modals
 *
 * All state, persistence and business logic stays here — the pieces above
 * are presentational and just receive data + callbacks as props.
 */
export const ChapterEditorView: React.FC<ChapterEditorViewProps> = ({
  onSendToAuditor,
  onOpenGraph,
  onOpenTimeline,
  initialChapterNumber
}) => {
  // Shared novel data (single source of truth — see NovelDataContext). This
  // component still keeps its own local `chapters`/`characters` state below,
  // seeded from the shared context, so every keystroke stays instantly
  // responsive without forcing other views (graph, timeline) to recompute
  // their expensive derived data on every character typed. Local edits are
  // pushed back into the shared context inside the debounced save effects
  // further down, exactly like they were pushed to localStorage before.
  const {
    chapters: sharedChapters,
    characters: sharedCharacters,
    setChapters: setSharedChapters,
    setCharacters: setSharedCharacters,
  } = useNovelData();

  // Persistence for Chapters
  const [chapters, setChapters] = useState<Chapter[]>(sharedChapters);

  // Persistence for Characters
  const [characters, setCharacters] = useState<NovelCharacter[]>(sharedCharacters);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return chapters[0]?.id || 'CHAP_01';
  });

  // Sync initialChapterNumber if navigated from Graph
  useEffect(() => {
    if (initialChapterNumber !== undefined && initialChapterNumber !== null) {
      const match = chapters.find(c => c.number === initialChapterNumber);
      if (match) {
        setSelectedChapterId(match.id);
      }
    }
  }, [initialChapterNumber, chapters]);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI Modes
  const [typographyMode, setTypographyMode] = useState<'mono' | 'prose'>('mono');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [activeReferenceTab, setActiveReferenceTab] = useState<ReferenceTab>('DICCIONARIO');

  // Editor Ref & Autocomplete Engine
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState | null>(null);
  const [showAutocompleteBar, setShowAutocompleteBar] = useState<boolean>(true);

  // Modals & Feedback
  const [showNewCharModal, setShowNewCharModal] = useState<boolean>(false);
  const [copiedChapter, setCopiedChapter] = useState<boolean>(false);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<ChapterSnapshot[]>(() =>
    readJSON<ChapterSnapshot[]>('krnl_chapter_snapshots_v1', [], isArray)
  );
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [snapshotNote, setSnapshotNote] = useState<string>('');
  const [previewingSnapshot, setPreviewingSnapshot] = useState<ChapterSnapshot | null>(null);

  // Manuscript Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // New Character Form state
  const [newChar, setNewChar] = useState<Partial<NovelCharacter>>({
    name: '',
    role: '',
    factionId: 'FOSS_COLLECTIVE',
    summary: '',
    signatureImplants: '',
    notes: ''
  });

  const isInitialChaptersMount = useRef(true);
  const isInitialCharsMount = useRef(true);

  // Autosave to localStorage debounced to 3 seconds of typing silence, and
  // propagate to the shared context so other views pick it up once it lands.
  useEffect(() => {
    if (isInitialChaptersMount.current) {
      isInitialChaptersMount.current = false;
      return;
    }
    setSharedChapters(chapters);
  }, [chapters]);

  useEffect(() => {
    if (isInitialCharsMount.current) {
      isInitialCharsMount.current = false;
      return;
    }
    setSharedCharacters(characters);
  }, [characters]);

  // Current active chapter
  const currentChapter = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  }, [chapters, selectedChapterId]);

  // Current star system of the active chapter
  const currentSystem = useMemo(() => {
    if (!currentChapter) return CANONICAL_STAR_SYSTEMS[0];
    return CANONICAL_STAR_SYSTEMS.find((s) => s.id === currentChapter.systemId) || CANONICAL_STAR_SYSTEMS[0];
  }, [currentChapter]);

  // Characters in the current scene
  const sceneCharacters = useMemo(() => {
    if (!currentChapter) return [];
    return characters.filter((char) => currentChapter.characterIds.includes(char.id));
  }, [currentChapter, characters]);

  // Abilities used in current scene (syscalls & exploits)
  const sceneAbilities = useMemo(() => {
    if (!currentChapter) return { syscalls: [], exploits: [] };
    const syscalls = CANONICAL_SYSCALLS.filter((s) => currentChapter.abilityIds.includes(s.id));
    const exploits = CANONICAL_EXPLOITS.filter((e) => currentChapter.abilityIds.includes(e.id));
    return { syscalls, exploits };
  }, [currentChapter]);

  // Filtered chapters list
  const filteredChapters = useMemo(() => {
    return chapters.filter((chap) => {
      const matchesStatus = statusFilter === 'TODOS' || chap.status === statusFilter;
      const matchesQuery = !searchQuery ||
        chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chap.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chap.locationDetails.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [chapters, statusFilter, searchQuery]);

  // Concept Dictionary Integration
  const unifiedConcepts = useMemo(() => {
    return getUnifiedConceptDictionary(characters);
  }, [characters]);

  const activeConceptsCount = useMemo(() => {
    if (!currentChapter?.content) return 0;
    return unifiedConcepts.filter(c => countOccurrencesInText(currentChapter.content, c) > 0).length;
  }, [unifiedConcepts, currentChapter?.content]);

  // Insert a term or code snippet at current editor cursor position
  const handleInsertTermAtCursor = (termText: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = currentChapter?.content || '';
      const newContent = currentText.substring(0, start) + termText + currentText.substring(end);
      updateCurrentChapter({ content: newContent });
      setTimeout(() => {
        textarea.focus();
        const newPos = start + termText.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 10);
    } else if (currentChapter) {
      updateCurrentChapter({ content: currentChapter.content + (currentChapter.content ? ' ' : '') + termText });
    }
  };

  // Apply chosen autocomplete term
  const applyAutocomplete = (term: ConceptTerm) => {
    const textarea = textareaRef.current;
    if (!textarea || !autocompleteState) {
      handleInsertTermAtCursor(term.name);
      return;
    }

    const { prefixIndex, query, triggerChar } = autocompleteState;
    const wordLength = triggerChar.length + query.length;
    const currentText = currentChapter.content;

    const before = currentText.substring(0, prefixIndex);
    const after = currentText.substring(prefixIndex + wordLength);
    const insertText = term.name;
    const newContent = before + insertText + after;

    updateCurrentChapter({ content: newContent });
    setAutocompleteState(null);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = prefixIndex + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Trigger Autocomplete while typing in editor
  const handleContentChange = (newContent: string) => {
    updateCurrentChapter({ content: newContent });

    if (!showAutocompleteBar) {
      setAutocompleteState(null);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Check position right at the end of input or selection
    const cursor = textarea.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursor);

    // Look for token immediately preceding cursor
    const match = textBeforeCursor.match(/(?:^|[\s\n])([@/]?[\wáéíóúÁÉÍÓÚñÑ_]+)$/);

    if (match) {
      const rawWord = match[1];
      const triggerChar = rawWord.startsWith('@') ? '@' : rawWord.startsWith('/') ? '/' : '';
      const cleanWord = triggerChar ? rawWord.slice(1).toLowerCase() : rawWord.toLowerCase();
      const prefixIndex = cursor - rawWord.length;

      if (triggerChar === '@') {
        const matches = unifiedConcepts.filter(c =>
          c.category === 'PERSONAJE' &&
          (c.name.toLowerCase().includes(cleanWord) || c.aliases.some(a => a.includes(cleanWord)))
        ).slice(0, 6);

        if (matches.length > 0) {
          setAutocompleteState({ query: cleanWord, triggerChar: '@', prefixIndex, suggestions: matches, selectedIndex: 0 });
          return;
        }
      } else if (triggerChar === '/') {
        const matches = unifiedConcepts.filter(c =>
          (c.category === 'TECNOLOGIA' || c.category === 'ARTEFACTO' || c.category === 'AXIOMA') &&
          (c.name.toLowerCase().includes(cleanWord) || c.aliases.some(a => a.includes(cleanWord)))
        ).slice(0, 6);

        if (matches.length > 0) {
          setAutocompleteState({ query: cleanWord, triggerChar: '/', prefixIndex, suggestions: matches, selectedIndex: 0 });
          return;
        }
      } else if (cleanWord.length >= 3) {
        const matches = unifiedConcepts.filter(c =>
          c.name.toLowerCase().includes(cleanWord) || c.aliases.some(a => a.includes(cleanWord))
        ).slice(0, 5);

        if (matches.length > 0) {
          setAutocompleteState({ query: cleanWord, triggerChar: '', prefixIndex, suggestions: matches, selectedIndex: 0 });
          return;
        }
      }
    }

    setAutocompleteState(null);
  };

  // Keyboard navigation for autocomplete list
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autocompleteState && autocompleteState.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteState(prev => prev ? {
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % prev.suggestions.length
        } : null);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteState(prev => prev ? {
          ...prev,
          selectedIndex: (prev.selectedIndex - 1 + prev.suggestions.length) % prev.suggestions.length
        } : null);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && autocompleteState.triggerChar !== '')) {
        e.preventDefault();
        applyAutocomplete(autocompleteState.suggestions[autocompleteState.selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setAutocompleteState(null);
        return;
      }
    }
  };

  // Word & Reading time calculation
  const totalNovelWords = useMemo(() => {
    return chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  }, [chapters]);

  const readingTimeMinutes = useMemo(() => {
    if (!currentChapter) return 1;
    return Math.max(1, Math.round(currentChapter.wordCount / 200));
  }, [currentChapter]);

  // Handlers for modifying current chapter
  const updateCurrentChapter = (updates: Partial<Chapter>) => {
    if (!currentChapter) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Broadcast real-time metrics to status bar immediately with 0 delay
    if (updates.content !== undefined) {
      editorMetricsService.reportChapterTextChange({
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.number,
        chapterTitle: updates.title !== undefined ? updates.title : currentChapter.title,
        content: updates.content,
        allChapters: chapters
      });
    }

    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === currentChapter.id) {
          const next = { ...c, ...updates, updatedAt: timeStr };
          if (updates.content !== undefined) {
            const words = updates.content.trim() ? updates.content.trim().split(/\s+/).length : 0;
            next.wordCount = words;
          }
          return next;
        }
        return c;
      })
    );
  };

  // Sync real-time metrics when current chapter changes or editor is active
  useEffect(() => {
    editorMetricsService.setEditorActive(true);
    if (currentChapter) {
      editorMetricsService.reportChapterTextChange({
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.number,
        chapterTitle: currentChapter.title,
        content: currentChapter.content || '',
        allChapters: chapters
      });
    }
    return () => {
      editorMetricsService.setEditorActive(false);
    };
  }, [currentChapter?.id]);

  // Create new chapter
  const handleCreateChapter = () => {
    const nextNumber = chapters.length + 1;
    const newId = `CHAP_${Date.now().toString(36)}`;
    const newChap: Chapter = {
      id: newId,
      number: nextNumber,
      title: `Capítulo ${nextNumber}: [Título de Escena]`,
      status: 'BORRADOR',
      systemId: CANONICAL_STAR_SYSTEMS[0].id,
      locationDetails: 'Sector del espacio o instalación de investigación',
      characterIds: characters[0] ? [characters[0].id] : [],
      abilityIds: [CANONICAL_SYSCALLS[0].id],
      coherenceChecklist: {
        entropyRespected: false,
        bandwidthChecked: false,
        memoryLeaksCleaned: false,
        drmRulesRespected: false
      },
      authorNotes: 'Objetivo táctico o temático de la escena...',
      content: `Escribe aquí el inicio del Capítulo ${nextNumber}...`,
      wordCount: 8,
      updatedAt: 'Recién creado'
    };

    setChapters((prev) => [...prev, newChap]);
    setSelectedChapterId(newId);
  };

  // Delete chapter
  const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length <= 1) {
      alert('Debes mantener al menos un capítulo en la novela.');
      return;
    }
    if (confirm('¿Eliminar este capítulo de tu manuscrito?')) {
      const remaining = chapters.filter((c) => c.id !== id);
      setChapters(remaining);
      if (selectedChapterId === id) {
        setSelectedChapterId(remaining[0].id);
      }
    }
  };

  // Helper to persist snapshots
  const saveSnapshots = (updated: ChapterSnapshot[]) => {
    setSnapshots(updated);
    try {
      writeJSON('krnl_chapter_snapshots_v1', updated);
    } catch (e) {
      console.error('No se pudo guardar la instantánea del capítulo:', e);
    }
  };

  // Snapshots for currently active chapter
  const currentChapterSnapshots = useMemo(() => {
    if (!currentChapter) return [];
    return snapshots.filter((s) => s.chapterId === currentChapter.id);
  }, [snapshots, currentChapter]);

  // Capture current chapter state as a snapshot
  const handleTakeSnapshot = () => {
    if (!currentChapter) return;
    const newSnapshot: ChapterSnapshot = {
      id: `SNAP_${Date.now().toString(36)}`,
      chapterId: currentChapter.id,
      chapterNumber: currentChapter.number,
      title: currentChapter.title,
      content: currentChapter.content,
      wordCount: currentChapter.wordCount,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      description: snapshotNote.trim() || `Instantánea de Cap. ${currentChapter.number}`
    };
    const next = [newSnapshot, ...snapshots];
    saveSnapshots(next);
    setSnapshotNote('');
  };

  // Restore a snapshot to the current chapter
  const handleRestoreSnapshot = (snap: ChapterSnapshot) => {
    if (!currentChapter) return;
    if (confirm(`¿Restaurar la instantánea "${snap.description}" (${snap.createdAt})? Se reemplazará el texto actual del capítulo.`)) {
      updateCurrentChapter({
        content: snap.content,
        wordCount: snap.wordCount,
        title: snap.title
      });
      setPreviewingSnapshot(null);
      setIsSnapshotModalOpen(false);
    }
  };

  // Delete a snapshot
  const handleDeleteSnapshot = (snapId: string) => {
    const next = snapshots.filter((s) => s.id !== snapId);
    saveSnapshots(next);
    if (previewingSnapshot?.id === snapId) setPreviewingSnapshot(null);
  };

  // Handle Manuscript Import
  const handleImportChapters = (imported: Chapter[], mode: 'append' | 'replace') => {
    let nextChapters: Chapter[];
    if (mode === 'replace') {
      nextChapters = imported;
    } else {
      nextChapters = [...chapters, ...imported];
    }
    setChapters(nextChapters);
    if (imported[0]) setSelectedChapterId(imported[0].id);
    setSharedChapters(nextChapters, true);
  };

  // Toggle character in chapter
  const toggleCharacterInChapter = (charId: string) => {
    if (!currentChapter) return;
    const exists = currentChapter.characterIds.includes(charId);
    const nextIds = exists
      ? currentChapter.characterIds.filter((id) => id !== charId)
      : [...currentChapter.characterIds, charId];
    updateCurrentChapter({ characterIds: nextIds });
  };

  // Toggle ability in chapter
  const toggleAbilityInChapter = (abilityId: string) => {
    if (!currentChapter) return;
    const exists = currentChapter.abilityIds.includes(abilityId);
    const nextIds = exists
      ? currentChapter.abilityIds.filter((id) => id !== abilityId)
      : [...currentChapter.abilityIds, abilityId];
    updateCurrentChapter({ abilityIds: nextIds });
  };

  // Toggle checklist item
  const toggleChecklistItem = (key: keyof Chapter['coherenceChecklist']) => {
    if (!currentChapter) return;
    const currentChecklist = currentChapter.coherenceChecklist;
    updateCurrentChapter({
      coherenceChecklist: {
        ...currentChecklist,
        [key]: !currentChecklist[key]
      }
    });
  };

  // Create character
  const handleSaveNewCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name?.trim()) return;

    const charId = `CHAR_${Date.now().toString(36)}`;
    const fullChar: NovelCharacter = {
      id: charId,
      name: newChar.name.trim(),
      factionId: newChar.factionId || 'FOSS_COLLECTIVE',
      role: newChar.role?.trim() || 'Operador Independiente',
      summary: newChar.summary?.trim() || 'Sin biografía registrada.',
      signatureImplants: newChar.signatureImplants?.trim() || 'Implante neural estándar.',
      typicalAbilities: [],
      notes: newChar.notes?.trim() || ''
    };

    setCharacters((prev) => [...prev, fullChar]);
    // Automatically link to active chapter
    if (currentChapter) {
      updateCurrentChapter({
        characterIds: [...currentChapter.characterIds, charId]
      });
    }

    setNewChar({
      name: '',
      role: '',
      factionId: 'FOSS_COLLECTIVE',
      summary: '',
      signatureImplants: '',
      notes: ''
    });
    setShowNewCharModal(false);
  };

  // Copy chapter to clipboard
  const handleCopyChapter = () => {
    if (!currentChapter) return;
    const formatted = `# ${currentChapter.title}
**Ubicación:** ${currentSystem.name} — ${currentChapter.locationDetails}
**Personajes:** ${sceneCharacters.map(c => c.name).join(', ')}
**Estado:** ${currentChapter.status}

---

${currentChapter.content}`;
    navigator.clipboard.writeText(formatted);
    setCopiedChapter(true);
    setTimeout(() => setCopiedChapter(false), 2000);
  };

  // Download chapter as Markdown
  const handleDownloadChapter = () => {
    if (!currentChapter) return;
    const filename = `Capitulo_${currentChapter.number}_${currentChapter.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    const formatted = `# ${currentChapter.title}
**Ubicación:** ${currentSystem.name} (${currentSystem.coordinates})
**Detalle de Entorno:** ${currentChapter.locationDetails}
**Régimen de Planck:** ${currentSystem.planckBandwidth} (${currentSystem.bandwidthFlops})
**Personajes Presentes:** ${sceneCharacters.map(c => `${c.name} [${c.role}]`).join(', ')}
**Habilidades Involucradas:** ${currentChapter.abilityIds.join(', ')}
**Estado de Revisión:** ${currentChapter.status}
**Palabras:** ${currentChapter.wordCount}

---

## Notas del Autor:
${currentChapter.authorNotes}

---

## Manuscrito:

${currentChapter.content}`;

    const blob = new Blob([formatted], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Coherence score of the active chapter
  const checklistScore = useMemo(() => {
    if (!currentChapter) return 0;
    const list = Object.values(currentChapter.coherenceChecklist);
    const passed = list.filter(Boolean).length;
    return Math.round((passed / list.length) * 100);
  }, [currentChapter]);

  return (
    <div className="space-y-6">
      {/* Header - Geometric Balance Style with Dot Grid */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/30 border border-cyan-800/80 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              ESCRITORIO_DE_MANUSCRITO // CONTROL_DE_COHERENCIA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
              Editor de Capítulos y Matriz de Referencias del Sustrato
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Escribe y organiza tus capítulos mientras mantienes sincronizados los <strong className="text-white">personajes en escena</strong>,
              las leyes físicas del <strong className="text-white">planeta/sector</strong> y los límites térmicos y de cómputo de las <strong className="text-white">habilidades utilizadas</strong>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenGraph && (
              <button
                type="button"
                onClick={onOpenGraph}
                className="px-3 py-1.5 rounded-sm bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ver grafo de relaciones entre personajes, planetas y tecnologías"
              >
                <Network className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mapa de Grafos</span>
              </button>
            )}
            {onOpenTimeline && (
              <button
                type="button"
                onClick={onOpenTimeline}
                className="px-3 py-1.5 rounded-sm bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-700/80 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ver cronología y auditar anacronismos temporales y de viaje FTL"
              >
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Línea Temporal</span>
              </button>
            )}
            <button
              onClick={() => setShowNewCharModal(true)}
              className="px-3 py-1.5 rounded-sm bg-[#0d0d0f] hover:bg-[#181820] text-slate-200 border border-[#1e293b] hover:border-cyan-500/60 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              + Personaje
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-sm bg-[#0d0d0f] hover:bg-[#181820] text-slate-200 border border-[#1e293b] hover:border-cyan-500/60 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Importar manuscrito existente desde archivo .md, .txt o .docx"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              Importar
            </button>
            <button
              onClick={handleCreateChapter}
              className="px-3.5 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + Nuevo Capítulo
            </button>
          </div>
        </div>

        {/* Global Novel Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#1e293b] text-xs font-mono">
          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">TOTAL CAPÍTULOS</span>
            <span className="text-white font-bold text-sm">{chapters.length}</span>
            <span className="text-[10px] text-slate-500 ml-1">en manuscrito</span>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">PALABRAS TOTALES</span>
            <span className="text-cyan-400 font-bold text-sm">{totalNovelWords.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 ml-1">palabras</span>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">PERSONAJES REGISTRADOS</span>
            <span className="text-amber-400 font-bold text-sm">{characters.length}</span>
            <span className="text-[10px] text-slate-500 ml-1">en canon</span>
          </div>

          <div className="p-2.5 bg-[#0a0a0c] border border-[#1e293b] rounded-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">COHERENCIA DE ESCENA</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm font-bold ${checklistScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {checklistScore}%
              </span>
              <div className="flex-1 bg-[#15151a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className={`h-full ${checklistScore >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${checklistScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Chapters List), Center (Editor), Right (Lore Reference Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {!isFocusMode && (
          <ChapterListSidebar
            chapters={chapters}
            filteredChapters={filteredChapters}
            characters={characters}
            currentChapterId={currentChapter.id}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSelectChapter={setSelectedChapterId}
            onDeleteChapter={handleDeleteChapter}
          />
        )}

        <ChapterTextEditorPanel
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          currentChapter={currentChapter}
          typographyMode={typographyMode}
          onToggleTypographyMode={() => setTypographyMode(typographyMode === 'mono' ? 'prose' : 'mono')}
          copiedChapter={copiedChapter}
          onCopyChapter={handleCopyChapter}
          snapshotsCount={currentChapterSnapshots.length}
          onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
          onDownloadChapter={handleDownloadChapter}
          onUpdateChapter={updateCurrentChapter}
          activeConceptsCount={activeConceptsCount}
          onGoToDictionaryTab={() => setActiveReferenceTab('DICCIONARIO')}
          showAutocompleteBar={showAutocompleteBar}
          onToggleAutocompleteBar={() => setShowAutocompleteBar(!showAutocompleteBar)}
          autocompleteState={autocompleteState}
          onApplyAutocomplete={applyAutocomplete}
          textareaRef={textareaRef}
          onContentChange={handleContentChange}
          onEditorKeyDown={handleEditorKeyDown}
          readingTimeMinutes={readingTimeMinutes}
          onSendToAuditor={onSendToAuditor}
        />

        <ChapterReferencePanel
          activeTab={activeReferenceTab}
          onTabChange={setActiveReferenceTab}
          currentChapter={currentChapter}
          currentSystem={currentSystem}
          characters={characters}
          sceneCharacters={sceneCharacters}
          sceneAbilities={sceneAbilities}
          unifiedConcepts={unifiedConcepts}
          activeConceptsCount={activeConceptsCount}
          onUpdateChapter={updateCurrentChapter}
          onInsertTerm={handleInsertTermAtCursor}
          onToggleCharacter={toggleCharacterInChapter}
          onToggleAbility={toggleAbilityInChapter}
          onToggleChecklistItem={toggleChecklistItem}
          onOpenNewCharacterModal={() => setShowNewCharModal(true)}
          onOpenTimeline={onOpenTimeline}
        />
      </div>

      <NewCharacterModal
        isOpen={showNewCharModal}
        newChar={newChar}
        onChange={setNewChar}
        onClose={() => setShowNewCharModal(false)}
        onSubmit={handleSaveNewCharacter}
      />

      <ChapterSnapshotsModal
        isOpen={isSnapshotModalOpen}
        currentChapter={currentChapter}
        snapshots={currentChapterSnapshots}
        snapshotNote={snapshotNote}
        onSnapshotNoteChange={setSnapshotNote}
        previewingSnapshot={previewingSnapshot}
        onTogglePreview={setPreviewingSnapshot}
        onTakeSnapshot={handleTakeSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onClose={() => {
          setIsSnapshotModalOpen(false);
          setPreviewingSnapshot(null);
        }}
      />

      {/* Manuscript Import Modal */}
      <ManuscriptImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportChapters}
        currentChaptersCount={chapters.length}
      />
    </div>
  );
};
