/**
 * Firebase bootstrap.
 *
 * The TOTP tool itself is 100% client-side and never needs a backend. The
 * optional account layer (sign-up / login / admin panel) is backed by
 * Firebase Authentication + Cloud Firestore.
 *
 * Everything in this module is *lazy* and *optional*:
 *
 *   - without a Firebase configuration the app still boots and the tool keeps
 *     working — the account pages simply report that Firebase is missing;
 *   - the Firebase SDK is imported dynamically, so its ~600 kB never end up in
 *     the initial bundle of the token generator. The chunks are only fetched
 *     when an account feature is actually used.
 */

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Whether a usable Firebase configuration is present.
 *
 * @returns True when the app can talk to Firebase.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let appPromise: Promise<FirebaseApp> | null = null;

/**
 * Get (and lazily create) the Firebase app instance.
 *
 * @returns The Firebase app, or null when Firebase is not configured.
 */
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!isFirebaseConfigured()) return null;

  if (!appPromise) {
    appPromise = import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
      getApps().length > 0 ? getApp() : initializeApp(config as Record<string, string>),
    );
  }

  return appPromise;
}

let authPromise: Promise<Auth> | null = null;

/**
 * Get (and lazily create) the Firebase Authentication instance.
 *
 * @returns The Auth instance, or null when Firebase is not configured.
 */
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (!isFirebaseConfigured()) return null;

  if (!authPromise) {
    authPromise = (async () => {
      const app = await getFirebaseApp();
      if (!app) throw new Error('Firebase is not configured.');
      const { getAuth } = await import('firebase/auth');
      return getAuth(app);
    })();
  }

  return authPromise;
}

let dbPromise: Promise<Firestore> | null = null;

/**
 * Get (and lazily create) the Cloud Firestore instance.
 *
 * @returns The Firestore instance, or null when Firebase is not configured.
 */
export async function getFirestoreDb(): Promise<Firestore | null> {
  if (!isFirebaseConfigured()) return null;

  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await getFirebaseApp();
      if (!app) throw new Error('Firebase is not configured.');
      const { getFirestore } = await import('firebase/firestore');
      return getFirestore(app);
    })();
  }

  return dbPromise;
}

/**
 * E-mail addresses that are always treated as administrators.
 *
 * @returns A lower-cased set of admin e-mail addresses.
 */
export function getConfiguredAdminEmails(): Set<string> {
  const raw = import.meta.env.VITE_FIREBASE_ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0),
  );
}
