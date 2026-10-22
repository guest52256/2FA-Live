/**
 * Local cache of recently used secret keys.
 *
 * The source project keeps the three most recently used secrets in
 * `localStorage` under the key `2fa_history` (newest first, de-duplicated).
 * Nothing is ever sent to a server — this is a purely local convenience cache
 * that the user can wipe at any time.
 */

export const HISTORY_STORAGE_KEY = '2fa_history';
export const MAX_HISTORY = 3;

/**
 * Read the cached history from localStorage.
 *
 * @returns The cached secrets, newest first. Empty when storage is unavailable.
 */
export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/**
 * Persist the history to localStorage.
 *
 * @param secrets The secrets to persist, newest first.
 */
export function saveHistory(secrets: string[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(secrets.slice(0, MAX_HISTORY)));
  } catch {
    /* Storage may be unavailable (private mode, quota). The app still works. */
  }
}

/**
 * Push a secret to the front of the history, de-duplicating and trimming to
 * the three most recent entries.
 *
 * @param secret The secret to remember.
 * @returns The updated history.
 */
export function addToHistory(secret: string): string[] {
  if (!secret) return loadHistory();
  const history = loadHistory().filter((item) => item !== secret);
  history.unshift(secret);
  const trimmed = history.slice(0, MAX_HISTORY);
  saveHistory(trimmed);
  return trimmed;
}

/**
 * Remove every cached secret.
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Mask a secret for display: `JBSWY3DPEHPK3PXP` -> `JBSW •••• 3PXP`.
 *
 * @param secret The secret to mask.
 * @returns The masked representation.
 */
export function maskSecret(secret: string): string {
  if (secret.length < 8) {
    return `${secret.slice(0, 1)} ••••`;
  }
  return `${secret.slice(0, 4)} •••• ${secret.slice(-4)}`;
}
