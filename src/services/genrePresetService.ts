import { useState, useEffect } from 'react';
import { GenrePreset, VisualTheme, GenrePresetId, VisualThemeId, GenreTerms } from '../types';
import { GENRE_PRESETS, VISUAL_THEMES } from '../data/genrePresets';

const STORAGE_GENRE_KEY = 'krnl_active_genre_preset_v1';
const STORAGE_THEME_KEY = 'krnl_active_theme_v1';

export function getActiveGenreId(): GenrePresetId {
  try {
    const saved = localStorage.getItem(STORAGE_GENRE_KEY) as GenrePresetId;
    if (saved && GENRE_PRESETS[saved]) {
      return saved;
    }
  } catch (e) {}
  return 'scifi';
}

export function getActiveThemeId(): VisualThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY) as VisualThemeId;
    if (saved && VISUAL_THEMES[saved]) {
      return saved;
    }
  } catch (e) {}
  return 'cyber';
}

export function getActiveGenrePreset(): GenrePreset {
  return GENRE_PRESETS[getActiveGenreId()] || GENRE_PRESETS.scifi;
}

export function getActiveVisualTheme(): VisualTheme {
  return VISUAL_THEMES[getActiveThemeId()] || VISUAL_THEMES.cyber;
}

export function getActiveGenre(): GenrePreset {
  return getActiveGenrePreset();
}

export function getActiveGenreTerms(): GenreTerms {
  return getActiveGenrePreset().terms;
}

export function setActiveGenre(presetId: GenrePresetId, alsoApplyDefaultTheme = true): void {
  const preset = GENRE_PRESETS[presetId];
  if (!preset) return;

  try {
    localStorage.setItem(STORAGE_GENRE_KEY, presetId);
    if (alsoApplyDefaultTheme) {
      setActiveVisualTheme(preset.defaultThemeId);
    }
  } catch (e) {}

  applyThemeToDOM(alsoApplyDefaultTheme ? preset.defaultThemeId : getActiveThemeId());
  window.dispatchEvent(new CustomEvent('krnl_genre_changed', { detail: { genreId: presetId } }));
}

export function setActiveVisualTheme(themeId: VisualThemeId): void {
  const theme = VISUAL_THEMES[themeId];
  if (!theme) return;

  try {
    localStorage.setItem(STORAGE_THEME_KEY, themeId);
  } catch (e) {}

  applyThemeToDOM(themeId);
  window.dispatchEvent(new CustomEvent('krnl_theme_changed', { detail: { themeId } }));
}

export function resetGenreAndThemeToDefault(): void {
  setActiveGenre('scifi', true);
}

/**
 * Applies CSS root variables and body classes according to selected visual theme.
 */
export function applyThemeToDOM(themeId: VisualThemeId): void {
  if (typeof document === 'undefined') return;

  const theme = VISUAL_THEMES[themeId] || VISUAL_THEMES.cyber;
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--theme-primary', theme.primaryHex);
  root.style.setProperty('--theme-secondary', theme.secondaryHex);
  root.style.setProperty('--theme-bg', theme.bgHex);
  root.style.setProperty('--theme-panel', theme.panelHex);
  root.style.setProperty('--theme-border', theme.borderHex);
  root.style.setProperty('--theme-font', theme.fontFamily || "'Fira Code', monospace");
  root.style.setProperty('--theme-heading-font', theme.headingFont || "'Space Grotesk', sans-serif");
  root.style.setProperty('--theme-body-font', theme.bodyFont || "'Fira Code', monospace");

  // Set class on document body for targeted CSS rules
  const allThemeClasses = Object.values(VISUAL_THEMES).map(t => t.cssClass);
  document.body.classList.remove(...allThemeClasses);
  document.body.classList.add(theme.cssClass);

  document.body.style.backgroundColor = theme.bgHex;
  if (theme.bodyFont) {
    document.body.style.fontFamily = theme.bodyFont;
  }
}

/**
 * Custom React hook for subscribing to Genre and Theme state updates
 */
export function useGenrePreset() {
  const [genreId, setGenreIdState] = useState<GenrePresetId>(() => getActiveGenreId());
  const [themeId, setThemeIdState] = useState<VisualThemeId>(() => getActiveThemeId());

  useEffect(() => {
    // Apply current theme on mount
    applyThemeToDOM(getActiveThemeId());

    const handleGenreChange = (e: any) => {
      setGenreIdState(e.detail?.genreId || getActiveGenreId());
    };

    const handleThemeChange = (e: any) => {
      setThemeIdState(e.detail?.themeId || getActiveThemeId());
    };

    window.addEventListener('krnl_genre_changed', handleGenreChange);
    window.addEventListener('krnl_theme_changed', handleThemeChange);

    return () => {
      window.removeEventListener('krnl_genre_changed', handleGenreChange);
      window.removeEventListener('krnl_theme_changed', handleThemeChange);
    };
  }, []);

  const currentGenre = GENRE_PRESETS[genreId] || GENRE_PRESETS.scifi;
  const currentTheme = VISUAL_THEMES[themeId] || VISUAL_THEMES.cyber;
  const terms: GenreTerms = currentGenre.terms;

  const setGenre = (id: GenrePresetId, applyDefaultTheme = true) => {
    setActiveGenre(id, applyDefaultTheme);
  };

  const setTheme = (id: VisualThemeId) => {
    setActiveVisualTheme(id);
  };

  return {
    genreId,
    themeId,
    currentGenre,
    currentTheme,
    terms,
    setGenre,
    setTheme,
    resetToDefault: resetGenreAndThemeToDefault,
    isDefaultSciFi: genreId === 'scifi'
  };
}
