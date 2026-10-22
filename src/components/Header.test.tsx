import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from './Header';
import { renderWithProviders } from '../test/utils';

describe('Header', () => {
  it('renders the brand and the navigation links', () => {
    renderWithProviders(<Header onOpenPrivacy={() => {}} />);

    expect(screen.getByRole('link', { name: /2FA Live Code/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#how-it-works');
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features');
  });

  it('opens the privacy modal from the navigation', async () => {
    const onOpenPrivacy = vi.fn();
    const { user } = renderWithProviders(<Header onOpenPrivacy={onOpenPrivacy} />);

    await user.click(screen.getByRole('button', { name: 'Privacy' }));
    expect(onOpenPrivacy).toHaveBeenCalledTimes(1);
  });

  it('toggles the account menu', async () => {
    const { user } = renderWithProviders(<Header onOpenPrivacy={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Account menu' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Login' })).toHaveAttribute('href', '/login-page');
    expect(screen.getByRole('menuitem', { name: 'Register' })).toHaveAttribute('href', '/register');
  });

  it('closes the account menu when clicking outside', async () => {
    const { user } = renderWithProviders(<Header onOpenPrivacy={() => {}} />);
    const trigger = screen.getByRole('button', { name: 'Account menu' });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
