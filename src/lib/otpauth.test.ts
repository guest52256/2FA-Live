import { describe, expect, it } from 'vitest';

import { extractSecret, parseOtpAuth } from './otpauth';

describe('parseOtpAuth', () => {
  it('returns a plain secret untouched', () => {
    const payload = parseOtpAuth('JBSWY3DPEHPK3PXP');
    expect(payload).toMatchObject({
      secret: 'JBSWY3DPEHPK3PXP',
      isUri: false,
      digits: 6,
      period: 30,
      algorithm: 'SHA-1',
    });
  });

  it('extracts the secret from an otpauth URI', () => {
    const payload = parseOtpAuth('otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
    expect(payload.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(payload.label).toBe('alice@google.com');
    expect(payload.issuer).toBe('Example');
    expect(payload.isUri).toBe(true);
  });

  it('honours the optional digits, period and algorithm parameters', () => {
    const payload = parseOtpAuth(
      'otpauth://totp/Example?secret=JBSWY3DPEHPK3PXP&digits=8&algorithm=SHA256&period=60',
    );
    expect(payload.digits).toBe(8);
    expect(payload.period).toBe(60);
    expect(payload.algorithm).toBe('SHA-256');
  });

  it('falls back to the defaults for out-of-range parameters', () => {
    const payload = parseOtpAuth('otpauth://totp/Example?secret=JBSWY3DPEHPK3PXP&digits=3&period=9999');
    expect(payload.digits).toBe(6);
    expect(payload.period).toBe(30);
  });

  it('survives a malformed URI', () => {
    expect(() => parseOtpAuth('otpauth://')).not.toThrow();
    // A URI without a `secret` parameter yields an empty secret.
    expect(parseOtpAuth('otpauth://').secret).toBe('');
    expect(parseOtpAuth('otpauth://totp/Example').secret).toBe('');
  });
});

describe('extractSecret', () => {
  it('extracts the secret from an URI', () => {
    expect(extractSecret('otpauth://totp/Example?secret=JBSWY3DPEHPK3PXP')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('extracts the secret from plain text', () => {
    expect(extractSecret('JBSWY3DPEHPK3PXP')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('trims surrounding whitespace', () => {
    expect(extractSecret('  JBSWY3DPEHPK3PXP  ')).toBe('JBSWY3DPEHPK3PXP');
  });
});
