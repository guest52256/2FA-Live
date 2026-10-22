/**
 * Copy for the footer / header modals.
 *
 * The wording mirrors the source project's observable modal content.
 */

export interface LegalDocument {
  /** Stable identifier used as the modal key. */
  id: string;
  /** Modal heading. */
  title: string;
  /** Modal body, as a list of paragraphs / headings. */
  body: Array<{ type: 'p' | 'h4'; content: string }>;
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'about-modal',
    title: 'About Us',
    body: [
      {
        type: 'p',
        content:
          "Hey there! Welcome to <strong>2FA Live</strong>. We built this tool because we believe securing your online accounts shouldn't mean being chained to your smartphone. We wanted a fast, beautiful, and completely private way to generate two-factor authentication codes directly from a web browser.",
      },
      {
        type: 'p',
        content:
          'Our promise to you is simple: <strong>your security keys stay yours.</strong> We never see them, save them, or send them to any servers.',
      },
    ],
  },
  {
    id: 'contact-modal',
    title: 'Contact Us',
    body: [
      {
        type: 'p',
        content:
          "Need some help or want to share feedback? We'd love to hear from you! Since this is a free, privacy-focused tool, we don't have a massive support team, but you can reach out to us anytime at <span class=\"text-brand-neon font-mono\">support@2fa.co.com</span>.",
      },
      {
        type: 'p',
        content:
          'Important Rule: NEVER share your secret 2FA keys with anyone in an email, not even us!',
      },
    ],
  },
  {
    id: 'privacy-modal',
    title: 'Privacy Policy',
    body: [
      {
        type: 'p',
        content:
          "We take your privacy very seriously. In fact, our system is built so that we couldn't spy on you even if we wanted to.",
      },
      { type: 'h4', content: '1. Everything stays on your device' },
      {
        type: 'p',
        content:
          'When you paste a key or scan a QR code, all the math happens right inside your own browser. No data ever travels across the internet to our servers.',
      },
      { type: 'h4', content: '2. No tracking, no databases' },
      {
        type: 'p',
        content:
          "We don't save your secret keys, we don't use sneaky tracking cookies, and we don't know who you are. Once you close your browser tab, your active session data is wiped clean forever.",
      },
    ],
  },
  {
    id: 'disclaimer-modal',
    title: 'Disclaimer',
    body: [
      {
        type: 'p',
        content:
          'Just a quick heads-up: We provide this tool for free "as is" to help you manage your 2FA codes.',
      },
      {
        type: 'p',
        content:
          'While we have engineered it to be as safe, private, and reliable as possible, <strong>you are ultimately responsible for keeping your backup codes and secret setup keys safe.</strong>',
      },
      {
        type: 'p',
        content:
          'We cannot be held responsible if you lose access to your accounts. Please always keep a secure, offline backup of your original setup keys!',
      },
    ],
  },
  {
    id: 'terms-modal',
    title: 'Terms & Conditions',
    body: [
      {
        type: 'p',
        content: 'By using 2FA Live, you agree to a few simple ground rules.',
      },
      {
        type: 'p',
        content:
          "You are absolutely welcome to use this tool to protect your personal or work accounts. However, please do not use our site for anything illegal, and do not use it to try to access accounts that don't belong to you.",
      },
      {
        type: 'p',
        content:
          "We reserve the right to update these terms as the web evolves, but our core commitment to your absolute privacy and security will never change.",
      },
    ],
  },
];
