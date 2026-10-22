import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';

import { describeAuthError, type UserProfile } from '../lib/auth';
import {
  getConfiguredAdminEmails,
  getFirebaseAuth,
  getFirestoreDb,
  isFirebaseConfigured,
} from '../lib/firebase';
import { syncProfile } from '../lib/userDirectory';

interface AuthContextValue {
  /** True once the initial authentication state has been resolved. */
  ready: boolean;
  /** True when a Firebase configuration is present. */
  configured: boolean;
  /** The signed-in Firebase user, or null. */
  user: User | null;
  /** The Firestore profile of the signed-in user, or null. */
  profile: UserProfile | null;
  /** The last error message, or null. */
  error: string | null;
  /** Clear the current error message. */
  clearError: () => void;
  /** Sign in with an e-mail address and a password. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Register a new account. */
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  /** Sign out of the current account. */
  signOut: () => Promise<void>;
  /** Re-read the profile of the signed-in user. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provide the authentication state to the whole application.
 *
 * The Firebase SDK is loaded lazily: without a configuration nothing is
 * downloaded at all, and with a configuration the chunks are fetched right
 * after the first paint of the account features.
 *
 * @param props Component props.
 * @returns The provider element.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(!configured);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to the Firebase auth state and keep the Firestore profile in sync.
  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const auth = await getFirebaseAuth();
        const db = await getFirestoreDb();
        if (cancelled) return;
        if (!auth || !db) {
          setReady(true);
          return;
        }

        const { onAuthStateChanged } = await import('firebase/auth');
        if (cancelled) return;

        unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
          if (cancelled) return;
          setUser(nextUser);

          if (!nextUser) {
            setProfile(null);
            setReady(true);
            return;
          }

          try {
            const nextProfile = await syncProfile(db, nextUser, getConfiguredAdminEmails());
            if (!cancelled) setProfile(nextProfile);
          } catch (cause) {
            if (!cancelled) setError(describeAuthError(cause));
          } finally {
            if (!cancelled) setReady(true);
          }
        });
      } catch (cause) {
        if (!cancelled) {
          setError(describeAuthError(cause));
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const auth = await getFirebaseAuth();
    if (!auth) {
      const message = 'Firebase is not configured for this deployment.';
      setError(message);
      throw new Error(message);
    }

    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (cause) {
      const message = describeAuthError(cause);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    setError(null);
    const auth = await getFirebaseAuth();
    if (!auth) {
      const message = 'Firebase is not configured for this deployment.';
      setError(message);
      throw new Error(message);
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const name = displayName.trim();
      if (name) {
        await updateProfile(credential.user, { displayName: name });
        await credential.user.reload();
      }
    } catch (cause) {
      const message = describeAuthError(cause);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const auth = await getFirebaseAuth();
    if (!auth) return;
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      setProfile(null);
    } catch (cause) {
      setError(describeAuthError(cause));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const db = await getFirestoreDb();
    if (!db || !user) return;
    try {
      setProfile(await syncProfile(db, user, getConfiguredAdminEmails()));
    } catch (cause) {
      setError(describeAuthError(cause));
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      user,
      profile,
      error,
      clearError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [ready, configured, user, profile, error, clearError, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Read the authentication state.
 *
 * @returns The authentication context.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used inside an <AuthProvider>.');
  }
  return context;
}
