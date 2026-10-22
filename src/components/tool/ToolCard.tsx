import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CameraScanner } from './CameraScanner';
import { HistoryPanel } from './HistoryPanel';
import { SecretInput } from './SecretInput';
import { CopyCodeButton, TokenDisplay } from './TokenDisplay';
import { TimerBar } from './TimerBar';
import { InfoIcon } from '../Icons';
import { useHistory } from '../../hooks/useHistory';
import { useToast } from '../../hooks/useToast';
import { useTokenMap } from '../../hooks/useTokenMap';
import { useTotp } from '../../hooks/useTotp';
import { parseOtpAuth } from '../../lib/otpauth';
import { decodeQrFromImageData } from '../../lib/qr';
import { normalizeSecret, validateSecret } from '../../lib/validation';
import { copyToClipboard, readFromClipboard } from '../../lib/utils';
import type { TotpAlgorithm } from '../../lib/totp';

/** Delay before a typed secret is written to the local cache. */
const HISTORY_DEBOUNCE_MS = 300;

interface ToolCardProps {
  /** Called when a secret should be loaded into the tool (e.g. from history). */
  onRequestScrollTop?: () => void;
}

/**
 * The main tool card: secret input on the left, live token on the right.
 *
 * All processing happens in the browser — the secret is never transmitted.
 *
 * @param props Component props.
 * @returns The tool card.
 */
export function ToolCard({ onRequestScrollTop }: ToolCardProps) {
  const { showToast } = useToast();
  const { history, remember, forget } = useHistory();

  const [rawInput, setRawInput] = useState('');
  const [activeSecret, setActiveSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<TotpAlgorithm>('SHA-1');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [scannerOpen, setScannerOpen] = useState(false);

  const totpOptions = useMemo(() => ({ algorithm, digits, period }), [algorithm, digits, period]);
  const { code, rawCode, remaining } = useTotp(activeSecret, totpOptions);
  const historyCodes = useTokenMap(history, totpOptions);

  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flush a pending history write when the component unmounts.
  useEffect(
    () => () => {
      if (historyTimer.current) clearTimeout(historyTimer.current);
    },
    [],
  );

  /**
   * Apply a raw secret: validate it, activate it and schedule the local cache
   * write.
   */
  const applySecret = useCallback(
    (secret: string, options?: { remember?: boolean }) => {
      const normalized = normalizeSecret(secret);
      const validation = validateSecret(normalized);

      if (normalized.length === 0) {
        setActiveSecret(null);
        setError(null);
        return;
      }

      if (!validation.valid) {
        setActiveSecret(null);
        setError(validation.message);
        return;
      }

      setActiveSecret(normalized);
      setError(null);

      if (options?.remember === false) return;

      // Debounced so that typing a key does not leave a trail of prefixes in
      // the local cache.
      if (historyTimer.current) clearTimeout(historyTimer.current);
      historyTimer.current = setTimeout(() => remember(normalized), HISTORY_DEBOUNCE_MS);
    },
    [remember],
  );

  const handleInput = useCallback(
    (value: string) => {
      setRawInput(value);
      applySecret(value);
    },
    [applySecret],
  );

  const handleClear = useCallback(() => {
    setRawInput('');
    applySecret('');
    setRawInput('');
  }, [applySecret]);

  /** Extract the secret from a raw string (plain secret or `otpauth://` URI). */
  const processExtractedData = useCallback(
    (data: string) => {
      const payload = parseOtpAuth(data);
      setRawInput(payload.secret);
      applySecret(payload.secret);

      if (payload.isUri) {
        setAlgorithm(payload.algorithm);
        setDigits(payload.digits);
        setPeriod(payload.period);
      }
    },
    [applySecret],
  );

  const handlePaste = useCallback(async () => {
    const text = await readFromClipboard();
    if (text === null) {
      showToast('Clipboard access denied. Please use Ctrl+V / Cmd+V', 'error');
      return;
    }
    if (text) {
      processExtractedData(text);
      showToast('Key pasted from clipboard');
    }
  }, [processExtractedData, showToast]);

  const handleCopy = useCallback(async () => {
    if (!activeSecret || !rawCode) {
      showToast('No code to copy', 'error');
      return;
    }
    const ok = await copyToClipboard(rawCode);
    showToast(ok ? 'Code copied to clipboard!' : 'Could not copy the code', ok ? 'success' : 'error');
  }, [activeSecret, rawCode, showToast]);

  const handleUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            showToast('No valid QR code found in image.', 'error');
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          void decodeQrFromImageData(imageData).then((data) => {
            if (data) {
              processExtractedData(data);
              showToast('QR Code recognized!');
            } else {
              showToast('No valid QR code found in image.', 'error');
            }
          });
        };
        img.onerror = () => showToast('No valid QR code found in image.', 'error');
        img.src = String(event.target?.result ?? '');
      };
      reader.onerror = () => showToast('No valid QR code found in image.', 'error');
      reader.readAsDataURL(file);
    },
    [processExtractedData, showToast],
  );

  const handleScanResult = useCallback(
    (data: string) => {
      processExtractedData(data);
      showToast('QR Code successfully scanned!');
    },
    [processExtractedData, showToast],
  );

  const handleSelectHistory = useCallback(
    (secret: string) => {
      setRawInput(secret);
      applySecret(secret, { remember: false });
      onRequestScrollTop?.();
    },
    [applySecret, onRequestScrollTop],
  );

  const handleClearHistory = useCallback(() => {
    forget();
    showToast('Local cache cleared');
  }, [forget, showToast]);

  return (
    <>
      <div className="w-full max-w-5xl glass-card rounded-3xl overflow-hidden shadow-2xl slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          <SecretInput
            value={rawInput}
            onChange={handleInput}
            error={error}
            onPaste={handlePaste}
            onScan={() => setScannerOpen(true)}
            onUpload={handleUpload}
            onClear={handleClear}
          />

          {/* Right: Output Display (2 cols) */}
          <div className="lg:col-span-2 bg-gradient-to-b from-brand-card to-brand-dark p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

            <div className="relative z-10 flex flex-col items-center w-full">
              <TimerBar remaining={remaining} period={period} />

              <TokenDisplay code={code} />

              <CopyCodeButton hasCode={Boolean(rawCode)} onCopy={handleCopy} />

              <div style={{ height: '20px' }} />

              <div className="mt-6 p-4 rounded-xl bg-brand-dark/40 border border-brand-border/50 flex items-start gap-3 w-full text-left">
                <InfoIcon className="w-5 h-5 text-brand-neon shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your keys are processed entirely within your web browser. No data is ever sent to our
                  servers. To verify, you can disconnect from the internet after loading this page.
                </p>
              </div>

              <HistoryPanel
                secrets={history}
                codes={historyCodes}
                onSelect={handleSelectHistory}
                onClear={handleClearHistory}
              />
            </div>
          </div>
        </div>
      </div>

      <CameraScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onResult={handleScanResult}
        onError={(message) => showToast(message, 'error')}
      />
    </>
  );
}
