import { CopyIcon } from '../Icons';

interface TokenDisplayProps {
  /** The formatted code, e.g. `123 456`. Empty when there is no secret. */
  code: string;
}

/**
 * The large, monospaced token readout.
 *
 * @param props Component props.
 * @returns The token element.
 */
export function TokenDisplay({ code }: TokenDisplayProps) {
  const hasCode = code.length > 0;

  return (
    <div className="text-center w-full mb-6 sm:mb-8">
      <div
        id="totp-output"
        aria-live="polite"
        aria-label={hasCode ? `Current one-time password ${code}` : 'No one-time password generated'}
        className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-widest cursor-text select-all min-h-[60px] sm:min-h-[88px] flex items-center justify-center bg-black/60 border border-brand-border rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] w-full ${
          hasCode ? 'token-text' : ''
        }`}
      >
        {hasCode ? (
          // The key forces a remount, which restarts the `pulse-code` animation
          // every time a fresh code is produced.
          <span key={code} className="pulse-code">
            {code}
          </span>
        ) : (
          <span className="text-slate-500">------</span>
        )}
      </div>
    </div>
  );
}

interface CopyCodeButtonProps {
  /**
   * Whether a code is available to copy.
   *
   * The button stays interactive when no code exists — clicking it raises the
   * "No code to copy" toast, exactly like the source project. It is therefore
   * deliberately **not** marked `aria-disabled`, so that assistive technology
   * can still activate it and reach the explanatory toast.
   */
  hasCode: boolean;
  /** Click handler. */
  onCopy: () => void;
}

/**
 * The gradient "Copy Code" action button.
 *
 * @param props Component props.
 * @returns The button element.
 */
export function CopyCodeButton({ hasCode, onCopy }: CopyCodeButtonProps) {
  return (
    <button
      type="button"
      onClick={onCopy}
      title={hasCode ? 'Copy the current one-time password' : 'Generate a code first'}
      className="w-full group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-neon to-brand-accent rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:-translate-y-1 active:translate-y-0"
    >
      <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
      <span className="relative flex items-center gap-2 text-lg">
        <CopyIcon className="w-5 h-5" />
        Copy Code
      </span>
    </button>
  );
}
