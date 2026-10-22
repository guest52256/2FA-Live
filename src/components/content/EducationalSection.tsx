import { Compatibility } from './Compatibility';
import { Faq } from './Faq';
import { FeatureCards } from './FeatureCards';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { HowToUse } from './HowToUse';
import { WhyBrowser } from './WhyBrowser';

/**
 * The long-form educational / SEO section.
 *
 * @returns The article element.
 */
export function EducationalSection() {
  return (
    <article id="how-it-works" className="w-full max-w-5xl mt-12 slide-up" style={{ animationDelay: '0.3s' }}>
      <FeatureCards />

      <HowItWorks />

      <HowToUse />

      {/* Extended SEO Content */}
      <div className="mt-12 sm:mt-16 space-y-12">
        <WhyBrowser />
        <Compatibility />
        <Faq />
      </div>
    </article>
  );
}

export { Hero };
