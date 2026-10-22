import { useCallback, useEffect, useState } from 'react';

import { addToHistory, clearHistory, loadHistory, saveHistory } from '../lib/history';

/**
 * The locally cached list of recently used secret keys.
 *
 * @returns The history array plus mutators.
 */
export function useHistory() {
  const [history, setHistory] = useState<string[]>(() => loadHistory());

  // Keep multiple tabs / windows in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === '2fa_history') {
        setHistory(loadHistory());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Remember a secret (newest first, de-duplicated, max 3). */
  const remember = useCallback((secret: string) => {
    setHistory(addToHistory(secret));
  }, []);

  /** Forget every cached secret. */
  const forget = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  /** Replace the whole history (used by tests and by manual ordering). */
  const replace = useCallback((secrets: string[]) => {
    saveHistory(secrets);
    setHistory(loadHistory());
  }, []);

  return { history, remember, forget, replace };
}
