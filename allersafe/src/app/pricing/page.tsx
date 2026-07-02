import Link from 'next/link';
import { PLANS, SETUP_ADDON } from '@/lib/plans';
import { Faq } from '@/components/Faq';

export const metadata = {
  title: 'Pricing — AllerSafe',
  description: 'Simple, transparent pricing for UK allergen labelling. Start free for 14 days, no card required.',
};

function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function PricingPage() {
  const plans = Object.values(PLANS);
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <header className="bg-[#0E2A06] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#9DE26B] text-[#0E2A06]"><Shield className="w-5 h-5" /></span>
            <span className="text-lg font-bold text-white">AllerSafe</span>
          </Link>
          <Link href="/login" className="ml-auto text-sm font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-lg px-4 py-2">
            Start free
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 pb-24">
        <div className="text-center mt-14 mb-12">
          <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Simple pricing</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">Start free, pay only if you stay</h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Natasha&apos;s Law PPDS labels, allergen matrix and QR menus — no per-label fees. Every plan starts with a
            <span className="font-semibold text-gray-700"> 14-day free trial, no card required</span>. You&apos;re only charged if you choose a plan after your trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((plan, i) => {
            const featured = i === 1;
            return (
              <div
                key={plan.key}
                className={'rounded-2xl p-7 flex flex-col ' + (featured ? 'bg-[#0E2A06] text-white' : 'bg-white border border-gray-200')}
              >
                {featured && (
                  <span className="self-start text-xs font-bold text-[#0E2A06] bg-[#9DE26B] px-2.5 py-1 rounded-full mb-3">Most popular</span>
                )}
                <h2 className={'text-lg font-bold ' + (featured ? 'text-white' : 'text-gray-900')}>{plan.name}</h2>
                <p className="mt-2">
                  <span className="text-5xl font-extrabold">£{plan.priceGBP}</span>
                  <span className={featured ? 'text-[#C0DD97]' : 'text-gray-400'}>/mo</span>
                </p>
                <p className={'text-sm mt-1 ' + (featured ? 'text-[#C0DD97]' : 'text-gray-500')}>{plan.blurb}</p>
                <p className={'text-xs font-semibold mt-2 ' + (featured ? 'text-[#9DE26B]' : 'text-[#3B6D11]')}>14-day free trial · no card required</p>
                <ul className={'mt-5 space-y-2.5 flex-1 text-sm ' + (featured ? 'text-[#C0DD97]' : 'text-gray-600')}>
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={'mt-0.5 ' + (featured ? 'text-[#9DE26B]' : 'text-[#3B6D11]')}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={'mt-7 w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ' +
                    (featured ? 'bg-[#9DE26B] text-[#0E2A06] hover:bg-[#b6ec90]' : 'bg-gray-900 text-white hover:bg-gray-800')}
                >
                  Start 14-day free trial
                </Link>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-5 rounded-2xl border border-dashed border-gray-300 bg-[#F6FAF0] p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">
              {SETUP_ADDON.name} <span className="text-gray-400 font-normal">— one-off £{SETUP_ADDON.priceGBP}</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Short on time? {SETUP_ADDON.blurb}. Send us your menu and supplier specs and we&apos;ll set up your ingredients and dishes for you.
            </p>
          </div>
          <Link href="/login" className="text-sm font-semibold text-[#27500A] bg-white border border-[#C0DD97] rounded-lg px-4 py-2 hover:bg-[#EAF3DE]">
            Add at checkout
          </Link>
        </div>

        <Faq />

        <p className="text-center text-xs text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
          Prices in GBP. Payments processed securely by Stripe. AllerSafe is a management tool — your business remains legally responsible for verifying all allergen declarations against supplier specifications.
        </p>
      </main>
    </div>
  );
}
