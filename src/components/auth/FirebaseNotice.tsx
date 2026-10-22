/**
 * A banner that explains that the account layer is disabled because no
 * Firebase configuration was provided at build time.
 *
 * @returns The notice element.
 */
export function FirebaseNotice() {
  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200"
    >
      <p className="font-semibold mb-1">Accounts are currently disabled</p>
      <p className="text-amber-200/80">
        This deployment has no Firebase configuration, so signing in and signing up are unavailable.
        The token generator keeps working as usual. Add the{' '}
        <code className="font-mono">VITE_FIREBASE_*</code> variables (see{' '}
        <code className="font-mono">.env.example</code>) and rebuild to enable them.
      </p>
    </div>
  );
}
