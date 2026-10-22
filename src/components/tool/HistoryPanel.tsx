import { LockIcon } from '../Icons';
import { maskSecret } from '../../lib/history';

interface HistoryPanelProps {
  /** The cached secrets, newest first. */
  secrets: string[];
  /** Map of secret -> formatted live code. */
  codes: Record<string, string>;
  /** Load a secret back into the tool. */
  onSelect: (secret: string) => void;
  /** Wipe the local cache. */
  onClear: () => void;
}

/**
 * The "Recent Keys (Local Cache)" panel.
 *
 * Only the first and last four characters of each secret are shown; the raw
 * secret never appears on screen. Everything lives in `localStorage`.
 *
 * @param props Component props.
 * @returns The history panel (or null when the cache is empty).
 */
export function HistoryPanel({ secrets, codes, onSelect, onClear }: HistoryPanelProps) {
  if (secrets.length === 0) return null;

  return (
    <div id="history-section" className="w-full mt-6 slide-up">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Recent Keys (Local Cache)
        </h4>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-brand-neon/70 hover:text-brand-neon transition-colors"
        >
          Clear
        </button>
      </div>

      <div id="history-list" className="space-y-2">
        {secrets.map((secret) => (
          <button
            key={secret}
            type="button"
            onClick={() => onSelect(secret)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-dark/40 border border-brand-border/50 hover:bg-brand-dark/80 hover:border-brand-neon/50 transition-all text-left group"
          >
            <span className="flex flex-col">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <LockIcon className="w-3 h-3 text-brand-accent" /> {maskSecret(secret)}
              </span>
            </span>
            <span className="font-mono font-bold text-brand-neon text-lg group-hover:drop-shadow-[0_0_5px_currentColor] transition-all">
              {codes[secret] ?? '------'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
