import { useEffect, useState } from 'react';

import { formatToken, generateTOTP, getCounter, type TotpOptions } from '../lib/totp';
import { useNow } from './useTotp';

/**
 * Generate live codes for a list of secrets (used by the "Recent Keys" panel).
 *
 * @param secrets The secrets to generate codes for.
 * @param options Digit / period / algorithm overrides.
 * @returns A map of secret -> formatted code.
 */
export function useTokenMap(
  secrets: string[],
  options: TotpOptions = {},
): Record<string, string> {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const now = useNow(1000);
  const period = options.period ?? 30;

  const counter = getCounter(now, period);
  const key = secrets.join('|');

  useEffect(() => {
    if (secrets.length === 0) {
      setCodes({});
      return;
    }

    let cancelled = false;
    void Promise.all(
      secrets.map(async (secret) => {
        const code = await generateTOTP(secret, now, { ...options, period });
        return [secret, formatToken(code)] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setCodes(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, counter, period, options.algorithm, options.digits]);

  return codes;
}
