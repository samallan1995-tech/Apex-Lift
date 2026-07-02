const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'What happens when my free trial ends?',
    a: 'Nothing is charged — we don’t take card details for the trial. After 14 days, printing labels and editing your menu pause until you choose a plan, but everything you entered is saved and waiting. Pick a plan and you carry on exactly where you left off.',
  },
  {
    q: 'Is AllerSafe legal advice?',
    a: 'No. AllerSafe is a management tool that helps you organise allergen information and produce labels, matrices and menus from the data you enter. Your business remains legally responsible for verifying every allergen declaration against current supplier specifications and for managing cross-contamination. If you are unsure about your obligations, speak to your local Environmental Health team or check FSA guidance.',
  },
  {
    q: 'What is Natasha’s Law, and do I need PPDS labels?',
    a: 'Natasha’s Law (in force since 1 October 2021) requires food that is prepacked for direct sale (PPDS) — food packed before the customer orders it, on the same premises it is sold — to carry a full ingredient list with the 14 regulated allergens emphasised. If you pack sandwiches, salads, cakes or similar before sale, you are likely in scope. Check the FSA’s PPDS guidance if you are unsure.',
  },
  {
    q: 'How do I keep labels accurate when supplier ingredients change?',
    a: 'Update the ingredient once in your AllerSafe library and every dish, label, matrix and QR menu that uses it updates together — no out-of-date spreadsheets. We recommend re-checking supplier specification sheets regularly and whenever a supplier or recipe changes.',
  },
  {
    q: 'Can I show my allergen matrix to my EHO inspector?',
    a: 'Yes — the printable matrix shows every dish against all 14 UK allergens and is designed to be shown to Environmental Health Officers. Remember it reflects the data you entered, so keep it current and verify it against supplier specifications.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Paid plans can be cancelled at any time from the billing portal, and you keep access until the end of the period you have paid for. The free trial needs no cancellation at all — no card is taken, so there is nothing to cancel.',
  },
];

export function FaqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function Faq() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-5 py-20">
      <FaqJsonLd />
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Questions</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
      </div>
      <div className="mt-10 space-y-3">
        {FAQS.map(f => (
          <details
            key={f.q}
            className="group rounded-2xl border border-gray-200 bg-white px-5 py-4 open:border-[#9DE26B]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-[#3B6D11] transition-transform group-open:rotate-45 text-xl leading-none shrink-0">+</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
