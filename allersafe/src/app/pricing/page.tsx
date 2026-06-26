import Link from 'next/link';
import { PLANS, SETUP_ADDON } from '@/lib/plans';

export const metadata = {
  title: 'Pricing — AllerSafe',
  description: 'Simple, transparent pricing for UK allergen labelling. From £15/mo.',
};

export default function PricingPage() {
  const plans = Object.values(PLANS);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold text-lg text-gray-900">AllerSafe</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-green-800 hover:text-green-900 bg-white border border-green-200 rounded-lg px-4 py-2"
        >
          Sign in
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mt-8 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Simple pricing</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Everything you need to stay compliant with UK allergen labelling law — Natasha&apos;s Law
            PPDS labels, allergen matrix, and QR menus. No per-label fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              className={
                'rounded-2xl border p-6 bg-white flex flex-col ' +
                (i === 1 ? 'border-green-500 ring-1 ring-green-500 shadow-sm' : 'border-gray-200')
              }
            >
              {i === 1 && (
                <span className="self-start text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full mb-3">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-4xl font-bold text-gray-900">£{plan.priceGBP}</span>
                <span className="text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{plan.blurb}</p>
              <ul className="mt-5 space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className={
                  'mt-6 w-full text-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ' +
                  (i === 1
                    ? 'bg-green-700 text-white hover:bg-green-800'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50')
                }
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        {/* Setup add-on */}
        <div className="max-w-3xl mx-auto mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {SETUP_ADDON.name}{' '}
              <span className="text-gray-400 font-normal">— one-off £{SETUP_ADDON.priceGBP}</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Short on time? {SETUP_ADDON.blurb}. Send us your menu and supplier specs and we&apos;ll set
              up your ingredients and dishes for you.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-2 hover:bg-green-100"
          >
            Add at checkout
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10 max-w-xl mx-auto">
          Prices in GBP. Payments processed securely by Stripe. AllerSafe is a management tool — your
          business remains legally responsible for verifying all allergen declarations against supplier
          specifications.
        </p>
      </main>
    </div>
  );
}
