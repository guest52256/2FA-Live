import { CheckIcon, XIcon } from './Icons';
import { useToast } from '../hooks/useToast';

/**
 * The global toast notification.
 *
 * Positioned top-centre, above the sticky header, mirroring the source
 * project. Only one toast is visible at a time.
 *
 * @returns The toast element.
 */
export function ToastHost() {
  const { toasts, dismissToast } = useToast();
  const toast = toasts[0];

  if (!toast) {
    return (
      <div
        id="toast-notification"
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-none z-[70] opacity-0 -translate-y-[20px] backdrop-blur-md w-[90vw] sm:w-auto max-w-md"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" />
        <p className="font-medium text-white text-sm sm:text-base" />
      </div>
    );
  }

  const isSuccess = toast.type === 'success';

  return (
    <div
      id="toast-notification"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onClick={() => dismissToast(toast.id)}
      className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 z-[70] backdrop-blur-md w-[90vw] sm:w-auto max-w-md cursor-pointer ${
        isSuccess
          ? 'bg-green-500/20 border border-green-500/50 opacity-100 translate-y-0'
          : 'bg-red-500/20 border border-red-500/50 opacity-100 translate-y-0'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}
      >
        {isSuccess ? <CheckIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
      </div>
      <p id="toast-text" className="font-medium text-white text-sm sm:text-base">
        {toast.message}
      </p>
    </div>
  );
}
