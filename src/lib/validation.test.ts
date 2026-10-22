import { describe, expect, it } from 'vitest';

import { BASE32_REGEX, MIN_SECRET_LENGTH, normalizeSecret, validateSecret } from './validation';

describe('normalizeSecret', () => {
  it('strips whitespace and upper-cases', () => {
    expect(normalizeSecret('jbsw y3dp ehpk 3pxp')).toBe('JBSWY3DPEHPK3PXP');
    expect(normalizeSecret('  GAXG243EMR2XQZ  ')).toBe('GAXG243EMR2XQZ');
  });

  it('leaves padding in place', () => {
    expect(normalizeSecret('MZXW6YTBOI======')).toBe('MZXW6YTBOI======');
  });
});

describe('BASE32_REGEX', () => {
  it('accepts valid Base32 with optional trailing padding', () => {
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PXP')).toBe(true);
    expect(BASE32_REGEX.test('MZXW6YTBOI======')).toBe(true);
  });

  it('rejects characters outside the Base32 alphabet', () => {
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PX1')).toBe(false);
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PX0')).toBe(false);
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PX8')).toBe(false);
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PX9')).toBe(false);
    expect(BASE32_REGEX.test('JBSWY3DPEHPK3PX!')).toBe(false);
  });

  it('rejects embedded padding', () => {
    expect(BASE32_REGEX.test('MZXW6YT==BOI')).toBe(false);
  });
});

describe('validateSecret', () => {
  it('treats an empty secret as neutral', () => {
    expect(validateSecret('')).toEqual({ valid: false, error: null, message: null });
  });

  it('accepts a valid secret', () => {
    expect(validateSecret('JBSWY3DPEHPK3PXP')).toEqual({ valid: true, error: null, message: null });
  });

  it('rejects a short secret with "Key too short"', () => {
    const result = validateSecret('ABC');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('too-short');
    expect(result.message).toBe('Key too short');
  });

  it('rejects invalid characters with "Invalid Characters"', () => {
    const result = validateSecret('JBSWY3DPEHPK3PX1');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('invalid-characters');
    expect(result.message).toBe('Invalid Characters');
  });

  it('uses a minimum length of eight characters', () => {
    expect(MIN_SECRET_LENGTH).toBe(8);
    expect(validateSecret('ABCDEFGH').valid).toBe(true);
    expect(validateSecret('ABCDEFG').valid).toBe(false);
  });
});
