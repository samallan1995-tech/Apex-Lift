'use client';
import Link from 'next/link';
import type { BillingState } from '@/types';

function formatDate(unixSeconds: number | null): string {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Shown across the top of the dashboard so a trialing restaurant always knows
 * exactly where they stand: how long is left and that nothing has been charged.
 */
export function TrialBanner({ billing }: { billing: BillingState }) {
  if (billing.trialExpired) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 lg:px-6">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Your free trial has ended.</span> Choose a plan to
          keep printing labels and sharing your allergen menu.
        </p>
        <Link
          href="/dashboard/billing"
          className="shrink-0 rounded-lg bg-amber-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Choose a plan
        </Link>
      </div>
    );
  }

  if (billing.isTrial) {
    const days = billing.trialDaysLeft;
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 bg-green-50 border-b border-green-200 px-4 py-2.5 lg:px-6">
        <p className="text-sm text-green-900">
          <span className="font-semibold">
            Free trial · {days} day{days === 1 ? '' : 's'} left
          </span>
          <span className="text-green-700">
            {' '}— no payment taken. You won&apos;t be charged anything until{' '}
            {formatDate(billing.trialEndsAt)}, and only if you choose a plan.
          </span>
        </p>
        <Link
          href="/dashboard/billing"
          className="shrink-0 rounded-lg border border-green-600 bg-white px-3.5 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-100"
        >
          See plans
        </Link>
      </div>
    );
  }

  return null;
}
