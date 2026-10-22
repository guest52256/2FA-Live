/**
 * The "How does 2FA Authentication work?" explainer card.
 *
 * @returns The explainer element.
 */
export function HowItWorks() {
  return (
    <div className="mt-12 sm:mt-16 glass-card p-6 sm:p-8 md:p-12 rounded-3xl border border-brand-border">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
        How does 2FA Authentication work?
      </h3>

      <img
        src="/how-2fa-works.svg"
        alt="How 2FA Authentication Works"
        width={1024}
        height={572}
        className="w-full rounded-2xl mb-6 border border-brand-border/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      />

      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          Think of Two-Factor Authentication (or <strong>2FA</strong> for short) as an extra lock on
          your digital front door. Usually, websites only ask for one thing to let you in: a password.
          But passwords aren&apos;t perfect. They can be guessed, stolen by hackers, or accidentally
          given away in phishing scams. 2FA fixes this by asking for a second piece of proof to make
          sure it&apos;s really you.
        </p>
        <p>
          When you turn on 2FA, websites ask for something you <em>have</em> in addition to your
          password. Our <strong>2FA live authenticator</strong> handles this by sharing a secret setup
          key with the website. Using this secret key and the exact current time, both the website and
          our tool generate the exact same 6-digit <strong>TOTP code</strong> (Time-Based One-Time
          Password). This secure code changes every 30 seconds. Because it expires so fast, even if a
          hacker steals your code right now, it will be completely useless to them a minute later!
        </p>
      </div>
    </div>
  );
}
