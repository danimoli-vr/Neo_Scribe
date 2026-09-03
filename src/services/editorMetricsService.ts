import { useState, useEffect } from 'react';
import { INITIAL_CHAPTERS } from '../data/canonicalLore';
import { Chapter } from '../types';

export interface EditorMetrics {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  readingTimeMinutes: number;
  totalNovelWords: number;
  totalNovelCharacters: number;
  isEditorActive: boolean;
  isTyping: boolean;
  lastUpdated: number;
}

// Compute word count safely
export const countWords = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

// Compute character count without spaces
export const countCharsWithoutSpaces = (text: string): number => {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
};

// Compute reading time in minutes (standard 200 words per minute)
export const computeReadingTime = (words: number): number => {
  return Math.max(1, Math.round(words / 200));
};

// Compute initial metrics from localStorage or initial chapters
const getInitialMetrics = (): EditorMetrics => {
  let chapters: Chapter[] = INITIAL_CHAPTERS;
  try {
    const saved = localStorage.getItem('krnl_chapters_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        chapters = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading chapters for metrics:', e);
  }

  const firstChap = chapters[0];
  const firstContent = firstChap?.content || '';
  const firstWords = firstChap?.wordCount || countWords(firstContent);
  const firstChars = firstContent.length;
  const firstCharsNoSpaces = countCharsWithoutSpaces(firstContent);

  const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || countWords(c.content || '')), 0);
  const totalChars = chapters.reduce((acc, c) => acc + (c.content ? c.content.length : 0), 0);

  return {
    chapterId: firstChap?.id || 'CHAP_01',
    chapterNumber: firstChap?.number || 1,
    chapterTitle: firstChap?.title || 'Capítulo 1',
    words: firstWords,
    characters: firstChars,
    charactersWithoutSpaces: firstCharsNoSpaces,
    readingTimeMinutes: computeReadingTime(firstWords),
    totalNovelWords: totalWords,
    totalNovelCharacters: totalChars,
    isEditorActive: false,
    isTyping: false,
    lastUpdated: Date.now()
  };
};

class EditorMetricsService {
  private currentMetrics: EditorMetrics = getInitialMetrics();
  private listeners: Set<(metrics: EditorMetrics) => void> = new Set();
  private typingTimeoutId: any = null;

  public getMetrics(): EditorMetrics {
    return this.currentMetrics;
  }

  public subscribe(listener: (metrics: EditorMetrics) => void): () => void {
    this.listeners.add(listener);
    // Send current immediately upon subscription
    listener(this.currentMetrics);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentMetrics);
      } catch (err) {
        console.error('Error in editor metrics listener:', err);
      }
    });
  }

  /**
   * Update metrics immediately on every keystroke or change
   */
  public updateMetrics(updates: Partial<EditorMetrics>, triggerTypingIndicator = false) {
    let words = updates.words !== undefined ? updates.words : this.currentMetrics.words;
    let characters = updates.characters !== undefined ? updates.characters : this.currentMetrics.characters;
    let charactersWithoutSpaces = updates.charactersWithoutSpaces !== undefined 
      ? updates.charactersWithoutSpaces 
      : this.currentMetrics.charactersWithoutSpaces;

    const readingTimeMinutes = computeReadingTime(words);

    this.currentMetrics = {
      ...this.currentMetrics,
      ...updates,
      words,
      characters,
      charactersWithoutSpaces,
      readingTimeMinutes,
      isTyping: triggerTypingIndicator ? true : (updates.isTyping ?? this.currentMetrics.isTyping),
      lastUpdated: Date.now()
    };

    if (triggerTypingIndicator) {
      if (this.typingTimeoutId) {
        clearTimeout(this.typingTimeoutId);
      }
      this.typingTimeoutId = setTimeout(() => {
        this.currentMetrics = {
          ...this.currentMetrics,
          isTyping: false
        };
        this.notify();
      }, 1000);
    }

    this.notify();
  }

  /**
   * Helper called directly when chapter text changes in the editor
   */
  public reportChapterTextChange(params: {
    chapterId: string;
    chapterNumber: number;
    chapterTitle: string;
    content: string;
    allChapters?: Chapter[];
  }) {
    const { chapterId, chapterNumber, chapterTitle, content, allChapters } = params;
    const words = countWords(content);
    const characters = content.length;
    const charactersWithoutSpaces = countCharsWithoutSpaces(content);

    let totalNovelWords = this.currentMetrics.totalNovelWords;
    let totalNovelCharacters = this.currentMetrics.totalNovelCharacters;

    if (allChapters && allChapters.length > 0) {
      totalNovelWords = allChapters.reduce((acc, c) => {
        if (c.id === chapterId) {
          return acc + words;
        }
        return acc + (c.wordCount || countWords(c.content || ''));
      }, 0);

      totalNovelCharacters = allChapters.reduce((acc, c) => {
        if (c.id === chapterId) {
          return acc + characters;
        }
        return acc + (c.content ? c.content.length : 0);
      }, 0);
    }

    this.updateMetrics({
      chapterId,
      chapterNumber,
      chapterTitle,
      words,
      characters,
      charactersWithoutSpaces,
      totalNovelWords,
      totalNovelCharacters,
      isEditorActive: true
    }, true);
  }

  public setEditorActive(active: boolean) {
    if (this.currentMetrics.isEditorActive !== active) {
      this.currentMetrics = {
        ...this.currentMetrics,
        isEditorActive: active
      };
      this.notify();
    }
  }
}

export const editorMetricsService = new EditorMetricsService();

/**
 * Custom React hook to observe editor metrics in real-time
 */
export const useEditorMetrics = (): EditorMetrics => {
  const [metrics, setMetrics] = useState<EditorMetrics>(() => editorMetricsService.getMetrics());

  useEffect(() => {
    const unsubscribe = editorMetricsService.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
};
