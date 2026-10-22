import { useRef } from 'react';

import { CameraIcon, ClipboardIcon, UploadIcon, XIcon } from '../Icons';

interface SecretInputProps {
  /** The raw textarea value. */
  value: string;
  /** Change handler (raw user input). */
  onChange: (value: string) => void;
  /** Validation message to show, or null when the key is fine. */
  error: string | null;
  /** Paste-from-clipboard handler. */
  onPaste: () => void;
  /** Open the camera scanner. */
  onScan: () => void;
  /** Upload a QR image. */
  onUpload: (file: File) => void;
  /** Clear the input. */
  onClear: () => void;
}

/**
 * The secret-key input column of the tool card.
 *
 * @param props Component props.
 * @returns The input panel.
 */
export function SecretInput({
  value,
  onChange,
  error,
  onPaste,
  onScan,
  onUpload,
  onClear,
}: SecretInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-brand-border/50">
      <div className="flex justify-between items-end mb-4">
        <label
          htmlFor="secretKey"
          className="block text-sm font-semibold text-brand-neon uppercase tracking-wider"
        >
          Authentication Secret Key
        </label>
        <span
          id="validation-error"
          role="alert"
          className={`text-xs font-medium text-red-400 bg-red-400/10 px-3 py-1 rounded-full ${
            error ? '' : 'hidden'
          }`}
        >
          {error ?? 'Invalid Base32 String'}
        </span>
      </div>

      <div className="relative group">
        <textarea
          id="secretKey"
          ref={textareaRef}
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. GAXG 243E MR2X QZ..."
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-black/60 border border-brand-border rounded-xl p-5 pr-12 text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-neon/50 focus:border-brand-neon outline-none transition-all resize-none font-mono text-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-slate-600"
        />

        <button
          id="clearBtn"
          type="button"
          onClick={() => {
            onClear();
            textareaRef.current?.focus();
          }}
          aria-label="Clear secret key"
          title="Clear Secret Key"
          className={`absolute top-4 right-4 text-slate-500 hover:text-brand-neon transition-colors ${
            value.length > 0 ? '' : 'hidden'
          }`}
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <button
          type="button"
          onClick={onPaste}
          className="flex items-center justify-center gap-2 bg-brand-border/40 hover:bg-brand-border/80 border border-brand-border text-white py-3 px-4 rounded-xl transition-all font-medium"
        >
          <ClipboardIcon className="w-5 h-5 text-slate-300" />
          Paste Key
        </button>

        <div className="relative flex">
          <input
            ref={fileInputRef}
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              // Allow re-selecting the same file.
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={onScan}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-border/40 hover:bg-brand-border/80 border border-brand-border text-white py-3 px-4 rounded-l-xl transition-all font-medium border-r-0"
          >
            <CameraIcon className="w-5 h-5 text-brand-neon" />
            Scan QR
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload QR image"
            title="Upload QR Image"
            className="flex items-center justify-center bg-brand-border/40 hover:bg-brand-border/80 border border-brand-border text-white py-3 px-4 rounded-r-xl transition-all font-medium"
          >
            <UploadIcon className="w-5 h-5 text-brand-accent" />
          </button>
        </div>
      </div>
    </div>
  );
}
