import { LEGAL_DOCUMENTS } from '../content/legal';

interface FooterProps {
  /** Opens one of the legal documents by id. */
  onOpenDocument: (id: string) => void;
}

/**
 * The site footer with the legal-document triggers.
 *
 * @param props Component props.
 * @returns The footer element.
 */
export function Footer({ onOpenDocument }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-dark/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-sm">
            &copy; {new Date().getFullYear()}{' '}
            <a href="/" className="hover:text-brand-neon transition-colors">
              2FA Live
            </a>
            .
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          {LEGAL_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onOpenDocument(doc.id)}
              className="hover:text-brand-neon transition-colors"
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
