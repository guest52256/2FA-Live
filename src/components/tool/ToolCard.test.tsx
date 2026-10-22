import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToolCard } from './ToolCard';
import { renderWithProviders } from '../../test/utils';

/** RFC 6238 SHA-1 test vector: T = 1111111111 -> 6 digit code 050471. */
const FIXED_TIME_MS = 1_111_111_111_000;
const EXPECTED_CODE = '050 471';

describe('ToolCard', () => {
  let writeText: ReturnType<typeof vi.fn>;
  let readText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(FIXED_TIME_MS);

    writeText = vi.fn().mockResolvedValue(undefined);
    readText = vi.fn().mockResolvedValue('');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText, readText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the empty placeholder until a secret is entered', () => {
    renderWithProviders(<ToolCard />);
    expect(screen.getByLabelText('No one-time password generated')).toHaveTextContent('------');
  });

  it('generates a code that matches the RFC 6238 reference vector', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(
      screen.getByLabelText(/Authentication Secret Key/i),
      'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Current one-time password/)).toHaveTextContent(EXPECTED_CODE);
    });
  });

  it('shows the "Key too short" error for an incomplete key', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'ABC');

    expect(screen.getByRole('alert')).toHaveTextContent('Key too short');
    expect(screen.getByLabelText('No one-time password generated')).toHaveTextContent('------');
  });

  it('shows the "Invalid Characters" error for a non Base32 key', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'JBSWY3DPEHPK3PX1');

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid Characters');
  });

  it('clears the input and resets the code', async () => {
    const { user } = renderWithProviders(<ToolCard />);
    const input = screen.getByLabelText(/Authentication Secret Key/i);

    await user.type(input, 'JBSWY3DPEHPK3PXP');
    await waitFor(() => {
      expect(screen.getByLabelText(/Current one-time password/)).not.toHaveTextContent('------');
    });

    await user.click(screen.getByRole('button', { name: 'Clear secret key' }));

    expect(input).toHaveValue('');
    expect(screen.getByLabelText('No one-time password generated')).toHaveTextContent('------');
    expect(screen.getByRole('alert')).toHaveClass('hidden');
  });

  it('copies the raw code and shows a toast', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'JBSWY3DPEHPK3PXP');
    await waitFor(() => {
      expect(screen.getByLabelText(/Current one-time password/)).not.toHaveTextContent('------');
    });

    await user.click(screen.getByRole('button', { name: /Copy Code/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^\d{6}$/));
    });
    expect(await screen.findByText('Code copied to clipboard!')).toBeInTheDocument();
  });

  it('warns when there is no code to copy', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.click(screen.getByRole('button', { name: /Copy Code/i }));

    expect(await screen.findByText('No code to copy')).toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('remembers the key in the local cache and lists it', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    expect(screen.queryByText('Recent Keys (Local Cache)')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'JBSWY3DPEHPK3PXP');

    await waitFor(
      () => {
        expect(screen.getByText('Recent Keys (Local Cache)')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByText('JBSW •••• 3PXP')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('2fa_history') ?? '[]')).toEqual(['JBSWY3DPEHPK3PXP']);
  });

  it('loads a cached key back into the tool', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'JBSWY3DPEHPK3PXP');
    await waitFor(
      () => {
        expect(screen.getByText('Recent Keys (Local Cache)')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await user.clear(screen.getByLabelText(/Authentication Secret Key/i));
    await user.click(screen.getByRole('button', { name: /JBSW/ }));

    expect(screen.getByLabelText(/Authentication Secret Key/i)).toHaveValue('JBSWY3DPEHPK3PXP');
  });

  it('clears the local cache on request', async () => {
    const { user } = renderWithProviders(<ToolCard />);

    await user.type(screen.getByLabelText(/Authentication Secret Key/i), 'JBSWY3DPEHPK3PXP');
    await waitFor(
      () => {
        expect(screen.getByText('Recent Keys (Local Cache)')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(await screen.findByText('Local cache cleared')).toBeInTheDocument();
    expect(screen.queryByText('Recent Keys (Local Cache)')).not.toBeInTheDocument();
    expect(localStorage.getItem('2fa_history')).toBeNull();
  });

  it('pastes a secret from the clipboard', async () => {
    readText.mockResolvedValue('otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
    const { user } = renderWithProviders(<ToolCard />);

    await user.click(screen.getByRole('button', { name: /Paste Key/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Authentication Secret Key/i)).toHaveValue('JBSWY3DPEHPK3PXP');
    });
    expect(await screen.findByText('Key pasted from clipboard')).toBeInTheDocument();
  });

  it('reports a denied clipboard permission', async () => {
    readText.mockRejectedValue(new Error('denied'));
    const { user } = renderWithProviders(<ToolCard />);

    await user.click(screen.getByRole('button', { name: /Paste Key/i }));

    expect(
      await screen.findByText('Clipboard access denied. Please use Ctrl+V / Cmd+V'),
    ).toBeInTheDocument();
  });
});
