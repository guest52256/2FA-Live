import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminPage } from './AdminPage';
import { renderWithProviders } from '../test/utils';
import type { UserProfile } from '../lib/auth';

const signOut = vi.fn();

const adminUser = {
  uid: 'uid-admin',
  email: 'admin@example.com',
  displayName: 'The Admin',
};

const adminProfile: UserProfile = {
  uid: 'uid-admin',
  email: 'admin@example.com',
  displayName: 'The Admin',
  role: 'admin',
  createdAt: 1_700_000_000_000,
  lastLoginAt: 1_700_000_100_000,
  provider: 'password',
};

const memberProfile: UserProfile = {
  uid: 'uid-member',
  email: 'member@example.com',
  displayName: 'A Member',
  role: 'user',
  createdAt: 1_700_000_200_000,
  lastLoginAt: 1_700_000_300_000,
  provider: 'password',
};

const listProfiles = vi.fn();
const listAdminLogs = vi.fn();
const setProfileRole = vi.fn();
const deleteProfile = vi.fn();
const logAdminAction = vi.fn();

vi.mock('../hooks/useAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useAuth')>();
  return {
    ...actual,
    useAuth: () => ({
      ready: true,
      configured: true,
      user: adminUser,
      profile: adminProfile,
      error: null,
      clearError: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut,
      refreshProfile: vi.fn(),
    }),
  };
});

vi.mock('../lib/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/firebase')>();
  return {
    ...actual,
    getFirestoreDb: () => ({}) as never,
  };
});

vi.mock('../lib/userDirectory', () => ({
  listProfiles: (...args: unknown[]) => listProfiles(...args),
  listAdminLogs: (...args: unknown[]) => listAdminLogs(...args),
  setProfileRole: (...args: unknown[]) => setProfileRole(...args),
  deleteProfile: (...args: unknown[]) => deleteProfile(...args),
  logAdminAction: (...args: unknown[]) => logAdminAction(...args),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listProfiles.mockResolvedValue([adminProfile, memberProfile]);
    listAdminLogs.mockResolvedValue([
      {
        actorEmail: 'admin@example.com',
        action: 'grant-admin',
        targetUid: 'uid-member',
        detail: 'member@example.com',
        at: 1_700_000_400_000,
      },
    ]);
  });

  it('shows the account statistics', async () => {
    renderWithProviders(<AdminPage />);

    await waitFor(() => expect(listProfiles).toHaveBeenCalled());
    expect(await screen.findByText('Total accounts')).toBeInTheDocument();
    expect(screen.getByText('Administrators')).toBeInTheDocument();
    expect(screen.getByText('New this week')).toBeInTheDocument();
  });

  it('lists every account with its role', async () => {
    renderWithProviders(<AdminPage />);

    expect(await screen.findAllByText('member@example.com')).not.toHaveLength(0);
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('promotes a user and records the action', async () => {
    renderWithProviders(<AdminPage />);

    const memberRow = (await screen.findByText('member@example.com')).closest('tr');
    expect(memberRow).not.toBeNull();

    const promote = memberRow?.querySelector('button');
    await promote?.click();

    await waitFor(() => expect(setProfileRole).toHaveBeenCalled());
    expect(setProfileRole).toHaveBeenCalledWith(expect.anything(), 'uid-member', 'admin');
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'grant-admin', targetUid: 'uid-member' }),
    );
  });

  it('removes an account from the directory', async () => {
    renderWithProviders(<AdminPage />);

    const memberRow = (await screen.findByText('member@example.com')).closest('tr');
    const remove = Array.from(memberRow?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent?.trim() === 'Remove',
    );
    await remove?.click();

    await waitFor(() => expect(deleteProfile).toHaveBeenCalled());
    expect(deleteProfile).toHaveBeenCalledWith(expect.anything(), 'uid-member');
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'remove-account' }),
    );
  });

  it('does not offer actions on the signed-in administrator', async () => {
    renderWithProviders(<AdminPage />);

    const rows = await screen.findAllByText('admin@example.com');
    const adminRow = rows.map((row) => row.closest('tr')).find((row) => row !== null);
    expect(adminRow?.textContent).toContain('This is you');
  });

  it('shows the audit trail', async () => {
    renderWithProviders(<AdminPage />);

    expect(await screen.findByText(/grant-admin/)).toBeInTheDocument();
  });

  it('logs the administrator out', async () => {
    renderWithProviders(<AdminPage />);

    const logout = await screen.findByRole('button', { name: 'Log out' });
    await logout.click();

    expect(signOut).toHaveBeenCalled();
  });
});
