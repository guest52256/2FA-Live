import { useEffect, useRef, useState, type ReactNode } from 'react';

import { XIcon } from './Icons';

interface ModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close (backdrop, close button, Escape). */
  onClose: () => void;
  /** Modal heading. */
  title: string;
  /** Modal body content. */
  children: ReactNode;
  /** Label of the dismiss button. */
  footerLabel?: string;
  /** Optional id for the heading (used to wire aria-labelledby). */
  id?: string;
}

const TRANSITION_MS = 300;

/**
 * A glassmorphic modal dialog.
 *
 * Mirrors the source project's modal: dark backdrop with blur, scaled-in
 * content panel, a title bar, a scrollable body and an "Acknowledge" footer
 * button. Adds focus management and ARIA wiring for keyboard users.
 *
 * @param props Component props.
 * @returns The modal element (or null when closed).
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footerLabel = 'Acknowledge',
  id,
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const headingId = `${id ?? title.toLowerCase().replace(/\s+/g, '-')}-title`;

  // Mount / animate in.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setMounted(true);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Animate out, then unmount.
  useEffect(() => {
    if (open) return;
    setShown(false);
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // Escape closes the dialog; Tab is trapped inside it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = contentRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  // Move focus into the dialog when it opens, and back to the trigger on close.
  useEffect(() => {
    if (!open) {
      restoreFocusRef.current?.focus?.();
      return;
    }

    const target =
      contentRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea',
      ) ?? contentRef.current;
    target?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shown]);

  // Prevent the page behind the dialog from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md transition-opacity duration-300 modal-overlay ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={`relative w-full max-w-2xl mx-4 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 modal-content flex flex-col max-h-[85vh] ${
          shown ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h2 id={headingId} className="text-2xl font-bold text-white modal-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-slate-300 space-y-4 text-sm leading-relaxed modal-body">
          {children}
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-dark/50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-brand-border hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            {footerLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
