import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PERIOD,
  formatToken,
  generateHOTP,
  generateTOTP,
  getCounter,
  getRemainingSeconds,
  stripToken,
} from './totp';

/** RFC 6238 Appendix B — shared secret "12345678901234567890" (20 ASCII bytes). */
const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

/** The RFC 6238 SHA-1 time values and their 8-digit reference codes. */
const RFC_VECTORS: Array<{ time: number; expected8: string }> = [
  { time: 59, expected8: '94287082' },
  { time: 1111111109, expected8: '07081804' },
  { time: 1111111111, expected8: '14050471' },
  { time: 1234567890, expected8: '89005924' },
  { time: 2000000000, expected8: '69279037' },
  { time: 20000000000, expected8: '65353130' },
];

describe('generateHOTP (RFC 4226)', () => {
  it('reproduces the RFC 6238 SHA-1 vectors truncated to six digits', async () => {
    for (const vector of RFC_VECTORS) {
      const code = await generateHOTP(RFC_SECRET, getCounter(vector.time * 1000, DEFAULT_PERIOD));
      expect(code, `T=${vector.time}`).toBe(vector.expected8.slice(-6));
    }
  });

  it('always returns six zero-padded digits', async () => {
    for (let counter = 0; counter < 25; counter += 1) {
      const code = await generateHOTP(RFC_SECRET, counter);
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it('produces a different code for consecutive counters', async () => {
    const a = await generateHOTP(RFC_SECRET, 12345);
    const b = await generateHOTP(RFC_SECRET, 12346);
    expect(a).not.toBe(b);
  });

  it('is deterministic for the same counter', async () => {
    const a = await generateHOTP(RFC_SECRET, 999);
    const b = await generateHOTP(RFC_SECRET, 999);
    expect(a).toBe(b);
  });
});

describe('generateTOTP', () => {
  it('generates the code for a given timestamp', async () => {
    const code = await generateTOTP(RFC_SECRET, 1111111111 * 1000);
    expect(code).toBe('050471');
  });

  it('is stable across the whole time step', async () => {
    const base = 1_700_000_000_000;
    const period = Math.floor(base / 1000 / DEFAULT_PERIOD);
    const first = await generateTOTP(RFC_SECRET, base);
    const last = await generateTOTP(RFC_SECRET, (period + 1) * DEFAULT_PERIOD * 1000 - 1);
    expect(first).toBe(last);
  });

  it('changes when the time step rolls over', async () => {
    const base = 1_700_000_000_000;
    const period = Math.floor(base / 1000 / DEFAULT_PERIOD);
    const before = await generateTOTP(RFC_SECRET, base);
    const after = await generateTOTP(RFC_SECRET, (period + 1) * DEFAULT_PERIOD * 1000);
    expect(before).not.toBe(after);
  });

  it('supports eight digit codes', async () => {
    const code = await generateTOTP(RFC_SECRET, 1111111111 * 1000, { digits: 8 });
    expect(code).toBe('14050471');
  });

  it('supports a custom period', async () => {
    const code = await generateTOTP(RFC_SECRET, 1_700_000_000_000, { period: 60 });
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe('getCounter', () => {
  it('divides the timestamp by the period', () => {
    expect(getCounter(59 * 1000)).toBe(1);
    expect(getCounter(60 * 1000)).toBe(2);
    expect(getCounter(0)).toBe(0);
  });
});

describe('getRemainingSeconds', () => {
  it('reports the seconds left in the window', () => {
    expect(getRemainingSeconds(0)).toBe(30);
    expect(getRemainingSeconds(1_000)).toBe(29);
    expect(getRemainingSeconds(29_000)).toBe(1);
    expect(getRemainingSeconds(30_000)).toBe(30);
  });
});

describe('formatToken / stripToken', () => {
  it('splits a six digit code in the middle', () => {
    expect(formatToken('123456')).toBe('123 456');
    expect(stripToken('123 456')).toBe('123456');
  });

  it('leaves other lengths untouched', () => {
    expect(formatToken('12345678')).toBe('12345678');
    expect(formatToken('')).toBe('');
  });
});
