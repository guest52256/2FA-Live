import { useId, type InputHTMLAttributes } from 'react';

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Visible label. */
  label: string;
  /** Optional helper text rendered below the field. */
  hint?: string;
  /** Validation message; renders the field in the error state. */
  error?: string;
}

/**
 * A labelled text input for the account forms.
 *
 * @param props Component props.
 * @returns The field element.
 */
export function AuthField({ label, hint, error, ...inputProps }: AuthFieldProps) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-brand-neon uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`w-full bg-black/60 border rounded-xl p-3.5 text-white placeholder-slate-600 focus:ring-2 focus:outline-none transition-all ${
          error
            ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/30'
            : 'border-brand-border focus:border-brand-neon focus:ring-brand-neon/50'
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500 mt-1.5">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
