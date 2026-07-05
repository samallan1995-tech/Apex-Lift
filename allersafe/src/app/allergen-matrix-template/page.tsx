import Link from 'next/link';
import { LegalLayout, H2, P, UL } from '@/components/LegalLayout';

const TITLE = 'The allergen matrix: how to build one your EHO will trust';
const DESCRIPTION =
  'What an allergen matrix is, why UK food businesses need one, how to build it properly from supplier specs — plus a free printable 14-allergen template.';

export const metadata = {
  title: `${TITLE} — AllerSafe`,
  description: DESCRIPTION,
  alternates: { canonical: 'https://allersafe.org/allergen-matrix-template' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'article', url: 'https://allersafe.org/allergen-matrix-template' },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    author: { '@type': 'Organization', name: 'AllerSafe' },
    publisher: { '@type': 'Organization', name: 'AllerSafe', url: 'https://allersafe.org' },
    mainEntityOfPage: 'https://allersafe.org/allergen-matrix-template',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AllergenMatrixArticle() {
  return (
    <LegalLayout title={TITLE} updated="30 June 2026">
      <ArticleJsonLd />
      <P>
        Ask any Environmental Health Officer what they want to see when they walk into a food business
        and allergens come up, and the answer is usually the same: a clear, current allergen matrix and
        evidence that you keep it up to date. This guide explains what a matrix is, how to build one
        properly, and the mistakes that undermine it.
      </P>

      <H2>What is an allergen matrix?</H2>
      <P>
        An allergen matrix is a simple grid: your dishes down one side, the 14 UK regulated allergens
        across the top, and a tick (or cross) in every cell where a dish contains that allergen. One
        page tells a customer, a team member or an inspector exactly which dishes contain gluten, milk,
        nuts, sesame and the rest.
      </P>
      <P>
        The matrix itself is not named in law — what the Food Information Regulations 2014 require is
        that you can provide <em>accurate allergen information</em> for every item you serve. The
        matrix is simply the clearest, most widely accepted way to do that for non-prepacked food, and
        it is what most EHOs expect to be shown.
      </P>

      <H2>How to build one properly</H2>
      <UL>
        <li><strong>1. List every dish you serve</strong> — including sides, sauces, specials and drinks with mix-ins. Anything a customer can order belongs on the matrix.</li>
        <li><strong>2. Gather supplier specification sheets</strong> — the allergen declaration for every bought-in ingredient. Never work from memory or from the front of the packet alone; formulations change.</li>
        <li><strong>3. Break each dish into its ingredients</strong> — including compound ingredients (the mayonnaise in your coleslaw contains egg; the stock cube may contain celery).</li>
        <li><strong>4. Tick every allergen present</strong> — for each dish, mark all 14 columns honestly. If a dish is being reformulated, take it off the matrix until you are sure.</li>
        <li><strong>5. Date it and sign it</strong> — inspectors want to see when it was last reviewed and who is responsible.</li>
        <li><strong>6. Review on a schedule</strong> — monthly is a sensible default, plus immediately whenever a recipe, supplier or ingredient changes.</li>
      </UL>

      <H2>The mistakes that undermine a matrix</H2>
      <UL>
        <li><strong>Filling it in from memory.</strong> The most common and most dangerous shortcut — hidden allergens live in sub-ingredients you have forgotten about.</li>
        <li><strong>Letting it go stale.</strong> A matrix dated eighteen months ago tells an inspector your allergen controls are decorative.</li>
        <li><strong>Ignoring cross-contamination.</strong> The matrix records what is <em>in</em> each dish. Shared fryers, shared prep surfaces and airborne flour need managing — and communicating — separately.</li>
        <li><strong>One person owning it in their head.</strong> If only the owner knows the allergens, every day off is a risk. The matrix exists so the whole team gives the same answer.</li>
      </UL>

      <H2>Get a free printable template</H2>
      <P>
        We publish a free, printable A4 matrix template covering all 14 UK allergens, with space for 18
        dishes per sheet and the review prompts inspectors like to see.{' '}
        <Link href="/free-allergen-matrix" className="text-[#3B6D11] underline font-semibold">Download the free template here</Link>{' '}
        — no catch, we just email you the link.
      </P>

      <H2>When the paper version stops scaling</H2>
      <P>
        A paper matrix is fine until the first menu change — then every update means redrawing the
        grid, reprinting labels and correcting the menu, and the versions drift apart. AllerSafe keeps
        one source of truth: enter each ingredient once, and your matrix,{' '}
        <Link href="/natashas-law-labels" className="text-[#3B6D11] underline">Natasha&apos;s Law PPDS labels</Link>{' '}
        and QR allergen menu are all generated from the same data. Update an ingredient and every
        document changes together — with a printable matrix your EHO can take away.
      </P>
      <P>
        <Link href="/signup" className="text-[#3B6D11] underline font-semibold">Start a free 14-day trial</Link>{' '}
        — no card required.
      </P>
      <P>
        <em>
          This guide is general information, not legal advice. Your business remains responsible for
          the accuracy of its allergen information — always verify against current supplier
          specifications.
        </em>
      </P>
    </LegalLayout>
  );
}
