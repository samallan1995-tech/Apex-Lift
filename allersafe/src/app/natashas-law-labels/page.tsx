import Link from 'next/link';
import { LegalLayout, H2, P, UL } from '@/components/LegalLayout';

const TITLE = 'Natasha’s Law labels: what UK food businesses must include';
const DESCRIPTION =
  'A plain-English guide to Natasha’s Law for small UK food businesses: who needs PPDS labels, exactly what must be on them, and how to stay compliant.';

export const metadata = {
  title: `${TITLE} — AllerSafe`,
  description: DESCRIPTION,
  alternates: { canonical: 'https://allersafe.org/natashas-law-labels' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'article', url: 'https://allersafe.org/natashas-law-labels' },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    author: { '@type': 'Organization', name: 'AllerSafe' },
    publisher: { '@type': 'Organization', name: 'AllerSafe', url: 'https://allersafe.org' },
    mainEntityOfPage: 'https://allersafe.org/natashas-law-labels',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function NatashasLawPage() {
  return (
    <LegalLayout title={TITLE} updated="30 June 2026">
      <ArticleJsonLd />
      <P>
        If you run a café, bakery, deli, sandwich shop or takeaway in the UK, Natasha’s Law almost
        certainly affects you. This guide explains what the law requires, who is in scope, and exactly
        what has to appear on a compliant label — in plain English, without the legal jargon.
      </P>

      <H2>What is Natasha’s Law?</H2>
      <P>
        Natasha’s Law is the common name for the UK Food Information (Amendment) Regulations, in force
        since 1 October 2021. It followed the death of Natasha Ednan-Laperouse, a teenager who suffered
        a fatal allergic reaction to sesame baked into a baguette she bought pre-packed — at the time,
        that packaging did not have to list its ingredients. The law closed that gap: food that is{' '}
        <strong>prepacked for direct sale (PPDS)</strong> must now carry a full ingredient list with
        allergens emphasised, just like supermarket products.
      </P>

      <H2>Am I in scope? What counts as PPDS</H2>
      <P>
        Food is PPDS when it is packed <em>before</em> the customer orders it, on the same premises it
        is sold from (or from a mobile stall or van). Typical examples:
      </P>
      <UL>
        <li>Sandwiches, wraps and baguettes made and wrapped in the morning ready for lunch service.</li>
        <li>Salad boxes, pasta pots and grab-and-go items in a chiller.</li>
        <li>Boxed cakes, brownies and traybakes packed before sale.</li>
        <li>Pies, sausage rolls and pastries bagged or boxed ahead of time.</li>
      </UL>
      <P>
        Food packed <em>after</em> the customer orders it (a sandwich made to order, a burger boxed at
        the till) is not PPDS — but you must still be able to tell customers about allergens verbally
        or in writing under the Food Information Regulations 2014. If you are unsure whether an item
        counts, the Food Standards Agency publishes detailed PPDS guidance, and your local
        Environmental Health team can advise.
      </P>

      <H2>Anatomy of a compliant PPDS label</H2>
      <P>Every PPDS label must show:</P>
      <UL>
        <li><strong>The name of the food</strong> — clear and specific, e.g. “Chicken &amp; pesto baguette”, not just “Baguette”.</li>
        <li><strong>A full ingredient list</strong> — every ingredient, in descending order of weight, including the sub-ingredients of compound items (the flour, water and yeast in your bread; the nuts and cheese in your pesto).</li>
        <li><strong>The 14 regulated allergens emphasised</strong> — wherever one of the 14 allergens (celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, tree nuts, peanuts, sesame, soybeans, and sulphur dioxide/sulphites) appears in the ingredient list, it must stand out: bold, capitals, italics or a contrasting colour.</li>
      </UL>
      <P>
        Good practice also includes a “Contains” summary, a use-by or best-before date, storage
        instructions, and your business name — customers and inspectors both expect them.
      </P>

      <H2>Common mistakes that catch small businesses out</H2>
      <UL>
        <li>Listing “pesto” without its sub-ingredients — the hidden pine nuts, cashews or parmesan are exactly what the law is there to expose.</li>
        <li>Writing ingredient lists from memory instead of supplier specification sheets — recipes and supplier formulations change.</li>
        <li>Printing a batch of labels and never updating them when a supplier substitutes an ingredient.</li>
        <li>Emphasising the whole ingredient list (so nothing stands out) or forgetting to emphasise allergens in sub-ingredients.</li>
      </UL>

      <H2>What happens if I get it wrong?</H2>
      <P>
        Allergen labelling is enforced by local authority Environmental Health and Trading Standards
        teams. Non-compliance can lead to improvement notices, fines and — in serious cases —
        prosecution. Far more importantly, an inaccurate label can seriously harm or kill an allergic
        customer. Accuracy is not paperwork; it is food safety.
      </P>

      <H2>How to make this manageable</H2>
      <P>
        The workload comes from repetition: every recipe change means rewriting labels, updating your
        allergen matrix and correcting your menu. AllerSafe removes the repetition — enter each
        ingredient once with its allergens, build dishes from those ingredients, and compliant PPDS
        labels, a <Link href="/allergen-matrix-template" className="text-[#3B6D11] underline">14-allergen matrix</Link>{' '}
        and a live QR menu are generated from the same data. Change an ingredient and everything
        updates together.
      </P>
      <P>
        <Link href="/signup" className="text-[#3B6D11] underline font-semibold">Try AllerSafe free for 14 days</Link>{' '}
        (no card required), or start with our{' '}
        <Link href="/free-allergen-matrix" className="text-[#3B6D11] underline font-semibold">free printable allergen matrix template</Link>.
      </P>
      <P>
        <em>
          This guide is general information, not legal advice. Your business remains responsible for
          compliance — verify all allergen information against current supplier specifications and
          check the latest FSA guidance.
        </em>
      </P>
    </LegalLayout>
  );
}
