import Link from 'next/link';
import { LegalLayout, H2, P, UL } from '@/components/LegalLayout';

const TITLE = 'PPDS labelling: a step-by-step compliance guide';
const DESCRIPTION =
  'A practical, step-by-step PPDS labelling walkthrough for UK cafés, bakeries and takeaways — from working out which food is in scope to printing compliant labels.';

export const metadata = {
  title: `${TITLE} — AllerSafe`,
  description: DESCRIPTION,
  alternates: { canonical: 'https://allersafe.org/ppds-labelling-guide' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'article', url: 'https://allersafe.org/ppds-labelling-guide' },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    author: { '@type': 'Organization', name: 'AllerSafe' },
    publisher: { '@type': 'Organization', name: 'AllerSafe', url: 'https://allersafe.org' },
    mainEntityOfPage: 'https://allersafe.org/ppds-labelling-guide',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function PpdsGuidePage() {
  return (
    <LegalLayout title={TITLE} updated="30 June 2026">
      <ArticleJsonLd />
      <P>
        PPDS labelling looks daunting from the outside — legal language, fourteen allergens, and the
        feeling that one mistake could be serious. In practice it breaks down into seven repeatable
        steps. Work through them once, set up a routine, and it becomes part of normal prep.
      </P>

      <H2>Step 1 — Work out which of your items are PPDS</H2>
      <P>
        Walk your counter and chiller and ask one question of every item: <em>was this packed before
        the customer ordered it, here on these premises?</em> If yes, it is prepacked for direct sale
        and needs a full label. Morning-wrapped sandwiches, grab-and-go salad pots, boxed traybakes and
        bagged pastries are in; made-to-order food is out (though you must still give allergen
        information another way). List every PPDS item — this is your labelling workload.
      </P>

      <H2>Step 2 — Gather supplier specification sheets</H2>
      <P>
        For every bought-in ingredient, get the supplier&apos;s specification or allergen declaration —
        most wholesalers publish them, and your supplier rep can send the rest. This is the single most
        important step: labels written from memory are how hidden allergens (the barley malt in a
        vinegar, the celery in a stock) slip through. File the specs and note the date.
      </P>

      <H2>Step 3 — Break every product into its full ingredient list</H2>
      <P>
        List each PPDS product&apos;s ingredients in <strong>descending order of weight</strong>,
        expanding compound ingredients into their sub-ingredients. “Pesto” is not an ingredient for
        labelling purposes — “basil, pine nuts, parmesan cheese (milk), olive oil, garlic” is.
      </P>

      <H2>Step 4 — Emphasise the 14 allergens</H2>
      <P>
        Wherever one of the 14 regulated allergens appears in that list, make it stand out — bold,
        CAPITALS, or both is the convention. Emphasise the allergen wherever it occurs, including
        inside sub-ingredients. A “Contains:” summary underneath is good practice and what customers
        look for first.
      </P>

      <H2>Step 5 — Print and attach the labels</H2>
      <UL>
        <li>The label goes on the packaging itself, readable before purchase.</li>
        <li>Include the food&apos;s name at the top, then the ingredient list.</li>
        <li>Add a use-by date, storage instructions and your business name.</li>
        <li>Keep the type legible — tiny print that can&apos;t be read fails the purpose (and there are minimum font-size rules for larger packs).</li>
      </UL>

      <H2>Step 6 — Keep labels in sync with reality</H2>
      <P>
        The label must describe what is actually in the batch you are selling today. Whenever a recipe
        changes, a supplier substitutes a product, or you run out of one brand and use another, check
        the spec and reprint before the item goes on sale. Out-of-date labels are worse than none —
        they are confidently wrong.
      </P>

      <H2>Step 7 — Train the team and keep evidence</H2>
      <P>
        Everyone who packs or sells PPDS food should know what the labels mean, where the{' '}
        <Link href="/allergen-matrix-template" className="text-[#3B6D11] underline">allergen matrix</Link>{' '}
        lives, and what to do when a customer declares an allergy (always flag it, never guess).
        Keep your supplier specs, dated matrix and label templates together — that folder is your
        evidence of due diligence if an inspector asks.
      </P>

      <H2>Doing this without the paperwork spiral</H2>
      <P>
        Steps 3–6 are where small businesses burn hours, because every change ripples through labels,
        matrix and menu. AllerSafe automates the ripple: build each dish from an ingredient library
        once, and compliant PPDS labels, your 14-allergen matrix and a live QR allergen menu are all
        generated from the same data. Update the ingredient, and every label and document updates with
        it.
      </P>
      <P>
        <Link href="/signup" className="text-[#3B6D11] underline font-semibold">Try it free for 14 days</Link>{' '}
        (no card required), see a{' '}
        <Link href="/demo" className="text-[#3B6D11] underline font-semibold">live example menu</Link>, or
        start with the{' '}
        <Link href="/free-allergen-matrix" className="text-[#3B6D11] underline font-semibold">free matrix template</Link>.
      </P>
      <P>
        <em>
          This guide is general information, not legal advice. Requirements are set by the Food
          Information Regulations and FSA guidance — check the current versions, and verify all
          allergen information against supplier specifications. Your business remains responsible for
          compliance.
        </em>
      </P>
    </LegalLayout>
  );
}
