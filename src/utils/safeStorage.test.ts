import { describe, it, expect, beforeEach } from 'vitest';
import { readJSON, writeJSON, isArray, isNonEmptyArray, getCorruptionLog, STORAGE_CORRUPTION_EVENT } from './safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('readJSON', () => {
    it('returns the fallback when the key does not exist yet (legitimate first run)', () => {
      expect(readJSON('missing_key', ['fallback'])).toEqual(['fallback']);
    });

    it('parses and returns a validly stored value', () => {
      localStorage.setItem('my_key', JSON.stringify([{ id: 1 }]));
      expect(readJSON('my_key', [])).toEqual([{ id: 1 }]);
    });

    it('falls back to the default AND preserves a backup when the stored value is corrupted JSON', () => {
      localStorage.setItem('krnl_chapters_v1', '{not valid json!!!');

      const result = readJSON('krnl_chapters_v1', ['DEFAULT']);

      // The caller gets the safe fallback instead of crashing the app.
      expect(result).toEqual(['DEFAULT']);

      // Critically, the original corrupted value is NOT lost: a backup key exists
      // holding the raw original string, so it could be recovered/inspected later.
      const backupKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith('krnl_corrupt_backup__krnl_chapters_v1__')
      );
      expect(backupKeys.length).toBeGreaterThan(0);
      expect(localStorage.getItem(backupKeys[0])).toBe('{not valid json!!!');
    });

    it('records the incident in the corruption log for UI banners that mount after the fact', () => {
      localStorage.setItem('krnl_lore_items_v1', 'not json');
      readJSON('krnl_lore_items_v1', []);
      const log = getCorruptionLog();
      expect(log.some((entry) => entry.key === 'krnl_lore_items_v1')).toBe(true);
    });

    it('dispatches a STORAGE_CORRUPTION_EVENT so a mounted banner can react immediately', async () => {
      localStorage.setItem('krnl_characters_v1', '{{{broken');

      const eventPromise = new Promise<CustomEvent>((resolve) => {
        window.addEventListener(STORAGE_CORRUPTION_EVENT, (e) => resolve(e as CustomEvent), { once: true });
      });

      readJSON('krnl_characters_v1', []);

      const event = await eventPromise;
      expect(event.detail.key).toBe('krnl_characters_v1');
    });

    it('treats a value that fails a custom validator the same as corruption (falls back, does not throw)', () => {
      localStorage.setItem('krnl_chapters_v1', JSON.stringify('not an array'));
      const result = readJSON('krnl_chapters_v1', ['DEFAULT'], isArray);
      expect(result).toEqual(['DEFAULT']);
    });

    it('does not treat an empty array as corruption when using isArray (intentional "delete everything")', () => {
      localStorage.setItem('krnl_chapters_v1', JSON.stringify([]));
      expect(readJSON('krnl_chapters_v1', ['DEFAULT'], isArray)).toEqual([]);
    });

    it('falls back on an empty array when using isNonEmptyArray', () => {
      localStorage.setItem('krnl_chapters_v1', JSON.stringify([]));
      expect(readJSON('krnl_chapters_v1', ['DEFAULT'], isNonEmptyArray)).toEqual(['DEFAULT']);
    });
  });

  describe('writeJSON', () => {
    it('round-trips a value through localStorage', () => {
      writeJSON('some_key', { a: 1, b: [2, 3] });
      expect(readJSON('some_key', null)).toEqual({ a: 1, b: [2, 3] });
    });
  });
});
