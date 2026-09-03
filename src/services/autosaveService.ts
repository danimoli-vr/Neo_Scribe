/**
 * KRNL.VACUO - Substrate Autosave Engine
 * Automatically debounces writes to localStorage when 3 seconds of keyboard/input silence elapse.
 * Dispatches sync telemetry and handles window beforeunload and Ctrl+S shortcuts.
 */

export type AutosaveStatus = 'synced' | 'pending' | 'saving' | 'error';

export interface AutosaveListener {
  (status: AutosaveStatus, lastSaved: Date, error?: string): void;
}

class AutosaveService {
  private status: AutosaveStatus = 'synced';
  private lastSaved: Date = new Date();
  private lastError?: string;
  private pendingSaves: Map<string, any> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<AutosaveListener> = new Set();
  private readonly DEBOUNCE_MS = 3000; // 3 seconds idle timer

  constructor() {
    // Flush pending changes before page unloads or refreshes
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushImmediate();
      });

      // Global shortcut Ctrl+S / Cmd+S for instant manual sync
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.flushImmediate();
        }
      });
    }
  }

  public getStatus(): AutosaveStatus {
    return this.status;
  }

  public getLastSaved(): Date {
    return this.lastSaved;
  }

  public getLastError(): string | undefined {
    return this.lastError;
  }

  public subscribe(listener: AutosaveListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.status, this.lastSaved, this.lastError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.status, this.lastSaved, this.lastError);
      } catch (err) {
        console.error('Autosave listener error:', err);
      }
    });
  }

  /**
   * Called whenever user types or modifies state.
   * Debounces the actual write to localStorage until 3s of silence pass.
   */
  public scheduleSave(key: string, data: any, immediate = false): void {
    this.pendingSaves.set(key, data);

    if (immediate) {
      this.flushImmediate();
      return;
    }

    // Set status to pending
    if (this.status !== 'pending') {
      this.status = 'pending';
      this.notify();
    }

    // Reset 3-second debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.DEBOUNCE_MS);
  }

  /**
   * Explicitly notify that a keystroke occurred to reset the 3-second window
   */
  public notifyKeyStroke(): void {
    if (this.pendingSaves.size > 0) {
      if (this.status !== 'pending') {
        this.status = 'pending';
        this.notify();
      }
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.flush();
      }, this.DEBOUNCE_MS);
    }
  }

  /**
   * Performs the debounced save
   */
  private flush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingSaves.size === 0) {
      this.status = 'synced';
      this.notify();
      return;
    }

    this.status = 'saving';
    this.notify();

    // Minor timeout to allow UI to render saving state, then write to localStorage
    setTimeout(() => {
      this.executeStorageWrite();
    }, 50);
  }

  /**
   * Immediately writes to localStorage without waiting for the 3s timer
   */
  public flushImmediate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingSaves.size === 0) {
      this.status = 'synced';
      this.notify();
      return;
    }

    this.executeStorageWrite();
  }

  private executeStorageWrite(): void {
    try {
      const savedKeys: string[] = [];
      this.pendingSaves.forEach((value, key) => {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        savedKeys.push(key);
      });

      this.pendingSaves.clear();
      this.status = 'synced';
      this.lastSaved = new Date();
      this.lastError = undefined;

      // Broadcast event across application components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('krnl_storage_synced', {
            detail: { keys: savedKeys, timestamp: this.lastSaved.getTime() },
          })
        );
      }

      this.notify();
    } catch (err: any) {
      console.error('Failed to write to localStorage:', err);
      this.status = 'error';
      this.lastError = err?.message || 'Error de almacenamiento en localStorage';
      this.notify();
    }
  }
}

export const autosaveService = new AutosaveService();
