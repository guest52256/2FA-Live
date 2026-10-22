import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { RequireAdmin } from '../components/auth/RequireAdmin';
import { useAuth } from '../hooks/useAuth';
import { describeRole, formatTimestamp, type UserProfile } from '../lib/auth';
import { getFirestoreDb } from '../lib/firebase';
import {
  deleteProfile,
  listAdminLogs,
  listProfiles,
  logAdminAction,
  setProfileRole,
  type AdminLogEntry,
} from '../lib/userDirectory';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The administration panel (`/admin`).
 *
 * @returns The page element.
 */
export function AdminPage() {
  return (
    <RequireAdmin>
      <AdminConsole />
    </RequireAdmin>
  );
}

/**
 * The actual administration console.
 *
 * It is only mounted once `RequireAdmin` has confirmed that the visitor is a
 * signed-in administrator, so no Firestore read happens for anonymous users.
 *
 * @returns The console element.
 */
function AdminConsole() {
  const { user, profile, signOut } = useAuth();

  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const db = await getFirestoreDb();
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextAccounts, nextLogs] = await Promise.all([listProfiles(db), listAdminLogs(db)]);
      setAccounts(nextAccounts);
      setLogs(nextLogs);
      setError(null);
    } catch {
      setError('Could not read the account directory. Check your Firestore rules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = useCallback(
    async (target: UserProfile, action: 'promote' | 'demote' | 'remove') => {
      const db = await getFirestoreDb();
      if (!db || !user) return;

      setBusyUid(target.uid);
      setError(null);
      setNotice(null);

      try {
        if (action === 'remove') {
          await deleteProfile(db, target.uid);
          await logAdminAction(db, {
            actorUid: user.uid,
            actorEmail: user.email ?? '',
            action: 'remove-account',
            targetUid: target.uid,
            detail: target.email,
          });
          setNotice(`Removed ${target.email} from the directory.`);
        } else {
          const role = action === 'promote' ? 'admin' : 'user';
          await setProfileRole(db, target.uid, role);
          await logAdminAction(db, {
            actorUid: user.uid,
            actorEmail: user.email ?? '',
            action: action === 'promote' ? 'grant-admin' : 'revoke-admin',
            targetUid: target.uid,
            detail: target.email,
          });
          setNotice(`${target.email} is now ${describeRole(role).toLowerCase()}.`);
        }
        await load();
      } catch {
        setError('The action failed. Check your Firestore rules and try again.');
      } finally {
        setBusyUid(null);
      }
    },
    [load, user],
  );

  const admins = accounts.filter((account) => account.role === 'admin').length;
  const newThisWeek = accounts.filter(
    (account) => Date.now() - (account.createdAt ?? 0) < ONE_WEEK_MS,
  ).length;

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <header className="sticky top-0 z-50 glass-card border-b-0 border-brand-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl sm:text-2xl text-white tracking-tight">Admin Panel</h1>
            <p className="text-xs text-slate-400 font-mono">
              signed in as {user?.email ?? 'unknown'}
              {profile ? ` · ${describeRole(profile.role)}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-slate-300 hover:text-brand-neon transition-colors hidden sm:inline"
            >
              Generator
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-border/40 hover:bg-brand-border/80 border border-brand-border rounded-xl transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total accounts', value: accounts.length },
            { label: 'Administrators', value: admins },
            { label: 'New this week', value: newThisWeek },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl border border-brand-border p-6 text-center"
            >
              <p className="text-4xl font-bold text-brand-neon font-mono">{stat.value}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-6 rounded-xl border border-brand-neon/40 bg-brand-neon/10 px-4 py-3 text-sm text-brand-neon">
            {notice}
          </p>
        )}

        {/* Accounts */}
        <section className="glass-card rounded-2xl border border-brand-border overflow-hidden mb-8">
          <div className="flex items-center justify-between p-5 border-b border-brand-border">
            <h2 className="text-white font-bold">Accounts</h2>
            <button
              type="button"
              onClick={() => void load()}
              className="text-xs text-brand-neon/80 hover:text-brand-neon transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-400 font-mono animate-pulse">Loading accounts…</p>
          ) : accounts.length === 0 ? (
            <p className="p-8 text-center text-slate-400">
              No accounts yet. They appear here as soon as somebody registers.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr className="border-b border-brand-border">
                    <th scope="col" className="px-5 py-3 font-semibold">E-mail</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Created</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Last sign-in</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.uid} className="border-b border-brand-border/40 last:border-0">
                      <td className="px-5 py-4 font-mono text-brand-neon break-all">{account.email}</td>
                      <td className="px-5 py-4 text-slate-300">{account.displayName || '—'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            account.role === 'admin'
                              ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40'
                              : 'bg-brand-border/40 text-slate-300 border border-brand-border'
                          }`}
                        >
                          {describeRole(account.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{formatTimestamp(account.createdAt)}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{formatTimestamp(account.lastLoginAt)}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {account.uid === user?.uid ? (
                          <span className="text-xs text-slate-500">This is you</span>
                        ) : (
                          <>
                            {account.role === 'admin' ? (
                              <button
                                type="button"
                                disabled={busyUid === account.uid}
                                onClick={() => void runAction(account, 'demote')}
                                className="text-xs text-slate-300 hover:text-brand-neon transition-colors mr-3 disabled:opacity-50"
                              >
                                Make user
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyUid === account.uid}
                                onClick={() => void runAction(account, 'promote')}
                                className="text-xs text-brand-neon hover:text-white transition-colors mr-3 disabled:opacity-50"
                              >
                                Make admin
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busyUid === account.uid}
                              onClick={() => void runAction(account, 'remove')}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Audit trail */}
        <section className="glass-card rounded-2xl border border-brand-border overflow-hidden">
          <div className="p-5 border-b border-brand-border">
            <h2 className="text-white font-bold">Recent administrator activity</h2>
          </div>
          {logs.length === 0 ? (
            <p className="p-8 text-center text-slate-400">No administrator actions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-brand-border/40">
              {logs.map((log, index) => (
                <li key={`${log.at}-${index}`} className="px-5 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-brand-neon">{formatTimestamp(log.at)}</span>
                  <span className="text-slate-300">
                    <span className="text-white font-semibold">{log.actorEmail}</span> — {log.action}
                    {log.detail ? ` (${log.detail})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-slate-500 mt-6 leading-relaxed">
          Removing an account deletes its profile document from Firestore. The matching Firebase
          Authentication record has to be deleted from the Firebase console (or through a trusted
          backend), because a browser client is never allowed to delete authentication records.
        </p>
      </main>
    </div>
  );
}
