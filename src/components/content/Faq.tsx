const FAQS = [
  {
    question: 'Is this tool safe to use?',
    answer: (
      <>
        Yes. The 2FA Live tool operates on a zero-knowledge, client-side architecture. When you paste
        a key or scan a QR code, it never leaves your browser. All cryptographic operations to
        generate the <strong>2FA tokens</strong> are handled entirely by your local device.
      </>
    ),
  },
  {
    question: 'Can I use this offline?',
    answer: (
      <>
        Absolutely. Once the web page is fully loaded, you can disconnect from the internet. The TOTP
        generator relies on your device&apos;s system clock and local Javascript, not an active internet
        connection, making it an incredibly secure <strong>authenticator online</strong>.
      </>
    ),
  },
  {
    question: 'Why is my code being rejected?',
    answer: (
      <>
        Because TOTP codes are inherently time-based, your device&apos;s clock must be accurately
        synchronized. If your computer or phone&apos;s clock is off by even a minute, the generated{' '}
        <strong>2FA code</strong> will be invalid. Please ensure your system time is set to sync
        automatically via the internet.
      </>
    ),
  },
];

/**
 * The "Frequently Asked Questions" card.
 *
 * @returns The FAQ element.
 */
export function Faq() {
  return (
    <div className="glass-card p-6 sm:p-8 md:p-12 rounded-3xl border border-brand-border">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {FAQS.map((faq) => (
          <div key={faq.question}>
            <h4 className="font-bold text-white text-base mb-1">{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
