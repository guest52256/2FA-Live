import { ShieldCheckIcon, ZapIcon } from '../Icons';
import { FingerprintIcon } from '../Icons';

const FEATURES = [
  {
    id: 'what-is-2fa',
    icon: <FingerprintIcon className="w-6 h-6 text-brand-neon" />,
    iconWrapper: 'bg-brand-neon/10',
    title: 'What is 2FA?',
    body: (
      <>
        2FA is a web-based <strong>2FA Authenticator</strong> that generates Time-based One-Time
        Passwords (TOTP). It serves as a direct alternative to mobile apps like{' '}
        <a
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-neon hover:text-white transition-colors"
        >
          Google Authenticator
        </a>{' '}
        or{' '}
        <a
          href="https://authy.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-neon hover:text-white transition-colors"
        >
          Authy
        </a>
        , right in your browser.
      </>
    ),
  },
  {
    id: 'zero-knowledge',
    icon: <ShieldCheckIcon className="w-6 h-6 text-brand-accent" />,
    iconWrapper: 'bg-brand-accent/10',
    title: 'Zero-Knowledge Architecture',
    body: (
      <>
        Security is paramount. The <strong>2FA auth code</strong> generation happens 100% locally via
        Javascript&apos;s Web Crypto API. We do not store, log, or track your secret keys. Your data
        remains completely private.
      </>
    ),
  },
  {
    id: 'lightning-fast',
    icon: <ZapIcon className="w-6 h-6 text-blue-400" />,
    iconWrapper: 'bg-blue-500/10',
    title: 'Lightning Fast',
    body: (
      <>
        Whether you are pasting a setup key or scanning a <strong>QR code</strong>, 2FA calculates your
        secure tokens instantaneously. Never miss a login window waiting for your phone again.
      </>
    ),
  },
];

/**
 * The three "Unlock the Future of Security" feature cards.
 *
 * @returns The feature grid.
 */
export function FeatureCards() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white">Unlock the Future of Security</h2>
        <div className="w-20 h-1 bg-brand-neon mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {FEATURES.map((feature) => (
          <div key={feature.id} className="glass-card p-6 sm:p-8 rounded-2xl">
            <div
              className={`w-12 h-12 rounded-full ${feature.iconWrapper} flex items-center justify-center mb-6`}
            >
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{feature.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
