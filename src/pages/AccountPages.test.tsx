import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { renderWithProviders } from '../test/utils';

const signIn = vi.fn();
const signUp = vi.fn();

vi.mock('../hooks/useAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useAuth')>();
  return {
    ...actual,
    useAuth: () => ({
      ready: true,
      configured: false,
      user: null,
      profile: null,
      error: null,
      clearError: vi.fn(),
      signIn,
      signUp,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    }),
  };
});

describe('account pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('renders the sign-in form', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByLabelText(/E-mail address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('explains that accounts are disabled without Firebase', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByText(/Accounts are currently disabled/i)).toBeInTheDocument();
    });

    it('validates the e-mail address', async () => {
      const { user } = renderWithProviders(<LoginPage />);

      await user.type(screen.getByLabelText(/E-mail address/i), 'not-an-email');
      await user.type(screen.getByLabelText(/^Password$/i), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(await screen.findByText('Enter a valid e-mail address')).toBeInTheDocument();
      expect(signIn).not.toHaveBeenCalled();
    });

    it('validates the password', async () => {
      const { user } = renderWithProviders(<LoginPage />);

      await user.type(screen.getByLabelText(/E-mail address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'abc');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
      expect(signIn).not.toHaveBeenCalled();
    });

    it('submits a valid form', async () => {
      signIn.mockResolvedValue(undefined);
      const { user } = renderWithProviders(<LoginPage />);

      await user.type(screen.getByLabelText(/E-mail address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => expect(signIn).toHaveBeenCalledWith('user@example.com', 'secret123'));
    });
  });

  describe('SignUpPage', () => {
    it('renders the registration form', () => {
      renderWithProviders(<SignUpPage />);

      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    });

    it('reports mismatching passwords', async () => {
      const { user } = renderWithProviders(<SignUpPage />);

      await user.type(screen.getByLabelText(/E-mail address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'secret123');
      await user.type(screen.getByLabelText(/Confirm password/i), 'secret124');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
      expect(signUp).not.toHaveBeenCalled();
    });

    it('submits a valid form', async () => {
      signUp.mockResolvedValue(undefined);
      const { user } = renderWithProviders(<SignUpPage />);

      await user.type(screen.getByLabelText(/Display name/i), 'Ada');
      await user.type(screen.getByLabelText(/E-mail address/i), 'ada@example.com');
      await user.type(screen.getByLabelText(/^Password$/i), 'secret123');
      await user.type(screen.getByLabelText(/Confirm password/i), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => expect(signUp).toHaveBeenCalledWith('Ada', 'ada@example.com', 'secret123'));
    });
  });
});
