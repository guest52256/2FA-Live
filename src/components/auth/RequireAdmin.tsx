import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin } from '../../lib/auth';

interface RequireAdminProps {
  /** The protected content. */
  children: ReactNode;
}

/**
 * Gate a route behind "signed in as an administrator".
 *
 * @param props Component props.
 * @returns The protected content, a redirect or an explanatory panel.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { ready, configured, user, profile } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-mono animate-pulse">Checking credentials…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-page" state={{ from: location.pathname }} replace />;
  }

  if (!configured) {
    return (
      <AuthLayout title="Admin panel" subtitle="This area requires a Firebase configuration.">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-semibold mb-1">Firebase is not configured</p>
          <p className="text-amber-200/80">
            Add the <code className="font-mono">VITE_FIREBASE_*</code> variables to your environment and
            rebuild to enable the administration panel.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (!isAdmin(profile)) {
    return (
      <AuthLayout title="Admin panel" subtitle="This area is restricted to administrators.">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold mb-1">403 — administrator rights required</p>
          <p className="text-red-200/80">
            You are signed in as <span className="font-mono">{user.email ?? 'unknown'}</span>, but this
            account does not hold the <span className="font-mono">admin</span> role. Ask an existing
            administrator to promote you.
          </p>
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center w-full px-6 py-3.5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-neon to-brand-accent rounded-xl hover:-translate-y-1 active:translate-y-0"
        >
          Back to the generator
        </Link>
      </AuthLayout>
    );
  }

  return <>{children}</>;
}
