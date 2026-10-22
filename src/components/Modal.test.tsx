import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';
import { renderWithProviders } from '../test/utils';

describe('Modal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is not rendered when closed', () => {
    renderWithProviders(
      <Modal open={false} onClose={() => {}} title="Privacy Policy">
        <p>Body</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the title and body when open', async () => {
    renderWithProviders(
      <Modal open onClose={() => {}} title="Privacy Policy">
        <p>Secret body</p>
      </Modal>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('Secret body')).toBeInTheDocument();
  });

  it('closes when the acknowledge button is pressed', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <Modal open onClose={onClose} title="About Us">
        <p>Body</p>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <Modal open onClose={onClose} title="About Us">
        <p>Body</p>
      </Modal>,
    );

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <Modal open onClose={onClose} title="About Us">
        <p>Body</p>
      </Modal>,
    );

    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('moves focus into the dialog when it opens', async () => {
    renderWithProviders(
      <Modal open onClose={() => {}} title="Terms">
        <p>Body</p>
      </Modal>,
    );

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });
});
