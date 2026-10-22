/**
 * `otpauth://` URI parsing.
 *
 * The source project extracts the `secret` parameter from an `otpauth://` URI
 * and ignores every other parameter. This reproduction keeps that default
 * behaviour but additionally honours the optional `digits`, `period` and
 * `algorithm` parameters when they are present, because real-world QR codes
 * (e.g. from Bitwarden, AWS or GitHub Enterprise) use them. See README ->
 * "Intentional deviations".
 */

import { DEFAULT_ALGORITHM, DEFAULT_DIGITS, DEFAULT_PERIOD, type TotpAlgorithm } from './totp';

export interface OtpAuthPayload {
  /** The Base32 shared secret, or an empty string when absent. */
  secret: string;
  /** Account label (the part after the type), when present. */
  label: string;
  /** Issuer (the `issuer` parameter), when present. */
  issuer: string;
  /** Number of digits to generate. */
  digits: number;
  /** Time step in seconds. */
  period: number;
  /** HMAC algorithm. */
  algorithm: TotpAlgorithm;
  /** True when the input was an `otpauth://` URI. */
  isUri: boolean;
}

const ALGORITHMS: Record<string, TotpAlgorithm> = {
  SHA1: 'SHA-1',
  'SHA-1': 'SHA-1',
  SHA256: 'SHA-256',
  'SHA-256': 'SHA-256',
  SHA512: 'SHA-512',
  'SHA-512': 'SHA-512',
};

/**
 * Parse an `otpauth://` URI (or a bare secret) into its components.
 *
 * @param input Raw text — an `otpauth://` URI or a plain Base32 secret.
 * @returns The parsed payload.
 */
export function parseOtpAuth(input: string): OtpAuthPayload {
  const trimmed = input.trim();
  const fallback: OtpAuthPayload = {
    secret: trimmed,
    label: '',
    issuer: '',
    digits: DEFAULT_DIGITS,
    period: DEFAULT_PERIOD,
    algorithm: DEFAULT_ALGORITHM,
    isUri: false,
  };

  if (!trimmed.toLowerCase().startsWith('otpauth://')) {
    return fallback;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return fallback;
  }

  const params = url.searchParams;
  const secret = params.get('secret') ?? '';
  const issuer = params.get('issuer') ?? '';

  // `otpauth://totp/Issuer:account` — the label lives in the path.
  const path = url.pathname.replace(/^\//, '');
  const label = path.includes(':') ? path.slice(path.indexOf(':') + 1) : path;

  const rawDigits = Number.parseInt(params.get('digits') ?? '', 10);
  const digits = Number.isFinite(rawDigits) && rawDigits >= 6 && rawDigits <= 10 ? rawDigits : DEFAULT_DIGITS;

  const rawPeriod = Number.parseInt(params.get('period') ?? '', 10);
  const period = Number.isFinite(rawPeriod) && rawPeriod >= 5 && rawPeriod <= 300 ? rawPeriod : DEFAULT_PERIOD;

  const rawAlgorithm = params.get('algorithm') ?? '';
  const algorithm = ALGORITHMS[rawAlgorithm.toUpperCase()] ?? DEFAULT_ALGORITHM;

  return { secret, label, issuer, digits, period, algorithm, isUri: true };
}

/**
 * Extract just the secret from an arbitrary string (URI or plain secret).
 *
 * @param input Raw text.
 * @returns The Base32 secret.
 */
export function extractSecret(input: string): string {
  return parseOtpAuth(input).secret;
}
