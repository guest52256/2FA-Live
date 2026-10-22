import { useCallback, useEffect, useRef, useState } from 'react';

import { CameraIcon, XIcon } from '../Icons';
import { decodeQrFromVideo } from '../../lib/qr';

interface CameraScannerProps {
  /** Whether the scanner is open. */
  open: boolean;
  /** Close the scanner. */
  onClose: () => void;
  /** Called with the decoded QR payload. */
  onResult: (data: string) => void;
  /** Called when the camera cannot be started. */
  onError: (message: string) => void;
}

const SCAN_INTERVAL_MS = 300;

/**
 * Live QR-code scanner backed by the device camera.
 *
 * Uses `getUserMedia` with the rear-facing camera and decodes frames with
 * jsQR. The video never leaves the device.
 *
 * @param props Component props.
 * @returns The scanner element (or null when closed).
 */
export function CameraScanner({ open, onClose, onResult, onError }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const close = useCallback(() => {
    stopStream();
    onClose();
  }, [stopStream, onClose]);

  // Start / stop the camera with the modal lifecycle.
  useEffect(() => {
    if (!open) {
      stopStream();
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        onError('Camera unavailable. Try uploading an image.');
        onClose();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          try {
            await video.play();
          } catch {
            /* Autoplay restrictions — the muted+playsinline attributes usually cover this. */
          }
        }

        setStatus('ready');

        intervalRef.current = setInterval(() => {
          const element = videoRef.current;
          if (!element) return;

          void decodeQrFromVideo(element).then((data) => {
            if (data) {
              close();
              onResult(data);
            }
          });
        }, SCAN_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        setStatus('error');
        onError('Camera unavailable. Try uploading an image.');
        onClose();
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes the scanner.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      id="camera-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR Code"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/95 backdrop-blur-sm transition-opacity duration-300"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        id="camera-modal-content"
        className="relative w-full max-w-lg mx-4 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl transform scale-100 transition-transform duration-300"
      >
        <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-dark/50">
          <h3 className="text-white font-bold flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-brand-neon" />
            Scan QR Code
          </h3>
          <button
            type="button"
            onClick={close}
            aria-label="Close scanner"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="relative bg-black h-64 sm:h-80 flex items-center justify-center overflow-hidden">
          <video ref={videoRef} id="video-feed" className="absolute inset-0 w-full h-full object-cover" playsInline muted />

          {/* Scanner Reticle */}
          <div className="absolute inset-0 m-12 border-2 border-brand-neon/50 rounded-xl pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-[2px] bg-brand-neon shadow-[0_0_15px_#00F0FF] absolute top-1/2 transform -translate-y-1/2 animate-[float_2s_ease-in-out_infinite]" />
          </div>

          <div
            id="camera-loader"
            className={`text-brand-neon font-mono text-sm animate-pulse z-0 flex flex-col items-center gap-3 ${
              status === 'ready' ? 'hidden' : ''
            }`}
          >
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Accessing Camera...
          </div>
        </div>

        <div className="p-4 bg-brand-dark/50 border-t border-brand-border text-center">
          <p className="text-sm text-slate-400">Position the 2FA QR code within the frame.</p>
        </div>
      </div>
    </div>
  );
}
