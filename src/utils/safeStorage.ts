/**
 * Safe, validated wrapper around localStorage JSON reads/writes.
 *
 * Problem this solves: throughout the app, components read manuscript data
 * (chapters, characters, lore, timeline events) directly from localStorage
 * with `JSON.parse` wrapped in a bare `try { } catch (e) {}`. If the stored
 * value is ever corrupted (a full storage quota mid-write, a browser
 * extension touching localStorage, manual tampering, a future schema
 * change), that parse throws, the error is swallowed silently, and the
 * component falls back to the bundled *demo* data — which looks to the
 * user exactly like their real manuscript vanished.
 *
 * `readJSON` never lets that happen silently: a corrupted value is first
 * preserved verbatim under a backup key (so nothing is actually destroyed),
 * then a `krnl_storage_corrupted` event is dispatched so the UI can surface
 * a visible warning, and only then does it fall back to the caller-provided
 * default.
 */

export const STORAGE_CORRUPTION_EVENT = 'krnl_storage_corrupted';

export interface StorageCorruptionDetail {
  key: string;
  backupKey: string | null;
  error: string;
}

const CORRUPT_BACKUP_PREFIX = 'krnl_corrupt_backup__';

/**
 * In-memory log of corruption incidents detected during this page load.
 * Needed because the very first `readJSON` calls happen synchronously during
 * the initial render (inside `useState`/`useMemo` initializers), which runs
 * before any component has had a chance to mount an event listener for
 * `krnl_storage_corrupted`. UI that wants to display past incidents (not
 * just ones that happen after it mounts) should read this on mount.
 */
const corruptionLog: StorageCorruptionDetail[] = [];

export function getCorruptionLog(): StorageCorruptionDetail[] {
  return corruptionLog.slice();
}

/**
 * Reads and parses a JSON value from localStorage.
 * - Key absent (legitimate first run / nothing saved yet): returns `fallback`, no event.
 * - Key present but unparsable (corruption): preserves the raw value under a
 *   backup key, dispatches `krnl_storage_corrupted`, and returns `fallback`.
 * - Optional `validate` lets the caller reject a parsed-but-wrong-shaped
 *   value (e.g. not an array) and treat it the same as corruption.
 */
export function readJSON<T>(key: string, fallback: T, validate?: (value: unknown) => boolean): T {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch (err) {
    // localStorage itself can throw (private browsing, disabled storage, etc.)
    console.error(`[safeStorage] No se pudo acceder a localStorage para "${key}".`, err);
    return fallback;
  }

  if (raw === null) return fallback;

  try {
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) {
      throw new Error('El valor guardado no tiene la forma esperada.');
    }
    return parsed as T;
  } catch (err) {
    reportCorruption(key, raw, err);
    return fallback;
  }
}

function reportCorruption(key: string, raw: string, err: unknown): void {
  let backupKey: string | null = null;
  try {
    backupKey = `${CORRUPT_BACKUP_PREFIX}${key}__${Date.now()}`;
    localStorage.setItem(backupKey, raw);
  } catch {
    // Storage may be full; we tried our best to preserve the raw data.
    backupKey = null;
  }

  const message = err instanceof Error ? err.message : String(err);
  if (!corruptionLog.some((i) => i.key === key)) {
    corruptionLog.push({ key, backupKey, error: message });
  }
  console.error(
    `[safeStorage] "${key}" contenía datos corruptos y no se pudo cargar. ` +
      (backupKey
        ? `Se guardó una copia de seguridad del valor original en "${backupKey}".`
        : 'No se pudo preservar una copia de seguridad (almacenamiento lleno).'),
    err
  );

  if (typeof window !== 'undefined') {
    // Deferred: `readJSON` is frequently called during React's render phase
    // (useState/useMemo initializers). Dispatching synchronously here would
    // run any listener (e.g. a banner's setState) in the middle of that
    // render, which React flags as an illegal cross-component update. A
    // microtask lets the current render finish first.
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent<StorageCorruptionDetail>(STORAGE_CORRUPTION_EVENT, {
          detail: { key, backupKey, error: message },
        })
      );
    });
  }
}

/** Serializes and writes a value to localStorage. */
export function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Validator helper: value must be a non-empty array. */
export function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/** Validator helper: value must be an array (may be empty). */
export function isArray(value: unknown): boolean {
  return Array.isArray(value);
}
