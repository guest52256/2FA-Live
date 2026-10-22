import { CheckIcon } from '../Icons';

const COMPATIBILITY = [
  'Crypto Exchanges',
  'Social Media (X, Meta)',
  'Dev Tools (GitHub)',
  'Gaming (Discord, Steam)',
  'Email Providers',
  'Financial Institutions',
];

/**
 * The "Universal Compatibility" card.
 *
 * @returns The card element.
 */
export function Compatibility() {
  return (
    <div className="glass-card p-6 sm:p-8 md:p-12 rounded-3xl border border-brand-border">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Universal Compatibility</h3>
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          The 2FA Live generator uses the universally accepted RFC 6238 standard for Time-Based
          One-Time Passwords (TOTP). This means it is a fully compatible alternative to any service
          that supports standard authenticator apps. You can use this tool to secure your accounts on:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {COMPATIBILITY.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-brand-neon shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
