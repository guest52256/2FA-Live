import { expect, test } from '@playwright/test';

/**
 * Navigation, routing and modal behaviour of the clone.
 *
 * The source project is a single WordPress page. This reproduction keeps the
 * tool on `/` and adds the account layer (`/login-page`, `/register`,
 * `/admin`); unknown URLs are answered with the theme's 404 template.
 */
/**
 * The header navigation (`How it works`, `Features`, `Privacy`) is rendered
 * inside a `hidden sm:flex` container — exactly like in the source project —
 * so it only exists from the 640px breakpoint upwards.
 */
const NAV_HIDDEN_ON_SMALL_SCREENS =
  'The header navigation is only rendered from the 640px breakpoint upwards.';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('the "How it works" link jumps to the educational section', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640, NAV_HIDDEN_ON_SMALL_SCREENS);

    await page.getByRole('link', { name: 'How it works' }).click();

    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(page.locator('#how-it-works')).toBeInViewport();
  });

  test('the "Features" link jumps to the feature section', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640, NAV_HIDDEN_ON_SMALL_SCREENS);

    await page.getByRole('link', { name: 'Features' }).click();

    await expect(page).toHaveURL(/#features$/);
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('the account menu opens and closes', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Account menu' });
    const menu = page.locator('#auth-dropdown-menu');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('menuitem', { name: 'Login' })).toBeVisible();

    // Clicking outside closes the menu again.
    await page.locator('h1').first().click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('the account menu closes on Escape', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Account menu' });

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('/login-page renders the sign-in page', async ({ page }) => {
    await page.goto('/login-page');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel(/E-mail address/i)).toBeVisible();
  });

  test('/register renders the registration page', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByLabel(/Confirm password/i)).toBeVisible();
  });

  test('/admin sends anonymous visitors to the sign-in page', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login-page$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('the "Login" menu entry opens the sign-in page', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/login-page$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('unknown URLs render the 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to the generator' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel(/Authentication Secret Key/i)).toBeVisible();
  });

  test('the footer opens the legal documents in a modal', async ({ page }) => {
    const footer = page.locator('footer');

    for (const title of ['About Us', 'Contact Us', 'Privacy Policy', 'Disclaimer', 'Terms & Conditions']) {
      await footer.getByRole('button', { name: title, exact: true }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading', { name: title })).toBeVisible();

      await page.getByRole('button', { name: 'Close dialog' }).click();
      await expect(dialog).toBeHidden();
    }
  });

  test('the header privacy button opens the privacy policy', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640, NAV_HIDDEN_ON_SMALL_SCREENS);

    await page.locator('header').getByRole('button', { name: 'Privacy', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Acknowledge' }).click();
    await expect(dialog).toBeHidden();
  });

  test('the modal closes with the Escape key', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640, NAV_HIDDEN_ON_SMALL_SCREENS);

    await page.locator('header').getByRole('button', { name: 'Privacy', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('the modal traps the focus and restores it on close', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640, NAV_HIDDEN_ON_SMALL_SCREENS);

    const trigger = page.locator('header').getByRole('button', { name: 'Privacy', exact: true });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Focus must land inside the dialog.
    await expect
      .poll(async () => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
