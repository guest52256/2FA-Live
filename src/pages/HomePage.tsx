import { useCallback, useState } from 'react';

import { EducationalSection, Hero } from '../components/content/EducationalSection';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { ToolCard } from '../components/tool/ToolCard';
import { LEGAL_DOCUMENTS } from '../content/legal';

/**
 * The single-page tool — the only content route of the source project.
 *
 * @returns The home page element.
 */
export function HomePage() {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);

  const openDocument = useCallback((id: string) => setActiveDocument(id), []);
  const closeDocument = useCallback(() => setActiveDocument(null), []);

  const document_ = LEGAL_DOCUMENTS.find((doc) => doc.id === activeDocument) ?? null;

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased selection:bg-brand-neon selection:text-black">
      <Header onOpenPrivacy={() => openDocument('privacy-modal')} />

      <main className="flex-grow flex flex-col items-center px-4 pt-6 pb-12 lg:pt-10 lg:pb-20 relative">
        <ToolCard onRequestScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        <Hero />

        <EducationalSection />
      </main>

      <Footer onOpenDocument={openDocument} />

      <Modal
        open={document_ !== null}
        onClose={closeDocument}
        title={document_?.title ?? ''}
        id={document_?.id}
      >
        {document_?.body.map((block, index) =>
          block.type === 'h4' ? (
            <h4 key={index} className="text-white font-bold text-base mb-2">
              {block.content}
            </h4>
          ) : (
            <p
              key={index}
              className={
                block.content.includes('Important Rule')
                  ? 'text-red-400 font-semibold border-l-2 border-red-400 pl-3'
                  : ''
              }
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ),
        )}
      </Modal>
    </div>
  );
}
