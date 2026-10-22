const STEPS = [
  {
    title: 'Obtain your Secret Key:',
    body: (
      <>
        When enabling Two-Factor Authentication on platforms like Discord, Github, or Crypto
        exchanges, choose &quot;Authenticator App&quot;. If a QR code appears, look for an option to view
        the text-based setup key.
      </>
    ),
  },
  {
    title: 'Input the Key:',
    body: (
      <>
        Paste the Base32 formatted secret (e.g., JBSWY3DPEHPK3PXP) into the text area above.
        Alternatively, use your webcam to scan the provided QR code.
      </>
    ),
  },
  {
    title: 'Retrieve your TOTP:',
    body: (
      <>
        2FA will instantly calculate your 6-digit live token. Click the copy button and paste it into
        the service to complete your login.
      </>
    ),
  },
];

/**
 * The numbered "How to use the 2FA Live Generator" walkthrough.
 *
 * @returns The steps element.
 */
export function HowToUse() {
  return (
    <div
      className="mt-12 sm:mt-16 glass-card p-6 sm:p-8 md:p-12 rounded-3xl border border-brand-border"
      id="features"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
        How to use the 2FA Live Generator
      </h3>
      <ul className="space-y-4 text-slate-300">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-neon text-black font-bold flex items-center justify-center text-sm">
              {index + 1}
            </span>
            <p>
              <strong>{step.title}</strong> {step.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
