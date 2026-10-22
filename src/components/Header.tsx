import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../lib/auth';
import { FingerprintIcon, LoginIcon, ShieldIcon, UserIcon, UserPlusIcon } from './Icons';

/**
 * The sticky site header.
 *
 * @param props Component props.
 * @returns The header element.
 */
export function Header({ onOpenPrivacy }: { onOpenPrivacy: () => void }) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b-0 border-brand-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="2FA Live Code — home">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-neon to-brand-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-shadow">
            <FingerprintIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">2FA Live Code</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <button type="button" onClick={onOpenPrivacy} className="hover:text-white transition-colors">
              Privacy
            </button>
          </nav>

          <AuthDropdown />
        </div>
      </div>
    </header>
  );
}

/**
 * The account dropdown in the header.
 *
 * When nobody is signed in it offers the login and registration links. When an
 * account is signed in it shows the address, a link to the administration
 * panel (for administrators) and the log-out action.
 *
 * @returns The dropdown element.
 */
function AuthDropdown() {
  const { user, profile, signOut, configured } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const admin = isAdmin(profile);

  return (
    <div className="relative" id="auth-dropdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `Account menu for ${user.email ?? 'user'}` : 'Account menu'}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-border hover:border-slate-400 transition-colors focus:outline-none cursor-pointer bg-brand-dark/30"
      >
        {admin ? (
          <ShieldIcon className="w-6 h-6 text-brand-accent" />
        ) : (
          <UserIcon className="w-6 h-6 text-white" />
        )}
      </button>

      <div
        id="auth-dropdown-menu"
        role="menu"
        className={`absolute right-0 mt-2 w-56 bg-brand-card border border-brand-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-200 z-50 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {user ? (
          <div className="p-2 flex flex-col gap-1">
            <div className="px-4 py-2 border-b border-brand-border/60 mb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Signed in</p>
              <p className="text-sm text-white font-mono break-all">{user.email ?? 'unknown'}</p>
              {profile && (
                <p className="text-xs text-brand-neon mt-1">
                  {profile.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              )}
            </div>

            {admin && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-brand-dark hover:text-brand-neon rounded-lg transition-colors"
              >
                <ShieldIcon className="w-4 h-4" />
                Admin panel
              </Link>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-brand-dark hover:text-brand-neon rounded-lg transition-colors text-left"
            >
              <LoginIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1">
            <Link
              to="/login-page"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-brand-dark hover:text-brand-neon rounded-lg transition-colors"
            >
              <LoginIcon className="w-4 h-4" />
              Login
            </Link>
            <Link
              to="/register"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-brand-dark hover:text-brand-neon rounded-lg transition-colors"
            >
              <UserPlusIcon className="w-4 h-4" />
              Register
            </Link>
            {!configured && (
              <p className="px-4 py-2 text-xs text-slate-500 border-t border-brand-border/60 mt-1">
                Accounts are disabled — Firebase is not configured.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
