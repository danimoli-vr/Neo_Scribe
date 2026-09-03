import React, { useState } from 'react';
import { FileText, Type, Clock, Sparkles, BookOpen, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useEditorMetrics } from '../services/editorMetricsService';

interface EditorMetricsStatusBarIndicatorProps {
  onOpenEditor?: () => void;
  className?: string;
}

export const EditorMetricsStatusBarIndicator: React.FC<EditorMetricsStatusBarIndicatorProps> = ({
  onOpenEditor,
  className = ''
}) => {
  const metrics = useEditorMetrics();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Main Status Bar Badge */}
      <button
        type="button"
        onClick={onOpenEditor}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider bg-[#0c1322]/90 hover:bg-[#111c33] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer select-none shadow-[0_0_8px_rgba(6,182,212,0.15)]"
        title="Métricas en tiempo real del manuscrito. Clic para ir al Editor de Capítulos."
      >
        {/* Dynamic Icon with Typing Pulse Indicator */}
        <div className="relative flex items-center justify-center">
          <FileText className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          {metrics.isTyping && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>

        {/* Chapter Identifier or General Manuscript Badge */}
        {metrics.isEditorActive ? (
          <span className="text-cyan-400 font-bold bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-600/40 text-[8px]">
            CAP. {metrics.chapterNumber}
          </span>
        ) : (
          <span className="text-slate-400 font-normal hidden sm:inline text-[8px]">
            MANUSCRITO
          </span>
        )}

        {/* Real-time Word Count */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[8px] hidden md:inline">PALABRAS:</span>
          <span className="font-bold text-white tracking-tight">
            {metrics.words.toLocaleString()}
          </span>
          <span className="text-slate-400 text-[8px] md:hidden">P</span>
          <span className="text-slate-400 text-[8px] hidden md:inline">PALS</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Real-time Character Count */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[8px] hidden md:inline">CARACTERES:</span>
          <span className="font-bold text-cyan-300 tracking-tight">
            {metrics.characters.toLocaleString()}
          </span>
          <span className="text-slate-400 text-[8px] md:hidden">C</span>
          <span className="text-slate-400 text-[8px] hidden md:inline">CARS</span>
        </div>

        {/* Live typing indicator dot */}
        {metrics.isTyping ? (
          <span className="inline-flex items-center gap-1 text-[8px] text-emerald-400 font-bold animate-pulse hidden lg:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
            <span>EN VIVO</span>
          </span>
        ) : (
          <span className="text-slate-500 text-[8px] hidden xl:inline">
            (~{metrics.readingTimeMinutes}m)
          </span>
        )}
      </button>

      {/* Floating Detailed Hover Card */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-[#090d16] border border-cyan-500/50 rounded shadow-2xl z-50 text-[10px] font-mono text-slate-300 space-y-2 pointer-events-none animate-fadeIn backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>MÉTRICAS DEL MANUSCRITO</span>
            </div>
            {metrics.isTyping ? (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                ESCRIBIENDO
              </span>
            ) : (
              <span className="text-[8px] text-slate-500 font-normal">
                SINCRONIZADO
              </span>
            )}
          </div>

          {/* Chapter Specific Metrics */}
          <div className="space-y-1">
            <div className="text-white font-bold text-xs truncate">
              {metrics.chapterTitle || `Capítulo ${metrics.chapterNumber}`}
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[9px]">
              <div className="p-1.5 bg-[#0f172a]/60 border border-slate-800 rounded">
                <span className="text-slate-400 block text-[8px]">PALABRAS ESCENA</span>
                <span className="text-white font-bold text-xs">{metrics.words.toLocaleString()}</span>
              </div>
              <div className="p-1.5 bg-[#0f172a]/60 border border-slate-800 rounded">
                <span className="text-slate-400 block text-[8px]">CARACTERES (TOTAL)</span>
                <span className="text-cyan-300 font-bold text-xs">{metrics.characters.toLocaleString()}</span>
              </div>
              <div className="p-1.5 bg-[#0f172a]/60 border border-slate-800 rounded">
                <span className="text-slate-400 block text-[8px]">SIN ESPACIOS</span>
                <span className="text-slate-300 font-bold">{metrics.charactersWithoutSpaces.toLocaleString()}</span>
              </div>
              <div className="p-1.5 bg-[#0f172a]/60 border border-slate-800 rounded">
                <span className="text-slate-400 block text-[8px]">TIEMPO LECTURA</span>
                <span className="text-amber-300 font-bold">~{metrics.readingTimeMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Global Novel Totals */}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
            <span>Total Novela Completa:</span>
            <span className="text-white font-bold">
              {metrics.totalNovelWords.toLocaleString()} <span className="text-slate-500 text-[8px]">palabras</span>
            </span>
          </div>

          <div className="text-[8px] text-cyan-400/80 italic text-center pt-0.5">
            Actualización reactiva en tiempo real al pulsar cada tecla
          </div>
        </div>
      )}
    </div>
  );
};
