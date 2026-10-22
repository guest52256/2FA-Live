import { Link } from 'react-router-dom';

import { FingerprintIcon } from '../components/Icons';

/**
 * The 404 page.
 *
 * The source project (WordPress) serves its theme's 404 template for unknown
 * URLs; this is a themed equivalent.
 *
 * @returns The not-found page element.
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-neon to-brand-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-6">
        <FingerprintIcon className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">404</h1>
      <p className="text-slate-400 text-base md:text-lg mb-8 max-w-md">
        This page does not exist. The tool itself lives on the home page.
      </p>

      <Link
        to="/"
        className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-neon to-brand-accent rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:-translate-y-1 active:translate-y-0"
      >
        Back to the generator
      </Link>
    </div>
  );
}
