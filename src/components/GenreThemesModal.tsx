import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  BookOpen, 
  Sliders, 
  Layers, 
  Compass, 
  ShieldCheck, 
  Feather, 
  Scroll, 
  Search, 
  Heart, 
  Globe, 
  Info,
  ChevronRight
} from 'lucide-react';
import { GENRE_PRESETS, VISUAL_THEMES } from '../data/genrePresets';
import { useGenrePreset } from '../services/genrePresetService';
import { GenrePresetId, VisualThemeId } from '../types';

interface GenreThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorldbuildingCustomizer?: () => void;
}

export const GenreThemesModal: React.FC<GenreThemesModalProps> = ({ isOpen, onClose, onOpenWorldbuildingCustomizer }) => {
  const { genreId, themeId, currentGenre, currentTheme, setGenre, setTheme, resetToDefault, isDefaultSciFi } = useGenrePreset();
  const [activeTab, setActiveTab] = useState<'genres' | 'themes'>('genres');

  if (!isOpen) return null;

  const genreList = Object.values(GENRE_PRESETS);
  const themeList = Object.values(VISUAL_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono text-xs select-none">
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-gradient-to-r from-[#0d121c] to-[#080b11]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  PERSONALIZACIÓN DE GÉNERO & TEMAS
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                  PRESET: {currentGenre.shortName.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adapta la estética visual y la terminología de worldbuilding al género de tu historia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#070a0f] px-6">
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('genres')}
              className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === 'genres'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Presets de Género & Terminología</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 ml-1">
                {genreList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('themes')}
              className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-all ${
                activeTab === 'themes'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Paleta Visual & Atmósfera</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 ml-1">
                {themeList.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWorldbuildingCustomizer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWorldbuildingCustomizer();
                }}
                className="py-1.5 px-3 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors text-[11px]"
                title="Personalización avanzada: renombra módulos, cambia iconos y oculta secciones"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personalizar Módulos 100%</span>
              </button>
            )}

            {!isDefaultSciFi && (
              <button
                onClick={() => resetToDefault()}
                className="py-1.5 px-3 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors text-[11px]"
                title="Restaurar a la configuración predeterminada de Kernel del Vacío"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Restaurar Hard SF Original</span>
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENRE PRESETS */}
          {activeTab === 'genres' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <strong className="text-white">¿Cómo funcionan los presets de género?</strong> Al elegir un género, la aplicación adapta automáticamente los títulos de los módulos, las secciones de la biblia y las categorías de worldbuilding para encajar con las convenciones narrativas de tu obra.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Tus capítulos y textos se mantienen seguros al 100%. Solo cambia la semántica del entorno de trabajo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {genreList.map((preset) => {
                  const isSelected = genreId === preset.id;
                  const isDefault = preset.id === 'scifi';

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setGenre(preset.id, true)}
                      className={`cursor-pointer rounded-lg p-4 border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#101726] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400'
                          : 'bg-[#0d1017] border-[#1e293b] hover:border-slate-600 hover:bg-[#111622]'
                      }`}
                    >
                      <div>
                        {/* Title & Tag */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white tracking-wide">
                                {preset.name}
                              </h3>
                              {isDefault && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono">
                                  ORIGINAL
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-cyan-400/90 font-sans mt-0.5 font-medium">
                              {preset.tagline}
                            </p>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            isSelected 
                              ? 'bg-cyan-500 border-cyan-400 text-black' 
                              : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed font-sans">
                          {preset.description}
                        </p>

                        {/* Adaptation Sample Preview */}
                        <div className="bg-[#080b11] border border-[#1e293b] rounded p-2.5 space-y-1.5 text-[11px] font-mono">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Adaptación de Módulos & Worldbuilding:
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="text-slate-400 truncate">
                              <span className="text-slate-500">• </span>{preset.terms.architectureTitle}
                            </div>
                            <div className="text-slate-400 truncate">
                              <span className="text-slate-500">• </span>{preset.terms.factionsTitle}
                            </div>
                            <div className="text-slate-400 truncate">
                              <span className="text-slate-500">• </span>{preset.terms.atlasTitle}
                            </div>
                            <div className="text-slate-400 truncate">
                              <span className="text-slate-500">• </span>{preset.terms.loreTitle}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Tema visual sugerido: <strong className="text-slate-300">{VISUAL_THEMES[preset.defaultThemeId]?.name.split(' ')[0]}</strong>
                        </span>

                        <span className={`text-[11px] font-mono font-medium flex items-center gap-1 ${
                          isSelected ? 'text-cyan-400 font-bold' : 'text-slate-400'
                        }`}>
                          {isSelected ? 'Activo actualmente' : 'Seleccionar preset'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
                <Palette className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p>
                    <strong className="text-white">Personalización estética independiente:</strong> Puedes usar cualquier paleta de colores independientemente del preset de género seleccionado. Por ejemplo, escribir una novela fantástica en modo minimalista o una policiaca con la paleta de cian y obsidiana.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeList.map((t) => {
                  const isSelected = themeId === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`cursor-pointer rounded-lg p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#101726] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400'
                          : 'bg-[#0d1017] border-[#1e293b] hover:border-slate-600 hover:bg-[#111622]'
                      }`}
                    >
                      <div>
                        {/* Swatches bar */}
                        <div className="flex h-6 w-full rounded overflow-hidden mb-3 border border-slate-800">
                          {t.previewColors.map((color, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {/* Title & Check */}
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            {t.name}
                          </h3>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                            isSelected 
                              ? 'bg-cyan-500 border-cyan-400 text-black' 
                              : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans mb-3 leading-relaxed">
                          {t.tagline}
                        </p>

                        {/* Typography Preview */}
                        <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 mb-3 space-y-1">
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>TIPOGRAFÍA:</span>
                            <span className="font-semibold text-white">{t.fontLabel || t.fontClass}</span>
                          </div>
                          <div 
                            className="text-xs text-slate-200 truncate pt-0.5"
                            style={{ fontFamily: t.fontFamily }}
                          >
                            «El mundo no es como parece...»
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: t.primaryHex }}
                          />
                          <span>Acento: {t.primaryHex}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isSelected 
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' 
                            : 'text-slate-400 hover:text-white'
                        }`}>
                          {isSelected ? 'Activo Ahora' : 'Activar Tema'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e293b] bg-[#07090e] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentGenre.accentColor }} 
            />
            <span className="text-slate-300">
              GÉNERO: <strong className="text-white">{currentGenre.name}</strong> • TEMA: <strong className="text-white">{currentTheme.name}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
