import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { FingerprintIcon } from '../Icons';

interface AuthLayoutProps {
  /** The page heading. */
  title: string;
  /** A short explanation below the heading. */
  subtitle: string;
  /** The form itself. */
  children: ReactNode;
  /** Links rendered below the card. */
  footer?: ReactNode;
}

/**
 * Shared shell for the sign-in / sign-up pages.
 *
 * @param props Component props.
 * @returns The layout element.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md glass-card rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-8 slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-neon to-brand-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-4">
            <FingerprintIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
        </div>

        {children}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500 text-center">
        {footer}
        <Link to="/" className="hover:text-brand-neon transition-colors">
          ← Back to the generator
        </Link>
      </div>
    </div>
  );
}
