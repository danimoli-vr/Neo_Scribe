import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, Plus, Save, Trash2, Copy, Check, Download, Sparkles, 
  User, Globe, Zap, AlertTriangle, ShieldCheck, FileText, ChevronRight, 
  ChevronDown, Eye, CheckCircle2, RotateCcw, ExternalLink, Info, Filter,
  Layers, Terminal, Clock, Hash, Cpu, HardDrive, AtSign, Code2, Bookmark, Network, Cloud,
  Camera, History, Upload, X
} from 'lucide-react';
import { Chapter, NovelCharacter, StarSystem, Syscall, ExploitScript, Faction, ChapterSnapshot } from '../types';
import { 
  CANONICAL_CHARACTERS, 
  INITIAL_CHAPTERS, 
  CANONICAL_STAR_SYSTEMS, 
  CANONICAL_SYSCALLS, 
  CANONICAL_EXPLOITS, 
  CANONICAL_FACTIONS 
} from '../data/canonicalLore';
import { getUnifiedConceptDictionary, ConceptTerm, countOccurrencesInText } from '../data/conceptDictionary';
import { ConceptDictionaryPanel } from './ConceptDictionaryPanel';
import { ManuscriptImportModal } from './ManuscriptImportModal';
import { autosaveService } from '../services/autosaveService';
import { editorMetricsService } from '../services/editorMetricsService';
import { AutosaveStatusBadge } from './AutosaveStatusBadge';

interface ChapterEditorViewProps {
  onSendToAuditor?: (text: string, title: string) => void;
  onOpenGraph?: () => void;
  onOpenTimeline?: () => void;
  initialChapterNumber?: number | null;
}

interface AutocompleteState {
  query: string;
  triggerChar: string; // '@' | '/' | ''
  prefixIndex: number;
  suggestions: ConceptTerm[];
  selectedIndex: number;
}

