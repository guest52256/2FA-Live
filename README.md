# 2FA Live Code — client-side TOTP generator

A faithful, fully working reproduction of **https://2fa.co.com/** (a one-page,
browser-based TOTP / 2FA authenticator), rebuilt from scratch with React 19 +
TypeScript + Vite — plus an **optional account layer** (sign-up, login, log-out
and an administration panel) backed by **Firebase**, and a **GitHub Pages**
deployment pipeline.

Everything the token generator does happens **in the browser**: the secret key is
never transmitted, and the only persistence is `localStorage` in the user's own
browser. The account layer is strictly optional — without a Firebase
configuration the app still boots and the tool keeps working.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Production build and preview:

```bash
npm run build        # type-check + bundle into dist/
npm run preview      # serve dist/ on http://localhost:4173
```

There is **no backend** and **no environment variable is required** for the
token generator — see [`.env.example`](./.env.example) if you want to enable
the account layer.

---

## Scripts

| Script                  | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Vite dev server with HMR.                                           |
| `npm run build`         | `tsc --noEmit` + production bundle into `dist/`.                     |
| `npm run preview`       | Serves the production build (used by the Playwright suite).         |
| `npm run typecheck`     | TypeScript only, no emit.                                           |
| `npm run test`          | Vitest unit + component suite (jsdom).                              |
| `npm run test:watch`    | Vitest in watch mode.                                               |
| `npm run test:coverage` | Vitest with V8 coverage.                                            |
| `npm run test:e2e`      | Playwright end-to-end suite (builds are reused, see below).          |
| `npm run test:e2e:ui`   | Playwright in interactive UI mode.                                  |
| `npm run verify`        | `typecheck` → `test` → `build`, the single "is it green?" command.   |

### Running the E2E suite

```bash
npx playwright install chromium   # one-time browser download
npm run build                     # the suite runs against the built bundle
npm run test:e2e
```

The Playwright config starts `vite preview` on port 4173 automatically and
reuses an already-running server if one is present.

If the Playwright CDN is unreachable on your network, drive the browser that is
already installed on the machine instead:

```bash
PW_CHANNEL=chrome npx playwright test      # Windows / macOS
PW_CHANNEL=msedge npx playwright test      # Windows
```

---

## What the app does

The source site is a single WordPress page. The clone reproduces it as a
client-side React application and adds the account layer on top:

