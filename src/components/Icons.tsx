import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

/** Logo mark — the fingerprint glyph used in the header. */
export function FingerprintIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  );
}

/** Generic user silhouette for the account dropdown. */
export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** Arrow entering a door — the "Login" menu item. */
export function LoginIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

/** Person with a plus sign — the "Register" menu item. */
export function UserPlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

/** Cross — used for the clear-secret button and modal dismissals. */
export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/** Clipboard — the "Paste Key" button. */
export function ClipboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

/** Camera — the "Scan QR" button. */
export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** Upload arrow — the QR-image upload button. */
export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

/** Information circle — the privacy note. */
export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** Padlock — the history entries. */
export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/** Lightning bolt — the "Active Token" heading and the "Lightning Fast" card. */
export function ZapIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

/** Shield with a checkmark — the "Zero-Knowledge Architecture" card. */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

/** Checkmark — bullet lists. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Copy / duplicate glyph on the "Copy Code" button. */
export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

/** Shield — the administrator badge in the header and the admin panel. */
export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5C8 19.2 5 15.5 5 11V6l7-3z" />
    </svg>
  );
}
