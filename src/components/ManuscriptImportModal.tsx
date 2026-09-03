import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, Check, AlertTriangle, X, ArrowRight, 
  Layers, BookOpen, Trash2, ShieldCheck, Download
} from 'lucide-react';
import { Chapter, ManuscriptImportItem } from '../types';
import { CANONICAL_STAR_SYSTEMS, CANONICAL_CHARACTERS, CANONICAL_SYSCALLS } from '../data/canonicalLore';

interface ManuscriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedChapters: Chapter[], mode: 'append' | 'replace') => void;
  currentChaptersCount: number;
}

export const ManuscriptImportModal: React.FC<ManuscriptImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentChaptersCount
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [detectedChapters, setDetectedChapters] = useState<ManuscriptImportItem[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Heuristic parser for chapters
  const parseChaptersFromText = (text: string): ManuscriptImportItem[] => {
    // Normalization
    const normalized = text.replace(/\r\n/g, '\n');

    // Regex matching: # Capítulo 1, Capítulo 1: Título, Chapter 1, ACTO I, etc.
    const chapterHeadingRegex = /(?:^|\n)(?:#{1,3}\s*)?(?:Cap[íi]tulo|CAP[ÍI]TULO|Chapter|CHAPTER|Acto|ACTO)\s*(\d+|[IVXLCDM]+)(?:[:\.\s\-–—]+([^\n]*))?/g;

    const matches: { index: number; numberStr: string; titleExtra: string; fullMatch: string }[] = [];
    let match: RegExpExecArray | null;

    while ((match = chapterHeadingRegex.exec(normalized)) !== null) {
      matches.push({
        index: match.index,
        numberStr: match[1] || '1',
        titleExtra: (match[2] || '').trim(),
        fullMatch: match[0]
      });
    }

    if (matches.length === 0) {
      // Fallback: check if separated by markdown dividers '---'
      const dividerSplits = normalized.split(/\n\s*---\s*\n/);
      if (dividerSplits.length > 1) {
        return dividerSplits.map((chunk, idx) => {
          const lines = chunk.trim().split('\n');
          const firstLine = lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : `Sección ${idx + 1}`;
          const words = chunk.trim().split(/\s+/).filter(Boolean).length;
          return {
            number: idx + 1,
            title: firstLine.length > 50 ? `Capítulo ${idx + 1}` : firstLine,
            content: chunk.trim(),
            wordCount: words
          };
        });
      }

      // Single chapter fallback
      const totalWords = normalized.trim().split(/\s+/).filter(Boolean).length;
      return [
        {
          number: 1,
          title: 'Capítulo Importado: Manuscrito Completo',
          content: normalized.trim(),
          wordCount: totalWords
        }
      ];
    }

    const items: ManuscriptImportItem[] = [];

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startIndex = current.index;
      const endIndex = next ? next.index : normalized.length;
      const rawChunk = normalized.substring(startIndex, endIndex).trim();

      // Extract title from extra string or first line
      let proposedTitle = current.titleExtra;
      if (!proposedTitle) {
        const lines = rawChunk.split('\n');
        proposedTitle = lines[0].replace(/^#+\s*/, '').trim();
      }
      if (!proposedTitle || proposedTitle.length > 60) {
        proposedTitle = `Capítulo ${i + 1}`;
      }

      const words = rawChunk.split(/\s+/).filter(Boolean).length;

      items.push({
        number: i + 1,
        title: proposedTitle,
        content: rawChunk,
        wordCount: words
      });
    }

    return items;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const processFile = async (selected: File) => {
    setFile(selected);
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const name = selected.name.toLowerCase();
      if (name.endsWith('.txt') || name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          setRawText(content);
          const parsed = parseChaptersFromText(content);
          setDetectedChapters(parsed);
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setErrorMessage('Error al leer el archivo de texto.');
          setIsProcessing(false);
        };
        reader.readAsText(selected, 'UTF-8');
      } else if (name.endsWith('.docx')) {
        // Attempt text extraction from docx container
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const buffer = ev.target?.result as ArrayBuffer;
            const textDecoder = new TextDecoder('utf-8', { fatal: false });
            const binaryStr = textDecoder.decode(buffer);
            // Simple XML extract if possible
            const xmlMatches = binaryStr.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
            if (xmlMatches && xmlMatches.length > 0) {
              const plain = xmlMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
              setRawText(plain);
              const parsed = parseChaptersFromText(plain);
              setDetectedChapters(parsed);
            } else {
              setErrorMessage('No se pudo extraer texto plano de este archivo Word (.docx). Te recomendamos guardarlo como .txt o .md para importación perfecta.');
            }
          } catch (err: any) {
            setErrorMessage('Error al procesar el archivo Word.');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsArrayBuffer(selected);
      } else {
        setErrorMessage('Formato no soportado. Por favor utiliza archivos .md, .txt o .docx.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al cargar el archivo.');
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (detectedChapters.length === 0) return;

    const startNumber = importMode === 'append' ? currentChaptersCount + 1 : 1;

    const imported: Chapter[] = detectedChapters.map((item, idx) => {
      const chapNumber = startNumber + idx;
      return {
        id: `CHAP_IMP_${Date.now().toString(36)}_${idx}`,
        number: chapNumber,
        title: item.title.startsWith('Capítulo') ? item.title : `Capítulo ${chapNumber}: ${item.title}`,
        status: 'BORRADOR',
        systemId: CANONICAL_STAR_SYSTEMS[0]?.id || 'SYS_AXIOMA',
        locationDetails: 'Ubicación pendiente de clasificación',
        characterIds: CANONICAL_CHARACTERS[0] ? [CANONICAL_CHARACTERS[0].id] : [],
        abilityIds: CANONICAL_SYSCALLS[0] ? [CANONICAL_SYSCALLS[0].id] : [],
        coherenceChecklist: {
          entropyRespected: false,
          bandwidthChecked: false,
          memoryLeaksCleaned: false,
          drmRulesRespected: false
        },
        authorNotes: `Importado desde archivo "${file?.name || 'manuscrito'}"`,
        content: item.content,
        wordCount: item.wordCount,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    onImport(imported, importMode);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#0d1017] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#080b12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>IMPORTADOR INTELIGENTE DE MANUSCRITOS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  .MD / .TXT / .DOCX
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Segmentación automática de capítulos por encabezados heurísticos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* File Upload Drop Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/70 bg-[#090c14] rounded-xl p-6 text-center cursor-pointer transition-all group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".md,.txt,.docx" 
              onChange={handleFileChange}
              className="hidden" 
            />
            <FileText className="w-10 h-10 text-cyan-500/70 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
            <div className="text-xs font-mono font-bold text-white mb-1">
              {file ? `Archivo seleccionado: ${file.name}` : 'Haz clic o arrastra tu manuscrito aquí'}
            </div>
            <p className="text-[11px] text-slate-400">
              Soporta archivos Markdown (.md), texto plano (.txt) o documentos Word (.docx).
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Detected Chapters Preview */}
          {detectedChapters.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Capítulos Detectados ({detectedChapters.length})</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Total palabras: {detectedChapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()}
                </span>
              </div>

              {/* Import Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0a0d14] rounded-lg border border-slate-800 text-xs font-mono">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-white">Añadir al final</div>
                    <div className="text-[10px] text-slate-400">
                      Empieza en el capítulo #{currentChaptersCount + 1}
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-rose-500"
                  />
                  <div>
                    <div className="font-bold text-rose-300">Reemplazar novela</div>
                    <div className="text-[10px] text-slate-400">
                      Sobrescribe los {currentChaptersCount} capítulos actuales
                    </div>
                  </div>
                </label>
              </div>

              {/* Chapters List Table */}
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-[#090b10] divide-y divide-slate-800/60 font-mono text-xs">
                {detectedChapters.map((chap, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0">
                        {chap.number}
                      </span>
                      <div>
                        <div className="font-bold text-white truncate max-w-md">{chap.title}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-sm">
                          {chap.content.slice(0, 70)}...
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                      {chap.wordCount.toLocaleString()} palabras
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#090b10] flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={detectedChapters.length === 0 || isProcessing}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all shadow-md cursor-pointer ${
              detectedChapters.length > 0 && !isProcessing
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/50'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Importar {detectedChapters.length} Capítulos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
