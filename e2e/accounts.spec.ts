import { expect, test } from '@playwright/test';

/**
 * The optional account layer (sign-up / login / admin panel).
 *
 * The end-to-end build runs without a Firebase configuration, so the pages
 * render their "accounts are disabled" notice while the forms themselves stay
 * fully interactive — which is exactly what these checks exercise. The
 * Firebase calls themselves are covered by the unit tests with mocked
 * dependencies (`src/pages/AccountPages.test.tsx`,
 * `src/pages/AdminPage.test.tsx`).
 */
test.describe('accounts', () => {
  test('the sign-in page validates the e-mail address', async ({ page }) => {
    await page.goto('/login-page');

    await page.getByLabel(/E-mail address/i).fill('not-an-email');
    await page.getByLabel(/^Password$/i).fill('secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid e-mail address')).toBeVisible();
    await expect(page).toHaveURL(/\/login-page$/);
  });

  test('the sign-in page validates the password length', async ({ page }) => {
    await page.goto('/login-page');

    await page.getByLabel(/E-mail address/i).fill('user@example.com');
    await page.getByLabel(/^Password$/i).fill('abc');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('the sign-in page links to the registration page', async ({ page }) => {
    await page.goto('/login-page');

    await page.getByRole('link', { name: 'Create one' }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  test('the registration page reports mismatching passwords', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/E-mail address/i).fill('user@example.com');
    await page.getByLabel(/^Password$/i).fill('secret123');
    await page.getByLabel(/Confirm password/i).fill('secret124');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('the registration page links back to the sign-in page', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('link', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/login-page$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('both account pages explain that accounts are disabled without Firebase', async ({ page }) => {
    await page.goto('/login-page');
    await expect(page.getByText(/Accounts are currently disabled/i)).toBeVisible();

    await page.goto('/register');
    await expect(page.getByText(/Accounts are currently disabled/i)).toBeVisible();
  });

  test('the header offers login and register while signed out', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Account menu' }).click();
    const menu = page.locator('#auth-dropdown-menu');

    await expect(menu.getByRole('menuitem', { name: 'Login' })).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Register' })).toBeVisible();
    await expect(menu.getByText(/Accounts are disabled/i)).toBeVisible();
  });

  test('the "Register" menu entry opens the registration page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  test('the admin panel is closed to anonymous visitors', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login-page$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toHaveCount(0);
  });

  test('the account pages can return to the generator', async ({ page }) => {
    await page.goto('/login-page');

    await page.getByRole('link', { name: /Back to the generator/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel(/Authentication Secret Key/i)).toBeVisible();
  });
});
