/**
 * The "Why Choose a Browser-Based 2FA Authenticator?" card.
 *
 * @returns The card element.
 */
export function WhyBrowser() {
  return (
    <div className="glass-card p-6 sm:p-8 md:p-12 rounded-3xl border border-brand-border">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
        Why Choose a Browser-Based 2FA Authenticator?
      </h3>
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          In today&apos;s digital landscape, securing your accounts with{' '}
          <strong>Two-Factor Authentication (2FA)</strong> is no longer optional; it&apos;s a
          necessity. While traditional mobile apps like{' '}
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-neon hover:text-white transition-colors"
          >
            Google Authenticator
          </a>
          ,{' '}
          <a
            href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-neon hover:text-white transition-colors"
          >
            Microsoft Authenticator
          </a>
          , or{' '}
          <a
            href="https://authy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-neon hover:text-white transition-colors"
          >
            Authy
          </a>{' '}
          are popular, they tie your security to a single physical device. If you lose your phone, you
          risk losing access to your accounts.
        </p>
        <p>
          Our <strong>browser-based 2FA TOTP generator</strong> solves this by allowing you to
          generate your <strong>2FA auth code</strong> directly from any device—desktop, laptop,
          tablet, or smartphone—without installing any apps. By storing your backup secret keys
          securely (such as in an encrypted password manager) and using our live tool to generate the
          time-based tokens, you gain unmatched flexibility and resilience.
        </p>
      </div>
    </div>
  );
}
