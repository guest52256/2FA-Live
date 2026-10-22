/**
 * Secret-key normalisation and validation.
 *
 * Mirrors the source project's rules exactly:
 *   - whitespace is stripped and the remainder is upper-cased
 *   - an empty value is "neutral" (no error, no active secret)
 *   - the charset must match /^[A-Z2-7]+=*$/ (Base32)
 *   - the key must be at least 8 characters long
 */

export const BASE32_REGEX = /^[A-Z2-7]+=*$/;
export const MIN_SECRET_LENGTH = 8;

export type SecretError = 'too-short' | 'invalid-characters';

export interface SecretValidation {
  /** True when the secret can be used to generate a code. */
  valid: boolean;
  /** Machine-readable failure reason, or null when valid/neutral. */
  error: SecretError | null;
  /** Human-readable failure message, or null when valid/neutral. */
  message: string | null;
}

/**
 * Strip whitespace and upper-case a raw user input.
 *
 * @param raw Raw textarea / clipboard value.
 * @returns The normalised secret.
 */
export function normalizeSecret(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

/**
 * Validate a normalised secret.
 *
 * @param secret Already normalised secret.
 * @returns The validation outcome.
 */
export function validateSecret(secret: string): SecretValidation {
  if (secret.length === 0) {
    return { valid: false, error: null, message: null };
  }

  if (BASE32_REGEX.test(secret) && secret.length >= MIN_SECRET_LENGTH) {
    return { valid: true, error: null, message: null };
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    return { valid: false, error: 'too-short', message: 'Key too short' };
  }

  return { valid: false, error: 'invalid-characters', message: 'Invalid Characters' };
}
