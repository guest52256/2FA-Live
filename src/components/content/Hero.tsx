/**
 * The hero block below the tool card.
 *
 * @returns The hero element.
 */
export function Hero() {
  return (
    <div
      className="text-center mt-12 mb-4 max-w-3xl mx-auto slide-up"
      style={{ animationDelay: '0.2s' }}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Generate{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-brand-accent">
          2FA Tokens
        </span>{' '}
        Instantly
      </h1>
      <p className="text-slate-300 text-lg md:text-xl font-medium mb-4">
        Your fast, free, and secure alternative to mobile authenticator apps.
      </p>
      <p className="text-slate-400 text-base md:text-lg leading-relaxed">
        Protect your online accounts easily without reaching for your phone. Whether you lost your
        device or simply prefer a desktop solution, our online two-factor authentication (TOTP) tool
        creates your 6-digit login codes in real-time. Everything is processed entirely inside your
        own browser—meaning your secret keys are{' '}
        <strong>never saved, shared, or sent to any servers</strong>. No sign-ups, no tracking, just
        instant security you can trust.
      </p>
    </div>
  );
}
