import { describe, expect, it } from 'vitest';

import { decodeBase32, encodeBase32, encodeBase32Text } from './base32';

describe('decodeBase32', () => {
  it('decodes the RFC 4648 test vectors', () => {
    // `Array.from` is used because the TextEncoder polyfill produces a typed
    // array from a different realm than the one the module runs in.
    expect(Array.from(decodeBase32('MZXW6YTBOI======'))).toEqual(
      Array.from(new TextEncoder().encode('foobar')),
    );
    expect(Array.from(decodeBase32('MZXW6YTBOI'))).toEqual(
      Array.from(new TextEncoder().encode('foobar')),
    );
    expect(Array.from(decodeBase32('NBSWY3DPEB3W64TMMQ======'))).toEqual(
      Array.from(new TextEncoder().encode('hello world')),
    );
  });

  it('decodes the well-known authenticator secret', () => {
    expect(Array.from(decodeBase32('JBSWY3DPEHPK3PXP'))).toEqual([
      0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21, 0xde, 0xad, 0xbe, 0xef,
    ]);
  });

  it('is case insensitive', () => {
    expect(Array.from(decodeBase32('mzxw6ytboi'))).toEqual(Array.from(decodeBase32('MZXW6YTBOI')));
  });

  it('skips characters outside the alphabet (padding, spaces, dashes)', () => {
    expect(Array.from(decodeBase32('JBSW Y3DP-EHPK 3PXP'))).toEqual(
      Array.from(decodeBase32('JBSWY3DPEHPK3PXP')),
    );
  });

  it('returns an empty buffer for empty input', () => {
    expect(decodeBase32('')).toEqual(new Uint8Array(0));
  });
});

describe('encodeBase32', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    expect(Array.from(decodeBase32(encodeBase32(bytes)))).toEqual(Array.from(bytes));
  });

  it('encodes text without trailing padding', () => {
    expect(encodeBase32Text('foo')).toBe('MZXW6');
    expect(encodeBase32Text('foobar')).toBe('MZXW6YTBOI');
    expect(encodeBase32Text('hello world')).toBe('NBSWY3DPEB3W64TMMQ');
  });
});
