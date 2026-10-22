import { expect, test } from '@playwright/test';

import { acceptableCodes } from './reference-totp';

const SECRET = 'JBSWY3DPEHPK3PXP';

test.describe('TOTP tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toBeVisible();
  });

  test('renders the headline content', async ({ page }) => {
    await expect(page).toHaveTitle('2FA Auth Code');
    await expect(page.getByRole('heading', { name: /Generate 2FA Tokens Instantly/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Code/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Paste Key/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Scan QR/i })).toBeVisible();
  });

  test('shows an empty placeholder before a key is entered', async ({ page }) => {
    await expect(page.locator('#totp-output')).toHaveText('------');
  });

  test('generates the RFC 6238 code for the entered secret', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill(SECRET);

    const output = page.locator('#totp-output');
    await expect(output).not.toHaveText('------');

    const shown = (await output.innerText()).replace(/\s/g, '');
    const acceptable = acceptableCodes(SECRET);
    expect(acceptable.has(shown)).toBe(true);
  });

  test('the generated code changes when the time step rolls over', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill(SECRET);
    const output = page.locator('#totp-output');
    await expect(output).not.toHaveText('------');

    const first = await output.innerText();

    // Wait for the 30 second window to roll over.
    await expect
      .poll(async () => (await output.innerText()).replace(/\s/g, ''), { timeout: 40_000 })
      .not.toBe(first.replace(/\s/g, ''));
  });

  test('rejects a non Base32 key', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill('JBSWY3DPEHPK3PX1');

    await expect(page.locator('#validation-error')).toBeVisible();
    await expect(page.locator('#validation-error')).toHaveText('Invalid Characters');
    await expect(page.locator('#totp-output')).toHaveText('------');
  });

  test('rejects a key that is too short', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill('ABC');

    await expect(page.locator('#validation-error')).toHaveText('Key too short');
  });

  test('clears the secret', async ({ page }) => {
    const input = page.getByLabel(/Authentication Secret Key/i);
    await input.fill(SECRET);
    await expect(page.locator('#totp-output')).not.toHaveText('------');

    await page.getByRole('button', { name: 'Clear secret key' }).click();

    await expect(input).toHaveValue('');
    await expect(page.locator('#totp-output')).toHaveText('------');
  });

  test('copies the code to the clipboard', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill(SECRET);
    await expect(page.locator('#totp-output')).not.toHaveText('------');

    await page.getByRole('button', { name: /Copy Code/i }).click();

    await expect(page.locator('#toast-text')).toHaveText('Code copied to clipboard!');

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/^\d{6}$/);
  });

  test('warns when there is nothing to copy', async ({ page }) => {
    await page.getByRole('button', { name: /Copy Code/i }).click();
    await expect(page.locator('#toast-text')).toHaveText('No code to copy');
  });

  test('remembers the key in the local cache and can restore it', async ({ page }) => {
    const input = page.getByLabel(/Authentication Secret Key/i);
    await input.fill(SECRET);

    const history = page.locator('#history-section');
    await expect(history).toBeVisible();
    await expect(history).toContainText('JBSW •••• 3PXP');

    await input.fill('');
    await expect(page.locator('#totp-output')).toHaveText('------');

    await history.locator('#history-list button').first().click();
    await expect(input).toHaveValue(SECRET);
    await expect(page.locator('#totp-output')).not.toHaveText('------');
  });

  test('clears the local cache', async ({ page }) => {
    await page.getByLabel(/Authentication Secret Key/i).fill(SECRET);
    await expect(page.locator('#history-section')).toBeVisible();

    await page.getByRole('button', { name: 'Clear', exact: true }).click();

    await expect(page.locator('#toast-text')).toHaveText('Local cache cleared');
    await expect(page.locator('#history-section')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('2fa_history'))).toBeNull();
  });

  test('shows the countdown and drains the progress bar', async ({ page }) => {
    const countdown = page.locator('#countdown-text');
    await expect(countdown).toHaveText(/^\d+s$/);

    const width = await page.locator('#progress-bar').evaluate((el) => (el as HTMLElement).style.width);
    expect(width).toMatch(/^\d+(\.\d+)?%$/);
  });
});
