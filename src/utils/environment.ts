/**
 * Environment detection and Desktop Native Runtime bridge.
 * Detects whether the application is running inside a native desktop shell
 * (such as Tauri, Electron, or NW.js) or in a standard browser environment.
 */

export interface DesktopBridgeInfo {
  isDesktop: boolean;
  platform: 'tauri' | 'electron' | 'browser';
  hasNativeFS: boolean;
}

declare global {
  interface Window {
    __TAURI__?: any;
    electron?: any;
    electronAPI?: any;
    __ELECTRON_BRIDGE__?: any;
  }
}

export function detectEnvironment(): DesktopBridgeInfo {
  if (typeof window === 'undefined') {
    return { isDesktop: false, platform: 'browser', hasNativeFS: false };
  }

  // 1. Check for manual override (useful for dev testing / previewing desktop behavior)
  const manualMode = localStorage.getItem('krnl_environment_mode');
  if (manualMode === 'desktop') {
    return { isDesktop: true, platform: 'tauri', hasNativeFS: true };
  }

  // 2. Check for Tauri runtime
  if (window.__TAURI__ !== undefined) {
    return {
      isDesktop: true,
      platform: 'tauri',
      hasNativeFS: true,
    };
  }

  // 3. Check for Electron runtime
  if (
    window.electron !== undefined ||
    window.electronAPI !== undefined ||
    window.__ELECTRON_BRIDGE__ !== undefined ||
    (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron'))
  ) {
    return {
      isDesktop: true,
      platform: 'electron',
      hasNativeFS: true,
    };
  }

  // Default browser environment
  return {
    isDesktop: false,
    platform: 'browser',
    hasNativeFS: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
  };
}

export function isDesktopApp(): boolean {
  return detectEnvironment().isDesktop;
}

/**
 * Toggle simulation mode for development/testing
 */
export function setSimulatedEnvironment(mode: 'auto' | 'desktop' | 'web'): void {
  if (mode === 'auto') {
    localStorage.removeItem('krnl_environment_mode');
  } else {
    localStorage.setItem('krnl_environment_mode', mode);
  }
  window.dispatchEvent(new CustomEvent('krnl_environment_changed', { detail: { mode } }));
}
