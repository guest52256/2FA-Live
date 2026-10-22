/**
 * TOTP / HOTP engine (RFC 4226 + RFC 6238).
 *
 * Pure client-side: the secret never leaves the browser. All hashing is done
 * with the Web Crypto API (`crypto.subtle`), which is available in every
 * modern browser and in Node >= 18 under the global `crypto` object.
 *
 * The algorithm implemented here is byte-compatible with the source project:
 *   HMAC-SHA1 over an 8-byte big-endian counter, dynamic truncation, modulo
 * 10^digits, zero padded. It reproduces all six RFC 6238 SHA-1 test vectors.
 */

import { decodeBase32 } from './base32';

export const DEFAULT_PERIOD = 30;
export const DEFAULT_DIGITS = 6;
export const DEFAULT_ALGORITHM = 'SHA-1';

export type TotpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface TotpOptions {
  /** Number of digits in the generated code. Default 6. */
  digits?: number;
  /** Time step in seconds. Default 30. */
  period?: number;
  /** HMAC hash. Default SHA-1 (the de-facto standard for authenticator apps). */
  algorithm?: TotpAlgorithm;
}

/**
 * Generate an HMAC-based one-time password (HOTP) for a given counter.
 *
 * @param secret Base32-encoded shared secret.
 * @param counter Moving factor (the number of elapsed time steps).
 * @param options Digit count / algorithm overrides.
 * @returns The zero-padded one-time password.
 */
export async function generateHOTP(
  secret: string,
  counter: number,
  options: TotpOptions = {},
): Promise<string> {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;

  const keyData = decodeBase32(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData as unknown as BufferSource,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  );

  // 8-byte big-endian counter (RFC 4226 §5.1).
  const counterBuffer = new ArrayBuffer(8);
  const view = new DataView(counterBuffer);
  view.setUint32(0, Math.floor(counter / 0x1_0000_0000), false);
  view.setUint32(4, counter >>> 0, false);

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226 §5.3).
  const offset = (hmac[hmac.length - 1] as number) & 0x0f;
  const binary =
    (((hmac[offset] as number) & 0x7f) << 24) |
    (((hmac[offset + 1] as number) & 0xff) << 16) |
    (((hmac[offset + 2] as number) & 0xff) << 8) |
    ((hmac[offset + 3] as number) & 0xff);

  const modulus = 10 ** digits;
  return String(binary % modulus).padStart(digits, '0');
}

/**
 * Compute the TOTP moving factor for a point in time.
 *
 * @param timestampMs Unix timestamp in milliseconds.
 * @param period Time step in seconds.
 * @returns The counter value used as the HMAC moving factor.
 */
export function getCounter(timestampMs: number, period: number = DEFAULT_PERIOD): number {
  return Math.floor(timestampMs / 1000 / period);
}

/**
 * Seconds remaining until the current TOTP code expires.
 *
 * Returns `period` (not 0) on the exact boundary, matching the source tool's
 * "30s" reading at the start of every window.
 *
 * @param timestampMs Unix timestamp in milliseconds.
 * @param period Time step in seconds.
 * @returns Seconds left in the current window, 1..period.
 */
export function getRemainingSeconds(
  timestampMs: number,
  period: number = DEFAULT_PERIOD,
): number {
  const epoch = Math.floor(timestampMs / 1000);
  return period - (epoch % period);
}

/**
 * Generate the TOTP code valid at a given moment.
 *
 * @param secret Base32-encoded shared secret.
 * @param timestampMs Unix timestamp in milliseconds. Defaults to now.
 * @param options Digit count / period / algorithm overrides.
 * @returns The zero-padded TOTP code.
 */
export async function generateTOTP(
  secret: string,
  timestampMs: number = Date.now(),
  options: TotpOptions = {},
): Promise<string> {
  const period = options.period ?? DEFAULT_PERIOD;
  return generateHOTP(secret, getCounter(timestampMs, period), options);
}

/**
 * Format a raw code for display: `123456` becomes `123 456`.
 *
 * @param code Raw one-time password.
 * @returns The display representation.
 */
export function formatToken(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/**
 * Strip formatting whitespace from a displayed code.
 *
 * @param code Displayed or raw one-time password.
 * @returns The raw digits.
 */
export function stripToken(code: string): string {
  return code.replace(/\s/g, '');
}
