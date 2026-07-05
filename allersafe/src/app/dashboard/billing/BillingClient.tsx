'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PLANS, SETUP_ADDON, isActiveStatus } from '@/lib/plans';
import type { PlanKey, BillingInterval } from '@/lib/plans';
import type { BillingState } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  none: 'No active plan',
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past due',
  canceled: 'Cancelled',
  incomplete: 'Incomplete',
  unpaid: 'Unpaid',
};

export function BillingClient({ billing }: { billing: BillingState }) {
  const params = useSearchParams();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [interval, setInterval] = useState<BillingInterval>('month');

  const active = isActiveStatus(billing.status);
  const currentPlan = active ? billing.plan : null;
  const annual = interval === 'year';

  async function startCheckout(product: PlanKey | 'setup') {
    setBusy(product);
    setError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, interval: product === 'setup' ? undefined : interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy('portal');
    setError('');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not open portal');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(null);
    }
  }

  const renewLabel =
    billing.currentPeriodEnd != null
      ? new Date(billing.currentPeriodEnd * 1000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing &amp; plan</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your AllerSafe subscription.</p>
      </div>

      {params.get('status') === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          ✅ Payment received — thank you. Your plan will update within a few seconds.
        </div>
      )}
      {params.get('status') === 'cancelled' && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm">
          Checkout cancelled — no charge was made.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Current plan</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {currentPlan
                ? PLANS[currentPlan as PlanKey].name
                : billing.isTrial
                  ? 'Free trial'
                  : billing.trialExpired
                    ? 'Trial ended'
                    : 'Free / no plan'}
              <span
                className={
                  'ml-2 text-xs font-medium px-2 py-0.5 rounded-full ' +
                  (active || billing.isTrial
                    ? 'bg-green-100 text-green-700'
                    : billing.trialExpired
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600')
                }
              >
                {billing.isTrial
                  ? `${billing.trialDaysLeft} day${billing.trialDaysLeft === 1 ? '' : 's'} left`
                  : billing.trialExpired
                    ? 'Ended — choose a plan'
                    : STATUS_LABEL[billing.status] ?? billing.status}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {billing.isTrial
                ? 'No payment taken yet — you won’t be charged unless you choose a plan.'
                : `Using ${billing.venueCount} of ${billing.venueLimit} venue${billing.venueLimit !== 1 ? 's' : ''}${renewLabel && active ? ` · renews ${renewLabel}` : ''}`}
            </p>
          </div>
          {billing.plan && (
            <Button variant="secondary" onClick={openPortal} loading={busy === 'portal'}>
              Manage billing
            </Button>
          )}
        </div>
      </div>

      {/* Interval toggle */}
      <div className="flex items-center gap-1">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setInterval('month')}
            className={
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ' +
              (!annual ? 'bg-green-800 text-white' : 'text-gray-600 hover:text-gray-900')
            }
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ' +
              (annual ? 'bg-green-800 text-white' : 'text-gray-600 hover:text-gray-900')
            }
          >
            Annual · 2 months free
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(Object.values(PLANS) as typeof PLANS[PlanKey][]).map(plan => {
          const isCurrent = currentPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={
                'rounded-xl border p-5 flex flex-col ' +
                (isCurrent ? 'border-green-500 ring-1 ring-green-500 bg-green-50/40' : 'border-gray-200 bg-white')
              }
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                {isCurrent && (
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-2">
                <span className="text-3xl font-bold text-gray-900">£{annual ? plan.annualPriceGBP : plan.priceGBP}</span>
                <span className="text-gray-500 text-sm">/{annual ? 'yr' : 'mo'}</span>
              </p>
              <p className="text-sm text-gray-500">
                {plan.blurb}
                {annual && ` · £${(plan.annualPriceGBP / 12).toFixed(2)}/mo equivalent`}
              </p>
              <ul className="mt-4 space-y-1.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-5"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent}
                loading={busy === plan.key}
                onClick={() => startCheckout(plan.key)}
              >
                {isCurrent ? 'Your current plan' : currentPlan ? `Switch to ${plan.name}` : `Choose ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Setup add-on */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            {SETUP_ADDON.name}
            {billing.setupPaid && (
              <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Purchased
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {SETUP_ADDON.blurb} — one-off £{SETUP_ADDON.priceGBP}. Send us your menu and we&apos;ll build out
            your ingredients and dishes for you.
          </p>
          {billing.setupPaid && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
              ✅ Order received. Email your menu and supplier allergen specs to{' '}
              <a href="mailto:support@allersafe.org" className="underline font-medium">support@allersafe.org</a>{' '}
              and we&apos;ll set everything up within 3 working days.
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          disabled={billing.setupPaid}
          loading={busy === 'setup'}
          onClick={() => startCheckout('setup')}
        >
          {billing.setupPaid ? 'Paid' : `Add for £${SETUP_ADDON.priceGBP}`}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Payments are processed securely by Stripe. Prices are in GBP. You can cancel
        or change your plan at any time from the &ldquo;Manage billing&rdquo; portal.
      </p>
    </div>
  );
}