export const ChapterEditorView: React.FC<ChapterEditorViewProps> = ({ 
  onSendToAuditor,
  onOpenGraph,
  onOpenTimeline,
  initialChapterNumber
}) => {
  // Persistence for Chapters
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_chapters_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved chapters:', e);
    }
    return INITIAL_CHAPTERS;
  });

  // Persistence for Characters
  const [characters, setCharacters] = useState<NovelCharacter[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_characters_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved characters:', e);
    }
    return CANONICAL_CHARACTERS;
  });

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
  const [activeReferenceTab, setActiveReferenceTab] = useState<'DICCIONARIO' | 'ENTORNO' | 'PERSONAJES' | 'HABILIDADES' | 'COHERENCIA'>('DICCIONARIO');
  
  // Editor Ref & Autocomplete Engine
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState | null>(null);
  const [showAutocompleteBar, setShowAutocompleteBar] = useState<boolean>(true);

  // Modals & Feedback
  const [showNewCharModal, setShowNewCharModal] = useState<boolean>(false);
  const [copiedChapter, setCopiedChapter] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Recién sincronizado');

  // Snapshots state
  const [snapshots, setSnapshots] = useState<ChapterSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('krnl_chapter_snapshots_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
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

  // Autosave to localStorage debounced to 3 seconds of typing silence
  useEffect(() => {
    if (isInitialChaptersMount.current) {
      isInitialChaptersMount.current = false;
      return;
    }
    autosaveService.scheduleSave('krnl_chapters_v1', chapters);
  }, [chapters]);

  useEffect(() => {
    if (isInitialCharsMount.current) {
      isInitialCharsMount.current = false;
      return;
    }
    autosaveService.scheduleSave('krnl_characters_v1', characters);
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
    if (!currentChapter) return [];
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
    setLastSavedTime(`Auto-guardado: ${timeStr}`);
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
      localStorage.setItem('krnl_chapter_snapshots_v1', JSON.stringify(updated));
    } catch (e) {}
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
    autosaveService.scheduleSave('krnl_chapters_v1', nextChapters);
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
        
        {/* Left Column: Chapters Index (Collapsible in Focus Mode) */}
        {!isFocusMode && (
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  Índice de Capítulos
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredChapters.length} de {chapters.length}
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {['TODOS', 'BORRADOR', 'EN_REVISION', 'CANON'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[9px] font-mono px-2 py-1 rounded-sm uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b]'
                    }`}
                  >
                    {st === 'EN_REVISION' ? 'REVISIÓN' : st}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Buscar por título, texto o lugar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
              />

              {/* Chapter Cards List */}
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filteredChapters.map((chap) => {
                  const isSelected = chap.id === currentChapter.id;
                  const chapSystem = CANONICAL_STAR_SYSTEMS.find((s) => s.id === chap.systemId);
                  const chapChars = characters.filter((c) => chap.characterIds.includes(c.id));

                  return (
                    <div
                      key={chap.id}
                      onClick={() => setSelectedChapterId(chap.id)}
                      className={`p-3 rounded-sm border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 border-l-4 border-l-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-[#111114] border-[#1e293b] hover:border-slate-700 hover:bg-[#15151a]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                          CAP. {chap.number}
                        </span>
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                            chap.status === 'CANON'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : chap.status === 'EN_REVISION'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {chap.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide truncate mb-1">
                        {chap.title}
                      </h4>

                      <div className="text-[10px] text-slate-400 font-mono truncate mb-1.5 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                        <span className="truncate">{chapSystem?.name.split('(')[0] || 'Espacio Profundo'}</span>
                      </div>

                      {/* Characters tags */}
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {chapChars.slice(0, 2).map((char) => (
                          <span
                            key={char.id}
                            className="text-[8px] font-mono px-1 py-0.2 bg-[#0a0a0c] text-slate-300 border border-[#1e293b] rounded-sm"
                          >
                            {char.name}
                          </span>
                        ))}
                        {chapChars.length > 2 && (
                          <span className="text-[8px] font-mono text-slate-500">
                            +{chapChars.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-[#1e293b]/60">
                        <span>{chap.wordCount} palabras</span>
                        <button
                          onClick={(e) => handleDeleteChapter(chap.id, e)}
                          title="Eliminar capítulo"
                          className="hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Center Column: Text Editor Canvas */}
        <div className={`${isFocusMode ? 'lg:col-span-8' : 'lg:col-span-5'} space-y-4`}>
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 space-y-3">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  CAPÍTULO {currentChapter.number}
                </span>
                <span className="text-slate-600">|</span>
                <select
                  value={currentChapter.status}
                  onChange={(e) => updateCurrentChapter({ status: e.target.value as any })}
                  className="bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-2 py-1 text-[10px] font-mono text-slate-300 uppercase tracking-wider focus:border-cyan-500 outline-none"
                >
                  <option value="BORRADOR">Borrador Inicial</option>
                  <option value="EN_REVISION">En Revisión de Coherencia</option>
                  <option value="CANON">Canon Definitivo</option>
                </select>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTypographyMode(typographyMode === 'mono' ? 'prose' : 'mono')}
                  className="px-2.5 py-1 rounded-sm bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  title="Cambiar tipografía entre Terminal y Prosa"
                >
                  Fuente: {typographyMode === 'mono' ? 'Fira Code' : 'Sans'}
                </button>

                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`px-2.5 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    isFocusMode
                      ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                      : 'bg-[#111114] text-slate-400 hover:text-white border-[#1e293b]'
                  }`}
                  title="Modo concentración"
                >
                  {isFocusMode ? 'Normal' : 'Foco'}
                </button>

                <button
                  onClick={handleCopyChapter}
                  className="p-1 rounded-sm bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b] transition-colors cursor-pointer"
                  title="Copiar texto formateado"
                >
                  {copiedChapter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsSnapshotModalOpen(true)}
                  className="px-2 py-1 rounded-sm bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                  title="Historial de Versiones e Instantáneas del Capítulo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snapshots ({currentChapterSnapshots.length})</span>
                </button>

                <button
                  onClick={handleDownloadChapter}
                  className="p-1 rounded-sm bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b] transition-colors cursor-pointer"
                  title="Descargar capítulo en Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chapter Title Input */}
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                TÍTULO DEL CAPÍTULO:
              </label>
              <input
                type="text"
                value={currentChapter.title}
                onChange={(e) => updateCurrentChapter({ title: e.target.value })}
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-2 text-sm font-bold text-white uppercase tracking-wide font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Main Text Editor Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>MANUSCRITO DE LA ESCENA:</span>
                  <button
                    type="button"
                    onClick={() => setActiveReferenceTab('DICCIONARIO')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold lowercase hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>diccionario ({activeConceptsCount} activos)</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAutocompleteBar(!showAutocompleteBar)}
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 cursor-pointer transition-colors border ${
                      showAutocompleteBar
                        ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                        : 'bg-[#111114] border-[#1e293b] text-slate-500'
                    }`}
                    title="Activar/desactivar autocompletado en tiempo real mientras escribes"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {showAutocompleteBar ? 'Autocompletar ON' : 'Autocompletar OFF'}
                  </button>
                  {/* Real-time word and character counter pill */}
                  <div 
                    title="Recuento en tiempo real de palabras y caracteres de este capítulo"
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#090d16] border border-cyan-500/30 font-mono text-[9px] text-cyan-300 shadow-sm"
                  >
                    <span className="text-white font-bold">{currentChapter.wordCount || 0}</span>
                    <span className="text-slate-400 text-[8px]">pals</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-300 font-bold">{currentChapter.content?.length || 0}</span>
                    <span className="text-slate-400 text-[8px]">cars</span>
                  </div>
                  <AutosaveStatusBadge />
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('krnl_open_storage_sync'))}
                    className="text-[9px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 cursor-pointer transition-colors bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/60 text-cyan-300"
                    title="Configuración de guardado: Google Drive y Carpeta Local"
                  >
                    <Cloud className="w-2.5 h-2.5 text-cyan-400" />
                    <span className="hidden sm:inline">Nube / Disco</span>
                  </button>
                </div>
              </div>

              {/* Autocomplete Suggestions HUD */}
              {autocompleteState && autocompleteState.suggestions.length > 0 && (
                <div className="p-2 bg-[#0c121e] border border-cyan-500/60 rounded-sm shadow-xl space-y-1.5 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      Autocompletar Concepto ({autocompleteState.triggerChar ? `disparador '${autocompleteState.triggerChar}'` : 'coincidencia'}):
                    </span>
                    <span className="text-[9px] text-slate-400">
                      [Tab] o [Enter] para insertar • [Esc] descartar
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {autocompleteState.suggestions.map((sug, idx) => {
                      const isSelected = idx === autocompleteState.selectedIndex;
                      return (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => applyAutocomplete(sug)}
                          className={`px-2 py-1 rounded-sm text-left text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-md scale-[1.02]'
                              : 'bg-[#15151c] text-slate-300 hover:text-white border-[#1e293b] hover:border-slate-700'
                          }`}
                        >
                          <span className={`text-[8px] px-1 py-0.2 rounded-xs uppercase tracking-wider ${
                            isSelected ? 'bg-black text-cyan-300' : 'bg-[#0a0a0c] text-cyan-400'
                          }`}>
                            {sug.badge}
                          </span>
                          <span>{sug.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={18}
                  value={currentChapter.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  placeholder="Escribe aquí el texto del capítulo... (Escribe @ para personajes, / para tecnologías/exploits o escribe cualquier término del mundo)"
                  className={`w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-4 text-xs sm:text-sm text-slate-200 focus:border-cyan-500 outline-none leading-relaxed transition-all resize-y ${
                    typographyMode === 'mono' ? 'font-mono' : 'font-sans'
                  }`}
                />
              </div>

              {/* Autocomplete helper legend */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                <span>💡 Tips de escritura: Escribe <strong className="text-amber-400 font-mono">@</strong> para insertar personajes, <strong className="text-cyan-400 font-mono">/</strong> para tecnologías y syscalls.</span>
                <span className="text-slate-500">Haz clic en cualquier término del lateral para insertarlo al instante.</span>
              </div>
            </div>

            {/* Editor Metrics Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <span>
                  PALABRAS: <strong className="text-white">{currentChapter.wordCount}</strong>
                </span>
                <span>•</span>
                <span>
                  CARACTERES: <strong className="text-slate-300">{currentChapter.content.length}</strong>
                </span>
                <span>•</span>
                <span>
                  LECTURA: <strong className="text-cyan-400">~{readingTimeMinutes} min</strong>
                </span>
              </div>

              {/* Action: Send to Gemini Auditor */}
              {onSendToAuditor && (
                <button
                  onClick={() => onSendToAuditor(currentChapter.content, currentChapter.title)}
                  className="px-3 py-1.5 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/80 text-cyan-300 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Auditar con Gemini
                </button>
              )}
            </div>

            {/* Author Intent / Coherence Notes */}
            <div className="pt-3 border-t border-[#1e293b] space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Info className="w-3 h-3 text-cyan-400" />
                Notas del Autor & Reglas Tácticas para esta Escena:
              </label>
              <textarea
                rows={2}
                value={currentChapter.authorNotes}
                onChange={(e) => updateCurrentChapter({ authorNotes: e.target.value })}
                placeholder="ej. En este tiroteo recordar que el operador debe descargar 200 kJ al disipador de la clavícula para no cocinar su propio implante..."
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-2.5 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Lore & Coherence References Matrix */}
        <div className={`${isFocusMode ? 'lg:col-span-4' : 'lg:col-span-4'} space-y-4`}>
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
                onClick={() => setActiveReferenceTab('DICCIONARIO')}
                className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                  activeReferenceTab === 'DICCIONARIO'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-[#111114]'
                }`}
              >
                Diccionario ({activeConceptsCount})
              </button>
              <button
                onClick={() => setActiveReferenceTab('ENTORNO')}
                className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                  activeReferenceTab === 'ENTORNO'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-[#111114]'
                }`}
              >
                Planeta
              </button>
              <button
                onClick={() => setActiveReferenceTab('PERSONAJES')}
                className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                  activeReferenceTab === 'PERSONAJES'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-[#111114]'
                }`}
              >
                Personajes ({sceneCharacters.length})
              </button>
              <button
                onClick={() => setActiveReferenceTab('HABILIDADES')}
                className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                  activeReferenceTab === 'HABILIDADES'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-[#111114]'
                }`}
              >
                Poderes ({currentChapter.abilityIds.length})
              </button>
              <button
                onClick={() => setActiveReferenceTab('COHERENCIA')}
                className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                  activeReferenceTab === 'COHERENCIA'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-[#111114]'
                }`}
              >
                Leyes
              </button>
            </div>

            {/* TAB 0: DICCIONARIO DE CONCEPTOS */}
            {activeReferenceTab === 'DICCIONARIO' && (
              <ConceptDictionaryPanel
                concepts={unifiedConcepts}
                chapterText={currentChapter.content}
                onInsertTerm={handleInsertTermAtCursor}
              />
            )}

            {/* TAB 1: ENTORNO (PLANET / SECTOR) */}
            {activeReferenceTab === 'ENTORNO' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Sistema Estelar / Sector Astrográfico:
                  </label>
                  <select
                    value={currentChapter.systemId}
                    onChange={(e) => updateCurrentChapter({ systemId: e.target.value })}
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
                          updateCurrentChapter({ 
                            diegeticCycle: cycle,
                            diegeticDateLabel: `Ciclo ${cycle.toFixed(3)} // Planck Tick 0x${(currentChapter.number * 17).toString(16).toUpperCase()}`
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
                        onChange={(e) => updateCurrentChapter({ diegeticDateLabel: e.target.value })}
                        className="w-full bg-[#12131b] border border-[#1e293b] rounded-sm px-2 py-1 text-xs text-cyan-300 font-mono focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id={`chk_flashback_${currentChapter.id}`}
                      checked={!!currentChapter.isFlashback}
                      onChange={(e) => updateCurrentChapter({ isFlashback: e.target.checked })}
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
                    onChange={(e) => updateCurrentChapter({ locationDetails: e.target.value })}
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
            {activeReferenceTab === 'PERSONAJES' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Personajes en esta Escena:
                  </span>
                  <button
                    onClick={() => setShowNewCharModal(true)}
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
                        onClick={() => toggleCharacterInChapter(char.id)}
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
            {activeReferenceTab === 'HABILIDADES' && (
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
                          onClick={() => toggleAbilityInChapter(sys.id)}
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
                          onClick={() => toggleAbilityInChapter(exp.id)}
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
            {activeReferenceTab === 'COHERENCIA' && (
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
                        onChange={() => toggleChecklistItem('entropyRespected')}
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
                        onChange={() => toggleChecklistItem('bandwidthChecked')}
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
                        onChange={() => toggleChecklistItem('memoryLeaksCleaned')}
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
                        onChange={() => toggleChecklistItem('drmRulesRespected')}
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
      </div>

      {/* Modal: Add New Character */}
      {showNewCharModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Nuevo Personaje de la Novela
                </h3>
              </div>
              <button
                onClick={() => setShowNewCharModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewCharacter} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  Nombre del Personaje:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Tarek Sola, Comandante Vane..."
                  value={newChar.name}
                  onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                    Rol / Ocupación:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Depurador de Campo, Inquisidor..."
                    value={newChar.role}
                    onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                    Facción / Lealtad:
                  </label>
                  <select
                    value={newChar.factionId}
                    onChange={(e) => setNewChar({ ...newChar, factionId: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  >
                    {CANONICAL_FACTIONS.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  Implantes & Disipadores Térmicos del Personaje:
                </label>
                <input
                  type="text"
                  placeholder="ej. Coprocesador suboccipital con aleta de grafeno en la clavícula..."
                  value={newChar.signatureImplants}
                  onChange={(e) => setNewChar({ ...newChar, signatureImplants: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  Resumen de Historia & Motivación:
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Expulsado de la flota imperial tras sabotear un script de purga..."
                  value={newChar.summary}
                  onChange={(e) => setNewChar({ ...newChar, summary: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-2 text-xs text-white focus:border-cyan-500 outline-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  Notas de Voz / Manías:
                </label>
                <input
                  type="text"
                  placeholder="ej. Comprueba compulsivamente el manómetro de fluorocarbono..."
                  value={newChar.notes}
                  onChange={(e) => setNewChar({ ...newChar, notes: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowNewCharModal(false)}
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
          </div>
        </div>
      )}

      {/* Snapshots & Version History Modal */}
      {isSnapshotModalOpen && currentChapter && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-200 font-sans"
          onClick={() => {
            setIsSnapshotModalOpen(false);
            setPreviewingSnapshot(null);
          }}
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
                onClick={() => {
                  setIsSnapshotModalOpen(false);
                  setPreviewingSnapshot(null);
                }}
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
                    onChange={(e) => setSnapshotNote(e.target.value)}
                    placeholder="Nota o etiqueta (ej: 'Antes de cambiar el final del diálogo')..."
                    className="w-full bg-[#121520] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none font-mono"
                  />
                  <button
                    onClick={handleTakeSnapshot}
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
                  <span>Versiones Guardadas para este Capítulo ({currentChapterSnapshots.length})</span>
                </h4>

                {currentChapterSnapshots.length === 0 ? (
                  <div className="text-center py-10 bg-[#090b10] border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                    <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No hay instantáneas registradas para el Capítulo {currentChapter.number}.
                    <div className="text-[11px] text-slate-600 mt-1">
                      Haz clic en "Capturar" arriba para crear la primera versión de respaldo.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentChapterSnapshots.map((snap) => (
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
                              onClick={() => setPreviewingSnapshot(previewingSnapshot?.id === snap.id ? null : snap)}
                              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                                previewingSnapshot?.id === snap.id
                                  ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                              }`}
                            >
                              {previewingSnapshot?.id === snap.id ? 'Ocultar' : 'Previsualizar'}
                            </button>
                            <button
                              onClick={() => handleRestoreSnapshot(snap)}
                              className="px-2.5 py-1 text-xs font-mono bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Restaurar este texto en el editor"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restaurar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSnapshot(snap.id)}
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
                onClick={() => {
                  setIsSnapshotModalOpen(false);
                  setPreviewingSnapshot(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
