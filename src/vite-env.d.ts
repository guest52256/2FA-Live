/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Firebase web configuration (safe to expose — Firebase keys are public by design). */
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /**
   * Comma-separated list of e-mail addresses that are always granted the
   * `admin` role, no matter what the Firestore profile says.
   */
  readonly VITE_FIREBASE_ADMIN_EMAILS?: string;
  /**
   * Base path the app is served from (e.g. `/my-repo/` on GitHub Pages).
   * Defaults to `/`.
   */
  readonly VITE_BASE_URL?: string;
  /** Set to `1` to enable the verbose debug overlay. */
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
