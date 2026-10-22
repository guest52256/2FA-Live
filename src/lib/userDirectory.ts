/**
 * Firestore access layer for the account directory.
 *
 * The TOTP tool never touches any of this — it is only used by the optional
 * sign-up / login / admin-panel features.
 *
 * The Firestore SDK is imported dynamically so that it stays out of the
 * initial bundle of the token generator.
 */

import type { Firestore } from 'firebase/firestore';

import {
  META_COLLECTION,
  META_DOCUMENT,
  USERS_COLLECTION,
  type UserProfile,
  type UserRole,
} from './auth';

/** Collection that stores the administrator audit trail. */
export const ADMIN_LOG_COLLECTION = 'adminLogs';

/** Maximum number of user profiles loaded by the admin panel. */
export const MAX_DIRECTORY_ENTRIES = 200;

/**
 * Read a user profile.
 *
 * @param db The Firestore instance.
 * @param uid The Firebase user id.
 * @returns The profile, or null when the document does not exist.
 */
export async function fetchProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as UserProfile), uid };
}

/**
 * Create the profile of a freshly registered account — or refresh the last
 * sign-in time of an existing one.
 *
 * The very first account created in a project is promoted to administrator so
 * that a new deployment is manageable out of the box. Accounts whose e-mail
 * address is listed in `VITE_FIREBASE_ADMIN_EMAILS` are always administrators.
 *
 * @param db The Firestore instance.
 * @param user The authenticated Firebase user.
 * @param adminEmails E-mail addresses that must always hold the admin role.
 * @returns The stored profile.
 */
export async function syncProfile(
  db: Firestore,
  user: { uid: string; email: string | null; displayName: string | null },
  adminEmails: Set<string>,
): Promise<UserProfile> {
  const { doc, getDoc, runTransaction, updateDoc } = await import('firebase/firestore');

  const reference = doc(db, USERS_COLLECTION, user.uid);
  const email = (user.email ?? '').toLowerCase();
  const displayName = user.displayName ?? '';
  const now = Date.now();

  const existing = await getDoc(reference);

  if (existing.exists()) {
    const data = existing.data() as Partial<UserProfile>;
    const role: UserRole = adminEmails.has(email) ? 'admin' : (data.role ?? 'user');
    const merged: UserProfile = {
      uid: user.uid,
      email: data.email ?? email,
      displayName: data.displayName ?? displayName,
      role,
      createdAt: data.createdAt ?? now,
      lastLoginAt: now,
      provider: data.provider ?? 'password',
    };
    await updateDoc(reference, {
      lastLoginAt: merged.lastLoginAt,
      displayName: merged.displayName,
      role: merged.role,
    });
    return merged;
  }

  const metaReference = doc(db, META_COLLECTION, META_DOCUMENT);

  let role: UserRole = 'user';
  const createdAt = now;

  await runTransaction(db, async (transaction) => {
    const metaSnapshot = await transaction.get(metaReference);
    const meta = metaSnapshot.exists()
      ? (metaSnapshot.data() as { firstAdminUid?: string })
      : {};

    const isFirstAccount = !meta.firstAdminUid;
    role = adminEmails.has(email) || isFirstAccount ? 'admin' : 'user';

    transaction.set(reference, {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: now,
      lastLoginAt: now,
      provider: 'password',
    });

    if (isFirstAccount) {
      transaction.set(
        metaReference,
        { firstAdminUid: user.uid, firstAdminClaimedAt: now },
        { merge: true },
      );
    }
  });

  return {
    uid: user.uid,
    email,
    displayName,
    role,
    createdAt,
    lastLoginAt: now,
    provider: 'password',
  };
}

/**
 * List every known account, newest first.
 *
 * @param db The Firestore instance.
 * @returns The directory entries.
 */
export async function listProfiles(db: Firestore): Promise<UserProfile[]> {
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
  const snapshot = await getDocs(
    query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.slice(0, MAX_DIRECTORY_ENTRIES).map((entry) => {
    const data = entry.data() as UserProfile;
    return { ...data, uid: data.uid ?? entry.id };
  });
}

/**
 * Change the role of an account.
 *
 * @param db The Firestore instance.
 * @param uid The user id.
 * @param role The new role.
 */
export async function setProfileRole(db: Firestore, uid: string, role: UserRole): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, USERS_COLLECTION, uid), { role });
}

/**
 * Remove an account from the directory.
 *
 * Note: this does **not** delete the Firebase Authentication record — that
 * requires a trusted backend (the Firebase console or a Cloud Function).
 *
 * @param db The Firestore instance.
 * @param uid The user id.
 */
export async function deleteProfile(db: Firestore, uid: string): Promise<void> {
  const { deleteDoc, doc } = await import('firebase/firestore');
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
}

/**
 * Append an entry to the administrator audit trail.
 *
 * @param db The Firestore instance.
 * @param entry The log entry.
 */
export async function logAdminAction(
  db: Firestore,
  entry: { actorUid: string; actorEmail: string; action: string; targetUid?: string; detail?: string },
): Promise<void> {
  const { addDoc, collection } = await import('firebase/firestore');
  await addDoc(collection(db, ADMIN_LOG_COLLECTION), {
    ...entry,
    at: Date.now(),
  });
}

/** A single audit-trail entry. */
export interface AdminLogEntry {
  /** The administrator that performed the action. */
  actorEmail: string;
  /** What happened. */
  action: string;
  /** The affected account, if any. */
  targetUid?: string;
  /** Free-form details. */
  detail?: string;
  /** Epoch milliseconds. */
  at: number;
}

/**
 * Read the most recent administrator actions.
 *
 * @param db The Firestore instance.
 * @returns The audit entries, newest first.
 */
export async function listAdminLogs(db: Firestore): Promise<AdminLogEntry[]> {
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
  const snapshot = await getDocs(
    query(collection(db, ADMIN_LOG_COLLECTION), orderBy('at', 'desc')),
  );
  return snapshot.docs.slice(0, 25).map((entry) => entry.data() as AdminLogEntry);
}
