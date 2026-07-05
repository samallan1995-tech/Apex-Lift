'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PLANS, type BillingInterval } from '@/lib/plans';

/** Plan cards with a monthly/annual toggle, shared marketing style. */
export function PricingPlans() {
  const [interval, setInterval] = useState<BillingInterval>('month');
  const plans = Object.values(PLANS);
  const annual = interval === 'year';

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-1 mb-8">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setInterval('month')}
            className={
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors ' +
              (!annual ? 'bg-[#0E2A06] text-white' : 'text-gray-600 hover:text-gray-900')
            }
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors ' +
              (annual ? 'bg-[#0E2A06] text-white' : 'text-gray-600 hover:text-gray-900')
            }
          >
            Annual <span className={annual ? 'text-[#9DE26B]' : 'text-[#3B6D11]'}>· 2 months free</span>
          </button>
        </div>
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
                <span className="text-5xl font-extrabold">£{annual ? plan.annualPriceGBP : plan.priceGBP}</span>
                <span className={featured ? 'text-[#C0DD97]' : 'text-gray-400'}>/{annual ? 'yr' : 'mo'}</span>
              </p>
              <p className={'text-sm mt-1 ' + (featured ? 'text-[#C0DD97]' : 'text-gray-500')}>
                {plan.blurb}
                {annual && <span> · equivalent to £{(plan.annualPriceGBP / 12).toFixed(2)}/mo</span>}
              </p>
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
                href="/signup"
                className={'mt-7 w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ' +
                  (featured ? 'bg-[#9DE26B] text-[#0E2A06] hover:bg-[#b6ec90]' : 'bg-gray-900 text-white hover:bg-gray-800')}
              >
                Start 14-day free trial
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
