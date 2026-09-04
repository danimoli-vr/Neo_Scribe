import { describe, it, expect } from 'vitest';
import { countWords, countCharsWithoutSpaces, computeReadingTime } from './editorMetricsService';

describe('countWords', () => {
  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  ')).toBe(0);
  });

  it('counts space-separated words', () => {
    expect(countWords('El sustrato de Planck')).toBe(4);
  });

  it('collapses multiple/irregular whitespace between words', () => {
    expect(countWords('  Uno    dos\n\ttres  ')).toBe(3);
  });

  it('counts a single word as 1', () => {
    expect(countWords('Solo')).toBe(1);
  });
});

describe('countCharsWithoutSpaces', () => {
  it('returns 0 for empty text', () => {
    expect(countCharsWithoutSpaces('')).toBe(0);
  });

  it('strips all whitespace (spaces, tabs, newlines) before counting', () => {
    expect(countCharsWithoutSpaces('a b\tc\nd')).toBe(4);
  });

  it('counts every non-whitespace character, including punctuation', () => {
    expect(countCharsWithoutSpaces('¡Kernel Panic!')).toBe(13);
  });
});

describe('computeReadingTime', () => {
  it('never returns less than 1 minute, even for 0 words', () => {
    expect(computeReadingTime(0)).toBe(1);
  });

  it('rounds to the nearest minute at 200 words per minute', () => {
    expect(computeReadingTime(200)).toBe(1);
    expect(computeReadingTime(400)).toBe(2);
    expect(computeReadingTime(550)).toBe(3); // 2.75 -> rounds up to 3
  });
});