| Route         | Behaviour                                                            |
| ------------- | -------------------------------------------------------------------- |
| `/`           | The tool + all informational content (the only real page of the source). |
| `/login-page` | **Sign-in page** (the source server answers with a 302 to `/#features`). |
| `/register`   | **Registration page** (same as above).                                |
| `/admin`      | **Administration panel** — administrators only, anonymous visitors are redirected to `/login-page`. |
| anything else | Themed 404 page (the source serves its theme's 404 template).        |

### Feature matrix

| # | Feature                          | Status in the clone                                   | How it was verified                         |
| - | -------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| 1 | Secret input + live TOTP code    | Implemented                                            | RFC 6238 vectors, unit + E2E               |
| 2 | 30-second countdown              | Implemented (`period - (epoch % period)`)              | Unit test + E2E against the source formula  |
| 3 | Draining progress bar             | Implemented (`remaining / period * 100%`)              | Unit + E2E                                 |
| 4 | Copy code button + toast         | Implemented (`Code copied to clipboard!`)               | Unit + E2E (real clipboard)                 |
| 5 | "No code to copy" guard          | Implemented                                            | Unit + E2E                                 |
| 6 | Paste key from clipboard         | Implemented (`Key pasted from clipboard`)               | Unit + E2E                                 |
| 7 | Clipboard-permission error toast | Implemented (`Clipboard access denied…`)                | Unit test                                  |
| 8 | Scan QR with the camera          | Implemented (`jsQR` over `getUserMedia`)               | E2E with a fake media device                |
| 9 | Upload a QR image                | Implemented (`jsQR` over a canvas)                     | E2E with generated QR fixtures              |
| 10 | "QR Code recognized!" toast      | Implemented                                             | Unit + E2E                                 |
| 11 | "No valid QR code found in image."| Implemented                                             | Unit + E2E                                 |
| 12 | "Camera unavailable…" toast      | Implemented                                             | Unit test                                  |
| 13 | Local cache (max 3 keys)         | Implemented (`localStorage["2fa_history"]`)             | Unit + E2E                                 |
| 14 | Masked secrets (first4 + last4)  | Implemented (`JBSW •••• 3PXP`)                          | Unit + E2E                                 |
| 15 | "Local cache cleared" toast      | Implemented                                             | Unit + E2E                                 |
| 16 | Validation badges                | Implemented (`Key too short`, `Invalid Characters`)     | Unit + E2E                                 |
| 17 | `otpauth://` URI parsing         | Implemented (secret + issuer + digits/period/algorithm) | Unit + E2E                                 |
| 18 | Header, hero, education sections | Implemented (source layout, original copy)              | Manual visual comparison                    |
| 19 | Footer + legal modals            | Implemented (About Us / Contact Us / Privacy Policy / Disclaimer / Terms & Conditions) | Unit + E2E      |
| 20 | Dark, glassmorphic theme         | Implemented (exact source Tailwind tokens)              | Manual visual comparison                    |
| 21 | Responsive layout (mobile)       | Implemented                                             | E2E on a Pixel 7 viewport                  |
| 22 | **Sign up** (`/register`)         | Implemented (Firebase Auth + Firestore profile)         | Unit + E2E                                 |
| 23 | **Login** (`/login-page`)         | Implemented (Firebase Auth, redirect to the origin)     | Unit + E2E                                 |
| 24 | **Log out** (header account menu) | Implemented (Firebase Auth `signOut`)                   | Unit + E2E                                 |
| 25 | **Admin panel** (`/admin`)        | Implemented (stats, user table, role management, audit trail) | Unit                                |
| 26 | Route guard for the admin panel  | Implemented (anonymous → `/login-page`, non-admin → 403) | Unit + E2E                              |
| 27 | Firestore security rules         | Provided (`firestore.rules`)                            | Reviewed, `firebase deploy --only firestore:rules` |
| 28 | GitHub Pages deployment           | Provided (`.github/workflows/deploy.yml` + SPA fallback)| Build check of `dist/404.html`             |
| 29 | AdSense / Google Analytics       | **Deliberately omitted** (third-party tracking)          | n/a                                        |
| 30 | Proprietary diagram (`2fa-code.webp`) | Replaced with an **original SVG** (`public/how-2fa-works.svg`) | Original artwork, same aspect ratio |

---

## Architecture

```
src/
  App.tsx                     Router + hash-scrolling shell
  main.tsx                    React root (BrowserRouter, StrictMode, SPA-redirect restore)
  index.css                   Source-faithful custom CSS (glass card, token glow, …)
  pages/
    HomePage.tsx              Assembles header / tool / hero / education / footer / modal
    LoginPage.tsx             Sign-in form (`/login-page`)
    SignUpPage.tsx            Registration form (`/register`)
    AdminPage.tsx             Administration panel (`/admin`)
    NotFoundPage.tsx          Themed 404
  components/
    Header.tsx                Sticky header + account dropdown (login / register / log out)
    Footer.tsx                Footer with the legal-document triggers
    Modal.tsx                 Glassmorphic dialog (focus trap, Escape, scroll lock)
    Toast.tsx                 Toast host
    Icons.tsx                 Inline SVG icon set (original)
    auth/
      AuthLayout.tsx          Shared shell for the account pages
      AuthField.tsx           Labelled input with hint / error states
      FirebaseNotice.tsx      "Accounts are currently disabled" banner
      RequireAdmin.tsx        Route guard (ready → user → configured → role)
    content/                  Hero, HowItWorks, HowToUse, WhyBrowser, Faq, Compatibility
    tool/
      ToolCard.tsx            The tool card; owns the secret / options / history state
      SecretInput.tsx         Textarea + paste / scan / upload / clear controls
      TokenDisplay.tsx        Big monospace code + copy button
      TimerBar.tsx            Countdown + progress bar
      HistoryPanel.tsx        "Recent Keys (Local Cache)"
      CameraScanner.tsx       Live camera scanner modal
  hooks/
    useTotp.ts                TOTP generation + ticking timer
    useTokenMap.ts            Live codes for the cached secrets
    useHistory.ts             localStorage-backed history
    useToast.tsx              Toast context
    useAuth.tsx               AuthProvider: user, profile, signIn / signUp / signOut
  lib/
    base32.ts                 Base32 codec
    totp.ts                   RFC 4226 / RFC 6238 engine (Web Crypto)
    validation.ts             Normalisation + validation rules
    otpauth.ts                `otpauth://` URI parser
    history.ts                localStorage helpers + secret masking
    qr.ts                     Lazy `jsQR` loader (image + video)
    utils.ts                  Clipboard helpers
    auth.ts                   Firebase-free account helpers (validation, roles, errors)
    firebase.ts               Lazy Firebase bootstrap + configuration detection
    userDirectory.ts          Firestore access layer (profiles, roles, audit trail)
  content/
    legal.ts                  Modal copy (About / Contact / Privacy / Disclaimer / Terms)
```

### The crypto

`src/lib/totp.ts` implements RFC 4226 (HOTP) and RFC 6238 (TOTP) on top of the
Web Crypto API:

1. Base32-decode the shared secret.
2. Import it as an HMAC key (`SHA-1` by default).
3. Sign the 8-byte big-endian counter `floor(unixSeconds / period)`.
4. Dynamic truncation (RFC 4226 §5.3) and `mod 10^digits`.

The implementation reproduces **all six** RFC 6238 SHA-1 test vectors
(`287082`, `081804`, `050471`, `005924`, `279037`, `353130`) and matches an
independent `node:crypto` reference for 40/40 random secrets/counters.

The QR decoder (`jsQR`, ~130 kB) is **lazily imported** so it never lands in
the initial bundle. The same is true for the Firebase SDK (~580 kB across two
chunks): it is only downloaded when an account feature is actually used, and
never at all when no Firebase configuration is present. The initial JS payload
is **~335 kB (~105 kB gzipped)**.

---

## The account layer (Firebase)

The account layer is **optional and additive**. The token generator never talks
to Firebase. If no `VITE_FIREBASE_*` variables are present, the app boots
exactly as before and the account pages render a banner that says accounts are
currently disabled (the forms stay visible and interactive, they simply report
the missing configuration when submitted).

### 1. Create the Firebase project

1. <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Get started** → enable the **Email/Password**
   sign-in provider (and create the first user, or leave it to the app).
3. **Build → Firestore Database → Create database** (production or test mode —
   the shipped rules work in both).
4. **Project settings → Your apps → Web app** → copy the configuration values.

### 2. Configure the build

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```dotenv
VITE_FIREBASE_API_KEY=AIza…
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
VITE_FIREBASE_ADMIN_EMAILS=you@example.com
```

Firebase web configuration is **public by design** — it is not a secret and it
is safe to ship in a browser bundle. What must stay private are the Firestore
rules.

### 3. Deploy the Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick your project
firebase deploy --only firestore:rules
```

`firestore.rules` implements:

| Path             | Read                | Write                                                              |
| ---------------- | ------------------- | ------------------------------------------------------------------ |
| `users/{uid}`    | own profile, or any profile for admins | own profile (role may not be changed), or anything for admins |
| `meta/app`       | any signed-in user  | create: the first account may claim the `firstAdminUid` slot; update: admins only |
| `adminLogs/{id}` | admins              | create: admins; update/delete: never                               |
| everything else  | denied              | denied                                                              |

### 4. Data model

```ts
// users/{uid}
{
  uid: string;
  email: string;          // lower-cased
  displayName: string;
  role: 'admin' | 'user';
  createdAt: number;      // epoch ms
  lastLoginAt: number;    // epoch ms
  provider: string;       // 'password'
}

// meta/app
{
  firstAdminUid: string;
  firstAdminClaimedAt: number;
}

// adminLogs/{id}
{
  actorUid: string;
  actorEmail: string;
  action: 'grant-admin' | 'revoke-admin' | 'remove-account';
  targetUid?: string;
  detail?: string;
  at: number;
}
```

### 5. Who becomes an administrator?

* The **first account** created in a brand-new project is promoted to
  `admin` automatically. The claim is made in a Firestore transaction against
  `meta/app`, so exactly one account can win it.
* Every address in `VITE_FIREBASE_ADMIN_EMAILS` always holds the `admin` role,
  even if the stored profile says otherwise.
* Existing administrators can promote and demote other accounts from the admin
  panel; every change is written to the `adminLogs` audit trail.

> **Note.** Removing an account in the admin panel deletes its Firestore
> profile. The matching Firebase **Authentication** record has to be deleted
> from the Firebase console (or through a trusted backend), because a browser
> client is never allowed to delete authentication records.

---

## Deploying to GitHub Pages

The app is a static SPA, so GitHub Pages can host it as-is. Two details make
the deep links work:

1. **`base`** — a project site is served from `https://<user>.github.io/<repo>/`,
   so the bundle has to reference its assets relatively. `vite.config.ts`
   derives the base path from `VITE_BASE_URL`, or from `GITHUB_REPOSITORY` in
   CI. `BrowserRouter` is mounted with `basename={import.meta.env.BASE_URL}`.
2. **SPA fallback** — GitHub Pages has no rewrite rules, so `/login-page` would
   otherwise be answered with a 404. The build therefore emits a `404.html`
   that stores the requested URL in `sessionStorage` and redirects to
   `index.html`; `src/main.tsx` restores the original path before the router
   starts.

### Steps

1. Push the repository to GitHub.
2. **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.
3. Add the Firebase secrets (optional) under
   **Settings → Secrets and variables → Actions**:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
   `VITE_FIREBASE_ADMIN_EMAILS`.
4. Push to `main` — `.github/workflows/deploy.yml` type-checks, runs the unit
   tests, builds with `VITE_BASE_URL=/<repo>/` and publishes the artefact.

The workflow also runs on `workflow_dispatch`, so you can re-deploy from the
Actions tab without pushing.

To check the fallback locally:

```bash
VITE_BASE_URL=/my-repo/ npm run build
cat dist/404.html        # the base path is baked in
```

---

## Testing

| Suite                        | Tooling                          | Count | Result        |
| ---------------------------- | -------------------------------- | ----- | ------------- |
| Unit + component             | Vitest + Testing Library (jsdom) | 113   | **113 passing** |
| End-to-end                   | Playwright (Chromium, desktop 1440×900 + mobile Pixel 7) | 42 cases → 84 runs | **79 passing, 5 skipped** |

Run everything:

```bash
npm run verify   # typecheck + unit tests + production build
npm run test:e2e # end-to-end (requires a prior `npm run build`)
```

The E2E suite asserts the generated code against an **independent**
`node:crypto` TOTP implementation (`e2e/reference-totp.ts`) rather than
against the app's own code, and tolerates the ±1 step race between the
browser clock and the Node clock.

The five skipped E2E cases are the header-navigation checks on the mobile
viewport: the source hides `How it works` / `Features` / `Privacy` below the
640px breakpoint (`hidden sm:flex`), so those elements do not exist there.

---

## Intentional deviations from the source

These are the only behavioural differences from https://2fa.co.com/. Each one is
deliberate.

1. **Pinch-zoom stays enabled.** The source uses
   `maximum-scale=1.0, user-scalable=no`, which blocks browser zoom and
   violates WCAG 1.4.4 / 1.4.10. This clone uses
   `width=device-width, initial-scale=1.0`.
2. **The local cache write is debounced by 300 ms.** The source writes on every
   keystroke, which leaves up to three near-identical prefixes of the same key
   in the cache. This clone writes once the typing stops, so the cache holds
   the key you actually meant to use.
3. **`otpauth://` parameters are honoured.** The source extracts only `secret`
   and ignores the rest; this clone also reads `digits`, `period` and
   `algorithm`. The defaults are unchanged (SHA-1 / 6 digits / 30 s).
4. **The modal is accessible.** The source modal has no ARIA semantics; this
   clone adds `role="dialog"`, `aria-modal`, a focus trap, focus restoration
   on close, Escape-to-close and a body scroll lock.
5. **The HOTP counter is written as a true 64-bit value.** The source
   truncates the moving factor to the low 32 bits; this clone writes the full
   64-bit counter, as RFC 4226 §5.1 requires.
6. **No third-party tracking.** The source loads Google AdSense and Google
   Analytics; this clone loads neither. Google Fonts are still loaded, exactly
   as on the source, but can be self-hosted if you prefer zero external
   requests.
7. **Original artwork.** The proprietary `2fa-code.webp` diagram is replaced by
   an original SVG (`public/how-2fa-works.svg`) with the same purpose and
   aspect ratio. `public/favicon.svg` and `public/og-image.svg` are also
   original.
8. **`/login-page` and `/register` are real pages.** The source server answers
   both with a 302 to `/#features`. Since this deployment needs working
   sign-up / login / log-out and an administration panel, both routes render
   functional pages instead, and `/admin` was added.

---

## Legal / attribution

* The **observable behaviour** of https://2fa.co.com/ is reproduced.
* No source code, image, font file or copy was taken from the site. The theme
  markup was re-implemented in React; all iconography and the "how 2FA works"
  diagram are original drawings in this repository.
* The copy in the modals and the informational sections was rewritten in
  original wording that conveys the same information.
* "2FA Live Code" / "2FA Live" and the `2fa.co.com` domain are trademarks of
  their owner. This repository is an independent, non-commercial reproduction
  built for study and testing; it is not affiliated with or endorsed by the
  operator of the original site.

## License

MIT — see the `license` field in `package.json`.
