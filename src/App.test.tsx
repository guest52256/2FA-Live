import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ToastHost } from './components/Toast';

/**
 * Render the app at a given URL.
 *
 * @param path The initial location.
 * @returns Nothing.
 */
function renderAt(path: string) {
  return import('@testing-library/react').then(({ render }) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <ToastProvider>
          <AuthProvider>
            <App />
            <ToastHost />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    ),
  );
}

describe('App routing', () => {
  it('renders the tool on the home page', async () => {
    await renderAt('/');

    expect(screen.getByRole('heading', { name: /Generate 2FA Tokens Instantly/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Authentication Secret Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy Code/i })).toBeInTheDocument();
  });

  it('renders the sign-in page on /login-page', async () => {
    await renderAt('/login-page');

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it('renders the registration page on /register', async () => {
    await renderAt('/register');

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
  });

  it('redirects /admin to the sign-in page when nobody is signed in', async () => {
    await renderAt('/admin');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders a 404 page for unknown routes', async () => {
    await renderAt('/definitely-not-a-page');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to the generator/i })).toHaveAttribute('href', '/');
  });

  it('renders every section of the long-form content', async () => {
    await renderAt('/');

    expect(screen.getByRole('heading', { name: 'Unlock the Future of Security' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is 2FA?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zero-Knowledge Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lightning Fast' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /How does 2FA Authentication work/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Universal Compatibility/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeInTheDocument();
  });

  it('opens the legal documents from the footer', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    await renderAt('/');

    await user.click(screen.getByRole('button', { name: 'Privacy Policy' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
  });
});
