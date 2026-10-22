/**
 * An independent TOTP reference implementation used by the end-to-end tests.
 *
 * It is deliberately written from the RFCs (using `node:crypto`) instead of
 * reusing the application code, so that the E2E assertions verify the app
 * against an external source of truth.
 */

import { createHmac } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a Base32 string into bytes.
 *
 * @param input The Base32 text.
 * @returns The decoded bytes.
 */
export function decodeBase32(input: string): Buffer {
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const ch of input.toUpperCase().replace(/=+$/, '')) {
    const index = ALPHABET.indexOf(ch);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

/**
 * Compute the RFC 6238 TOTP code.
 *
 * @param secret Base32 secret.
 * @param timestampMs Unix timestamp in milliseconds.
 * @param period Time step in seconds.
 * @param digits Number of digits.
 * @returns The one-time password.
 */
export function referenceTotp(
  secret: string,
  timestampMs: number = Date.now(),
  period = 30,
  digits = 6,
): string {
  const counter = Math.floor(timestampMs / 1000 / period);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);

  const digest = createHmac('sha1', decodeBase32(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  return String(binary % 10 ** digits).padStart(digits, '0');
}

/**
 * Every code that is valid for a given secret around `timestampMs` — used to
 * tolerate the race between reading the clock in the browser and in Node.
 *
 * @param secret Base32 secret.
 * @param timestampMs Unix timestamp in milliseconds.
 * @returns The set of acceptable codes.
 */
export function acceptableCodes(secret: string, timestampMs: number = Date.now()): Set<string> {
  const period = 30;
  const counter = Math.floor(timestampMs / 1000 / period);
  const codes = new Set<string>();
  for (const step of [counter - 1, counter, counter + 1]) {
    codes.add(referenceTotp(secret, step * period * 1000));
  }
  return codes;
}
