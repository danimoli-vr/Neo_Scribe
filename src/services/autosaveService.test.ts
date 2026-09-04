import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { autosaveService } from './autosaveService';

describe('autosaveService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('immediately writes when immediate is true', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    autosaveService.scheduleSave('test_key_immediate', { hello: 'world' }, true);

    expect(localStorage.getItem('test_key_immediate')).toBe(JSON.stringify({ hello: 'world' }));
    expect(autosaveService.getStatus()).toBe('synced');
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'krnl_storage_synced'
      })
    );
    dispatchSpy.mockRestore();
  });

  it('debounces writes until 3000ms idle time has elapsed', () => {
    autosaveService.scheduleSave('test_key_debounced', { counter: 1 }, false);

    expect(autosaveService.getStatus()).toBe('pending');
    expect(localStorage.getItem('test_key_debounced')).toBeNull();

    // Advance 1500ms - should still be pending
    vi.advanceTimersByTime(1500);
    expect(autosaveService.getStatus()).toBe('pending');
    expect(localStorage.getItem('test_key_debounced')).toBeNull();

    // User types again, resetting the timer
    autosaveService.scheduleSave('test_key_debounced', { counter: 2 }, false);
    vi.advanceTimersByTime(2000);
    expect(autosaveService.getStatus()).toBe('pending');
    expect(localStorage.getItem('test_key_debounced')).toBeNull();

    // Advance remaining 1000ms (to hit 3000ms from the second save) + 50ms flush timeout
    vi.advanceTimersByTime(1000);
    expect(autosaveService.getStatus()).toBe('saving');
    vi.advanceTimersByTime(50);

    expect(autosaveService.getStatus()).toBe('synced');
    expect(localStorage.getItem('test_key_debounced')).toBe(JSON.stringify({ counter: 2 }));
  });

  it('subscribes to status updates correctly', () => {
    const listener = vi.fn();
    const unsubscribe = autosaveService.subscribe(listener);

    expect(listener).toHaveBeenCalledWith(expect.any(String), expect.any(Date), undefined);

    autosaveService.scheduleSave('test_key_sub', 'data', false);
    expect(listener).toHaveBeenCalledWith('pending', expect.any(Date), undefined);

    unsubscribe();
    listener.mockClear();
    autosaveService.flushImmediate();
    expect(listener).not.toHaveBeenCalled();
  });
});
