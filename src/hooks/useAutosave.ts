import { useState, useEffect, useCallback } from 'react';
import { autosaveService, AutosaveStatus } from '../services/autosaveService';

export interface UseAutosaveReturn {
  status: AutosaveStatus;
  lastSaved: Date;
  error?: string;
  scheduleSave: (key: string, data: any, immediate?: boolean) => void;
  flushImmediate: () => void;
  notifyKeyStroke: () => void;
}

export function useAutosave(): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>(autosaveService.getStatus());
  const [lastSaved, setLastSaved] = useState<Date>(autosaveService.getLastSaved());
  const [error, setError] = useState<string | undefined>(autosaveService.getLastError());

  useEffect(() => {
    const unsubscribe = autosaveService.subscribe((newStatus, newLastSaved, newError) => {
      setStatus(newStatus);
      setLastSaved(newLastSaved);
      setError(newError);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const scheduleSave = useCallback((key: string, data: any, immediate = false) => {
    autosaveService.scheduleSave(key, data, immediate);
  }, []);

  const flushImmediate = useCallback(() => {
    autosaveService.flushImmediate();
  }, []);

  const notifyKeyStroke = useCallback(() => {
    autosaveService.notifyKeyStroke();
  }, []);

  return {
    status,
    lastSaved,
    error,
    scheduleSave,
    flushImmediate,
    notifyKeyStroke,
  };
}
