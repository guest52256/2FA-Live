import { describe, expect, it } from 'vitest';

import {
  MIN_PASSWORD_LENGTH,
  describeAuthError,
  describeRole,
  formatTimestamp,
  isAdmin,
  validateEmail,
  validatePassword,
  validateSignUpForm,
  type UserProfile,
} from './auth';

describe('auth helpers', () => {
  describe('validateEmail', () => {
    it('accepts a normal address', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('  user@example.com  ')).toBeNull();
    });

    it('rejects an empty address', () => {
      expect(validateEmail('   ')).toBe('E-mail address is required');
    });

    it('rejects a malformed address', () => {
      expect(validateEmail('not-an-email')).toBe('Enter a valid e-mail address');
      expect(validateEmail('user@')).toBe('Enter a valid e-mail address');
      expect(validateEmail('user@example')).toBe('Enter a valid e-mail address');
      expect(validateEmail('user @example.com')).toBe('Enter a valid e-mail address');
    });
  });

  describe('validatePassword', () => {
    it('accepts a long enough password', () => {
      expect(validatePassword('secret123')).toBeNull();
    });

    it('rejects an empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('rejects a short password', () => {
      expect(validatePassword('abc')).toBe(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    });
  });

  describe('validateSignUpForm', () => {
    it('accepts a consistent form', () => {
      expect(
        validateSignUpForm({
          displayName: 'Ada',
          email: 'ada@example.com',
          password: 'secret123',
          confirmPassword: 'secret123',
        }),
      ).toEqual({});
    });

    it('reports mismatching passwords', () => {
      const errors = validateSignUpForm({
        displayName: '',
        email: 'ada@example.com',
        password: 'secret123',
        confirmPassword: 'secret124',
      });
      expect(errors.confirmPassword).toBe('Passwords do not match');
    });

    it('reports a bad e-mail address and a short password', () => {
      const errors = validateSignUpForm({
        displayName: '',
        email: 'nope',
        password: 'abc',
        confirmPassword: 'abc',
      });
      expect(errors.email).toBe('Enter a valid e-mail address');
      expect(errors.password).toBe('Password must be at least 6 characters');
    });

    it('rejects an over-long display name', () => {
      const errors = validateSignUpForm({
        displayName: 'x'.repeat(41),
        email: 'ada@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      });
      expect(errors.displayName).toBe('Display name must be 40 characters or fewer');
    });
  });

  describe('isAdmin', () => {
    const base: UserProfile = {
      uid: 'uid-1',
      email: 'a@example.com',
      displayName: '',
      role: 'user',
      createdAt: 0,
      lastLoginAt: 0,
      provider: 'password',
    };

    it('is false without a profile', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('is false for a regular user', () => {
      expect(isAdmin(base)).toBe(false);
    });

    it('is true for an administrator', () => {
      expect(isAdmin({ ...base, role: 'admin' })).toBe(true);
    });
  });

  describe('describeRole', () => {
    it('labels both roles', () => {
      expect(describeRole('admin')).toBe('Administrator');
      expect(describeRole('user')).toBe('User');
    });
  });

  describe('formatTimestamp', () => {
    it('renders an em dash for a missing timestamp', () => {
      expect(formatTimestamp(null)).toBe('—');
      expect(formatTimestamp(undefined)).toBe('—');
      expect(formatTimestamp(0)).toBe('—');
    });

    it('renders a date for a real timestamp', () => {
      const formatted = formatTimestamp(Date.UTC(2024, 0, 2, 3, 4));
      expect(formatted).toMatch(/2024/);
    });
  });

  describe('describeAuthError', () => {
    it('maps the known Firebase error codes', () => {
      expect(describeAuthError({ code: 'auth/invalid-credential' })).toBe(
        'Incorrect e-mail address or password.',
      );
      expect(describeAuthError({ code: 'auth/email-already-in-use' })).toBe(
        'An account with that e-mail address already exists.',
      );
      expect(describeAuthError({ code: 'auth/weak-password' })).toBe(
        'That password is too weak — please choose a longer one.',
      );
      expect(describeAuthError({ code: 'auth/too-many-requests' })).toBe(
        'Too many attempts. Please try again in a moment.',
      );
      expect(describeAuthError({ code: 'auth/network-request-failed' })).toBe(
        'Network error. Please check your connection and try again.',
      );
    });

    it('falls back to the error message', () => {
      expect(describeAuthError(new Error('boom'))).toBe('boom');
    });

    it('falls back to a generic message', () => {
      expect(describeAuthError('nope')).toBe('Something went wrong. Please try again.');
    });
  });
});
