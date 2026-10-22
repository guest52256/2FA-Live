/**
 * RFC 4648 Base32 (no padding required) codec.
 *
 * The decoder mirrors the behaviour of the source project byte-for-byte:
 *   - characters outside the Base32 alphabet are skipped (not an error)
 *   - '=' padding is ignored
 *   - the result is the bit-trimmed byte sequence
 *
 * The encoder is an addition used for tests and for generating fixture QR
 * codes; it is not used at runtime by the app itself.
 */

export const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const BASE32_LOOKUP: Record<string, number> = /* @__PURE__ */ (() => {
  const map: Record<string, number> = {};
  for (let i = 0; i < BASE32_ALPHABET.length; i += 1) {
    map[BASE32_ALPHABET[i] as string] = i;
  }
  return map;
})();

/**
 * Decode a Base32 string into raw bytes.
 *
 * @param input Base32 text. Case-insensitive characters outside the alphabet
 *              (whitespace, dashes, padding) are ignored.
 * @returns The decoded bytes.
 */
export function decodeBase32(input: string): Uint8Array {
  const upper = input.toUpperCase();
  let val = 0;
  let bits = 0;
  const out: number[] = [];

  for (let i = 0; i < upper.length; i += 1) {
    const char = upper[i] as string;
    const charIndex = BASE32_LOOKUP[char];
    if (charIndex === undefined) continue; // skip padding / invalid characters

    val = (val << 5) | charIndex;
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Uint8Array.from(out);
}

/**
 * Encode raw bytes as a Base32 string (RFC 4648, without trailing padding).
 *
 * @param bytes Raw bytes to encode.
 * @returns The Base32 representation.
 */
export function encodeBase32(bytes: Uint8Array): string {
  let val = 0;
  let bits = 0;
  let out = '';

  for (let i = 0; i < bytes.length; i += 1) {
    val = (val << 8) | (bytes[i] as number);
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
    // Keep only the bits that have not been emitted yet.
    val &= (1 << bits) - 1;
  }

  if (bits > 0) {
    out += BASE32_ALPHABET[(val << (5 - bits)) & 31];
  }

  return out;
}

/**
 * Base32-encode an ASCII/UTF-8 string (helper for tests and fixtures).
 *
 * @param text Plain text to encode.
 * @returns The Base32 representation.
 */
export function encodeBase32Text(text: string): string {
  return encodeBase32(new TextEncoder().encode(text));
}
