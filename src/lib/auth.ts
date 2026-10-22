/**
 * Account helpers that do not depend on Firebase.
 *
 * Keeping the validation and role logic in a Firebase-free module means it can
 * be unit-tested in isolation and reused by the UI.
 */

/** The role of an account. */
export type UserRole = 'admin' | 'user';

/** The profile document stored in Firestore under `users/{uid}`. */
export interface UserProfile {
  /** The Firebase user id. */
  uid: string;
  /** The e-mail address of the account. */
  email: string;
  /** A display name (may be empty). */
  displayName: string;
  /** The role of the account. */
  role: UserRole;
  /** Epoch milliseconds when the account was created. */
  createdAt: number;
  /** Epoch milliseconds of the last successful sign-in. */
  lastLoginAt: number;
  /** The sign-in provider (`password`, `google.com`, …). */
  provider: string;
}

/** Minimum accepted password length. */
export const MIN_PASSWORD_LENGTH = 6;

/** Firestore collection that stores the user profiles. */
export const USERS_COLLECTION = 'users';

/** Firestore document that tracks global application metadata. */
export const META_COLLECTION = 'meta';

/** Firestore document id used for the application metadata. */
export const META_DOCUMENT = 'app';

/**
 * Validate an e-mail address.
 *
 * @param email The raw e-mail address.
 * @returns An error message, or null when the address looks valid.
 */
export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (value.length === 0) return 'E-mail address is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid e-mail address';
  return null;
}

/**
 * Validate a password.
 *
 * @param password The raw password.
 * @returns An error message, or null when the password is acceptable.
 */
export function validatePassword(password: string): string | null {
  if (password.length === 0) return 'Password is required';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

/**
 * Validate the sign-up form.
 *
 * @param values The submitted values.
 * @returns A map of field name to error message. Empty when the form is valid.
 */
export function validateSignUpForm(values: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (values.displayName.trim().length > 40) {
    errors.displayName = 'Display name must be 40 characters or fewer';
  }

  return errors;
}

/**
 * Whether a profile has administrator rights.
 *
 * @param profile The profile to check (may be null).
 * @returns True when the profile is an administrator.
 */
export function isAdmin(profile: UserProfile | null): boolean {
  return profile?.role === 'admin';
}

/**
 * Format a Firestore timestamp for display.
 *
 * @param timestamp Epoch milliseconds.
 * @returns A locale date-time string, or an em dash when the value is missing.
 */
export function formatTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Human readable label for a role.
 *
 * @param role The role.
 * @returns The label.
 */
export function describeRole(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'User';
}

/**
 * Turn a Firebase authentication error into a human readable message.
 *
 * The Firebase error codes are plain strings, so this helper stays free of any
 * Firebase import and can be unit-tested on its own.
 *
 * @param error The thrown error.
 * @returns A message that can be shown to the user.
 */
export function describeAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect e-mail address or password.';
    case 'auth/email-already-in-use':
      return 'An account with that e-mail address already exists.';
    case 'auth/weak-password':
      return 'That password is too weak — please choose a longer one.';
    case 'auth/invalid-email':
      return 'Enter a valid e-mail address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a moment.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to confirm this action.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled in the Firebase console.';
    default:
      break;
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
