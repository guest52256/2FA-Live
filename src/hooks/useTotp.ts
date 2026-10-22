import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PERIOD,
  formatToken,
  generateTOTP,
  getCounter,
  getRemainingSeconds,
  type TotpOptions,
} from '../lib/totp';

export interface UseTotpResult {
  /** Formatted code (`123 456`) or an empty string when there is no secret. */
  code: string;
  /** Raw digits (`123456`). */
  rawCode: string;
  /** Seconds left in the current time window. */
  remaining: number;
  /** Length of the time window in seconds. */
  period: number;
  /** Fraction of the window already elapsed, 0..1. */
  progress: number;
}

/**
 * A clock that re-renders once per second.
 *
 * @returns The current Unix timestamp in milliseconds.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/**
 * Generate a live TOTP code that refreshes on every time-step boundary.
 *
 * @param secret The Base32 secret, or null/empty when there is nothing to show.
 * @param options Digit / period / algorithm overrides.
 * @returns The current code plus the countdown state.
 */
export function useTotp(secret: string | null, options: TotpOptions = {}): UseTotpResult {
  const period = options.period ?? DEFAULT_PERIOD;
  const now = useNow(1000);

  const counter = useMemo(
    () => (secret ? getCounter(now, period) : null),
    [secret, now, period],
  );

  const [rawCode, setRawCode] = useState('');

  useEffect(() => {
    if (!secret || counter === null) {
      setRawCode('');
      return;
    }

    let cancelled = false;
    void generateTOTP(secret, now, { ...options, period }).then((code) => {
      if (!cancelled) setRawCode(code);
    });

    return () => {
      cancelled = true;
    };
    // `now` is intentionally only a trigger — the code is recomputed per step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, counter, period, options.algorithm, options.digits]);

  const remaining = getRemainingSeconds(now, period);
  const progress = (period - remaining) / period;

  return {
    code: rawCode ? formatToken(rawCode) : '',
    rawCode,
    remaining,
    period,
    progress,
  };
}
