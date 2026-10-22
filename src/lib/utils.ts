/**
 * Small shared helpers.
 */

/**
 * Copy text to the clipboard, falling back to a hidden textarea + `execCommand`
 * when the async Clipboard API is unavailable or rejected (e.g. insecure
 * contexts, or a denied permission prompt).
 *
 * @param text The text to copy.
 * @returns True when the copy succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Read text from the system clipboard.
 *
 * @returns The clipboard text, or null when access was denied / unavailable.
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null;
    const text = await navigator.clipboard.readText();
    return text ?? null;
  } catch {
    return null;
  }
}

/**
 * Join conditional class names.
 *
 * @param values Class names, or falsy values to omit.
 * @returns The joined class string.
 */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
