import { expect, test } from '@playwright/test';
import QRCode from 'qrcode';

const SECRET = 'JBSWY3DPEHPK3PXP';

/**
 * QR-code ingestion of the clone.
 *
 * The fixture is generated locally with the `qrcode` package, so the test does
 * not depend on any third-party asset.
 */
test.describe('QR code handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toBeVisible();
  });

  test('recognises a QR code that encodes an otpauth:// URI', async ({ page }) => {
    const uri = `otpauth://totp/Example:user@example.com?secret=${SECRET}&issuer=Example`;
    const buffer = await QRCode.toBuffer(uri, { width: 400, margin: 4 });

    await page.setInputFiles('#image-upload', {
      name: 'qr.png',
      mimeType: 'image/png',
      buffer,
    });

    await expect(page.locator('#toast-text')).toHaveText('QR Code recognized!');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toHaveValue(SECRET);
    await expect(page.locator('#totp-output')).not.toHaveText('------');
  });

  test('recognises a QR code that encodes a plain secret', async ({ page }) => {
    const buffer = await QRCode.toBuffer(SECRET, { width: 400, margin: 4 });

    await page.setInputFiles('#image-upload', {
      name: 'qr.png',
      mimeType: 'image/png',
      buffer,
    });

    await expect(page.locator('#toast-text')).toHaveText('QR Code recognized!');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toHaveValue(SECRET);
  });

  test('reports an error for an image without a QR code', async ({ page }) => {
    // A 1x1 transparent PNG — valid image, no QR code inside.
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    await page.setInputFiles('#image-upload', {
      name: 'blank.png',
      mimeType: 'image/png',
      buffer,
    });

    await expect(page.locator('#toast-text')).toHaveText('No valid QR code found in image.');
    await expect(page.locator('#totp-output')).toHaveText('------');
  });

  test('reports an error for a file that is not an image', async ({ page }) => {
    await page.setInputFiles('#image-upload', {
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image at all'),
    });

    await expect(page.locator('#toast-text')).toHaveText('No valid QR code found in image.');
  });

  test('the camera scanner opens and shows the video feed', async ({ page }) => {
    await page.getByRole('button', { name: /Scan QR/i }).click();

    const modal = page.locator('#camera-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Scan QR Code' })).toBeVisible();

    // The fake media device feeds the video element with a live stream.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const video = document.querySelector('#video-feed') as HTMLVideoElement | null;
          return Boolean(video && video.srcObject && video.readyState >= 2);
        }),
      )
      .toBe(true);

    await page.getByRole('button', { name: 'Close scanner' }).click();
    await expect(modal).toBeHidden();
  });
});

test.describe('clipboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toBeVisible();
  });

  test('pastes a secret from the clipboard', async ({ page }) => {
    await page.evaluate((value) => navigator.clipboard.writeText(value), SECRET);

    await page.getByRole('button', { name: /Paste Key/i }).click();

    await expect(page.locator('#toast-text')).toHaveText('Key pasted from clipboard');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toHaveValue(SECRET);
  });

  test('pastes an otpauth:// URI and keeps only the secret', async ({ page }) => {
    const uri = `otpauth://totp/Example:user@example.com?secret=${SECRET}&issuer=Example`;
    await page.evaluate((value) => navigator.clipboard.writeText(value), uri);

    await page.getByRole('button', { name: /Paste Key/i }).click();

    await expect(page.locator('#toast-text')).toHaveText('Key pasted from clipboard');
    await expect(page.getByLabel(/Authentication Secret Key/i)).toHaveValue(SECRET);
  });
});
