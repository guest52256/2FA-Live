/**
 * QR-code decoding helpers.
 *
 * `jsQR` is only needed when the user actually scans a code, so it is loaded
 * on demand instead of being bundled into the initial payload.
 */

/** Dynamically load the QR decoder. */
async function loadJsQR() {
  const module = await import('jsqr');
  return module.default;
}

/**
 * Decode a QR code from raw image data.
 *
 * @param imageData Pixel data, as produced by a canvas 2D context.
 * @param inversionAttempts jsQR inversion strategy.
 * @returns The decoded payload, or null when no QR code is present.
 */
export async function decodeQrFromImageData(
  imageData: ImageData,
  inversionAttempts: 'dontInvert' | 'attemptBoth' | 'onlyInvert' = 'attemptBoth',
): Promise<string | null> {
  const jsQR = await loadJsQR();
  const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts });
  return result?.data ?? null;
}

/**
 * Grab the current frame of a video element and decode a QR code from it.
 *
 * @param video The video element to read from.
 * @param inversionAttempts jsQR inversion strategy.
 * @returns The decoded payload, or null when no QR code is present.
 */
export async function decodeQrFromVideo(
  video: HTMLVideoElement,
  inversionAttempts: 'dontInvert' | 'attemptBoth' | 'onlyInvert' = 'dontInvert',
): Promise<string | null> {
  if (video.readyState < video.HAVE_ENOUGH_DATA) return null;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  if (!canvas.width || !canvas.height) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return decodeQrFromImageData(imageData, inversionAttempts);
}
