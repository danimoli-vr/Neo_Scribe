import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Chapter, NovelCharacter, LoreItem, TimelineEvent } from '../types';
import { INITIAL_CHAPTERS, CANONICAL_CHARACTERS, INITIAL_LORE_ITEMS } from '../data/canonicalLore';
import { readJSON, isArray } from '../utils/safeStorage';
import { autosaveService } from '../services/autosaveService';

/**
 * Single source of truth for the novel's persisted data (chapters, characters,
 * lore items, custom timeline events).
 *
 * Why this exists: before it, half a dozen components (App, ChapterEditorView,
 * StoryRelationsGraphView, TimelineView, LoreGeneratorView,
 * WorldbuildingExportModal...) each read the same localStorage keys
 * independently, with their own copy-pasted parsing/fallback logic and no way
 * to know when another component had changed the data. That meant, for
 * example, the relations graph could show stale data until the user
 * remembered to click a manual "Sincronizar" button.
 *
 * Design: this does NOT try to make every read instantly reactive to every
 * keystroke — that would force expensive whole-manuscript recomputations
 * (the story graph, the anachronism audit) to re-run on every character
 * typed in the chapter editor, which would make typing feel laggy. Instead:
 * - Writes always go through `autosaveService` (debounced unless
 *   `immediate` is passed), exactly as before.
 * - This context's own state is refreshed only when `autosaveService`
 *   actually finishes writing to localStorage (its `krnl_storage_synced`
 *   event), which happens either after the usual 3s idle debounce or
 *   immediately for explicit actions (delete, import, etc. pass
 *   `immediate: true`).
 * - Components with a genuine per-keystroke hot path (the chapter editor's
 *   textarea) keep their own local buffer state for instant feedback, seeded
 *   from this context and pushed back into it inside their existing debounce
 *   effect — the same pattern they already used against localStorage
 *   directly, just going through one typed, validated place instead of each
 *   reimplementing it.
 */

const CHAPTERS_KEY = 'krnl_chapters_v1';
const CHARACTERS_KEY = 'krnl_characters_v1';
const LORE_KEY = 'krnl_lore_items_v1';
const EVENTS_KEY = 'krnl_timeline_custom_events_v1';

export interface NovelDataContextValue {
  chapters: Chapter[];
  characters: NovelCharacter[];
  loreItems: LoreItem[];
  customTimelineEvents: TimelineEvent[];
  /** Persists `next` and (once the write lands) updates `chapters` for every consumer. */
  setChapters: (next: Chapter[], immediate?: boolean) => void;
  setCharacters: (next: NovelCharacter[], immediate?: boolean) => void;
  setLoreItems: (next: LoreItem[], immediate?: boolean) => void;
  setCustomTimelineEvents: (next: TimelineEvent[], immediate?: boolean) => void;
}

const NovelDataContext = createContext<NovelDataContextValue | null>(null);

export const NovelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chapters, setChaptersState] = useState<Chapter[]>(() =>
    readJSON(CHAPTERS_KEY, INITIAL_CHAPTERS, isArray)
  );
  const [characters, setCharactersState] = useState<NovelCharacter[]>(() =>
    readJSON(CHARACTERS_KEY, CANONICAL_CHARACTERS, isArray)
  );
  const [loreItems, setLoreItemsState] = useState<LoreItem[]>(() =>
    readJSON(LORE_KEY, INITIAL_LORE_ITEMS, isArray)
  );
  const [customTimelineEvents, setCustomTimelineEventsState] = useState<TimelineEvent[]>(() =>
    readJSON<TimelineEvent[]>(EVENTS_KEY, [], isArray)
  );

  // Refresh whichever piece of state just got persisted. autosaveService
  // reports exactly which keys it wrote in `event.detail.keys`, so an
  // autosave triggered by (say) the chapter editor doesn't cause the
  // characters/lore/events state to be re-parsed for no reason.
  useEffect(() => {
    const handleStorageSynced = (e: Event) => {
      const keys: string[] = (e as CustomEvent<{ keys?: string[] }>).detail?.keys || [];
      if (keys.includes(CHAPTERS_KEY)) {
        setChaptersState(readJSON(CHAPTERS_KEY, INITIAL_CHAPTERS, isArray));
      }
      if (keys.includes(CHARACTERS_KEY)) {
        setCharactersState(readJSON(CHARACTERS_KEY, CANONICAL_CHARACTERS, isArray));
      }
      if (keys.includes(LORE_KEY)) {
        setLoreItemsState(readJSON(LORE_KEY, INITIAL_LORE_ITEMS, isArray));
      }
      if (keys.includes(EVENTS_KEY)) {
        setCustomTimelineEventsState(readJSON<TimelineEvent[]>(EVENTS_KEY, [], isArray));
      }
    };
    window.addEventListener('krnl_storage_synced', handleStorageSynced);
    return () => window.removeEventListener('krnl_storage_synced', handleStorageSynced);
  }, []);

  const value: NovelDataContextValue = {
    chapters,
    characters,
    loreItems,
    customTimelineEvents,
    setChapters: (next, immediate = false) => autosaveService.scheduleSave(CHAPTERS_KEY, next, immediate),
    setCharacters: (next, immediate = false) => autosaveService.scheduleSave(CHARACTERS_KEY, next, immediate),
    setLoreItems: (next, immediate = false) => autosaveService.scheduleSave(LORE_KEY, next, immediate),
    setCustomTimelineEvents: (next, immediate = false) =>
      autosaveService.scheduleSave(EVENTS_KEY, next, immediate),
  };

  return <NovelDataContext.Provider value={value}>{children}</NovelDataContext.Provider>;
};

export function useNovelData(): NovelDataContextValue {
  const ctx = useContext(NovelDataContext);
  if (!ctx) {
    throw new Error('useNovelData() must be used within a <NovelDataProvider>.');
  }
  return ctx;
}
