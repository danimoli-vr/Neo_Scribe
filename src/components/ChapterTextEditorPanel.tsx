import React from 'react';
import {
  BookOpen, Camera, Check, Cloud, Copy, Download, Info, ShieldCheck, Sparkles, Terminal,
} from 'lucide-react';
import { Chapter } from '../types';
import { ConceptTerm } from '../data/conceptDictionary';
import { AutosaveStatusBadge } from './AutosaveStatusBadge';

export interface AutocompleteState {
  query: string;
  triggerChar: string; // '@' | '/' | ''
  prefixIndex: number;
  suggestions: ConceptTerm[];
  selectedIndex: number;
}

interface ChapterTextEditorPanelProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  currentChapter: Chapter;
  typographyMode: 'mono' | 'prose';
  onToggleTypographyMode: () => void;
  copiedChapter: boolean;
  onCopyChapter: () => void;
  snapshotsCount: number;
  onOpenSnapshotModal: () => void;
  onDownloadChapter: () => void;
  onUpdateChapter: (updates: Partial<Chapter>) => void;
  activeConceptsCount: number;
  onGoToDictionaryTab: () => void;
  showAutocompleteBar: boolean;
  onToggleAutocompleteBar: () => void;
  autocompleteState: AutocompleteState | null;
  onApplyAutocomplete: (term: ConceptTerm) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onContentChange: (newContent: string) => void;
  onEditorKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readingTimeMinutes: number;
  onSendToAuditor?: (text: string, title: string) => void;
}

/**
 * Center column of ChapterEditorView: the toolbar, title input, main
 * textarea (with the @/ autocomplete HUD) and author notes for the chapter
 * currently selected. All editing state stays in the parent; this component
 * only renders it and forwards events.
 */
export const ChapterTextEditorPanel: React.FC<ChapterTextEditorPanelProps> = ({
  isFocusMode,
  onToggleFocusMode,
  currentChapter,
  typographyMode,
  onToggleTypographyMode,
  copiedChapter,
  onCopyChapter,
  snapshotsCount,
  onOpenSnapshotModal,
  onDownloadChapter,
  onUpdateChapter,
  activeConceptsCount,
  onGoToDictionaryTab,
  showAutocompleteBar,
  onToggleAutocompleteBar,
  autocompleteState,
  onApplyAutocomplete,
  textareaRef,
  onContentChange,
  onEditorKeyDown,
  readingTimeMinutes,
  onSendToAuditor,
}) => {
  return (
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
              onChange={(e) => onUpdateChapter({ status: e.target.value as Chapter['status'] })}
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
              onClick={onToggleTypographyMode}
              className="px-2.5 py-1 rounded-sm bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              title="Cambiar tipografía entre Terminal y Prosa"
            >
              Fuente: {typographyMode === 'mono' ? 'Fira Code' : 'Sans'}
            </button>

            <button
              onClick={onToggleFocusMode}
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
              onClick={onCopyChapter}
              className="p-1 rounded-sm bg-[#111114] text-slate-400 hover:text-white border border-[#1e293b] transition-colors cursor-pointer"
              title="Copiar texto formateado"
            >
              {copiedChapter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenSnapshotModal}
              className="px-2 py-1 rounded-sm bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              title="Historial de Versiones e Instantáneas del Capítulo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snapshots ({snapshotsCount})</span>
            </button>

            <button
              onClick={onDownloadChapter}
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
            onChange={(e) => onUpdateChapter({ title: e.target.value })}
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
                onClick={onGoToDictionaryTab}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold lowercase hover:underline cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>diccionario ({activeConceptsCount} activos)</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleAutocompleteBar}
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
                      onClick={() => onApplyAutocomplete(sug)}
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
              onChange={(e) => onContentChange(e.target.value)}
              onKeyDown={onEditorKeyDown}
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
            onChange={(e) => onUpdateChapter({ authorNotes: e.target.value })}
            placeholder="ej. En este tiroteo recordar que el operador debe descargar 200 kJ al disipador de la clavícula para no cocinar su propio implante..."
            className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-2.5 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
