'use client'
import { useState } from 'react'
import { PLANS } from '@/lib/types'

const PLAN_DETAILS = [
  {
    key: 'solo',
    name: 'Solo',
    price: '£49',
    period: '/mo',
    desc: 'Sole practitioners',
    features: ['3 active forms', 'Unlimited submissions', 'PDF generation', 'Template library'],
    color: 'border-gray-200',
  },
  {
    key: 'team',
    name: 'Team',
    price: '£99',
    period: '/mo',
    desc: 'Growing practices',
    features: ['Unlimited forms', 'Remove branding', 'Up to 10 seats', 'AI form generation'],
    color: 'border-indigo-500',
    highlight: true,
  },
  {
    key: 'firm',
    name: 'Firm',
    price: '£199',
    period: '/mo',
    desc: 'Established firms',
    features: ['Everything in Team', 'White-label domain', 'Unlimited seats', 'Custom branding'],
    color: 'border-purple-500',
  },
]

export default function BillingClient({ org }: { org: { id: string; name: string; plan: string; stripe_customer_id?: string; stripe_subscription_id?: string } }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function upgrade(plan: string) {
    if (plan === org.plan) return
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout')
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message)
      setLoading(null)
    }
  }

  const currentPlan = PLANS[org.plan as keyof typeof PLANS]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription</p>
      </div>

      {/* Current plan summary */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-indigo-600 mb-0.5">Current plan</div>
          <div className="text-xl font-bold text-gray-900">{currentPlan?.name || org.plan} — {currentPlan ? `£${currentPlan.price}/mo` : 'Free'}</div>
          <div className="text-sm text-gray-500 mt-1">
            {currentPlan?.formLimit === Infinity ? 'Unlimited forms' : `Up to ${currentPlan?.formLimit} forms`}
            {currentPlan?.removeBranding ? ' · No branding' : ''}
            {currentPlan?.whiteLabel ? ' · White-label' : ''}
          </div>
        </div>
        {org.stripe_subscription_id && (
          <div className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full">Active</div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLAN_DETAILS.map(plan => {
          const isCurrent = org.plan === plan.key
          return (
            <div key={plan.key} className={`bg-white rounded-xl border-2 p-6 ${plan.highlight ? 'border-indigo-500' : 'border-gray-200'} ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`}>
              {plan.highlight && (
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Most popular</div>
              )}
              <div className="font-bold text-gray-900 text-lg mb-1">{plan.name}</div>
              <div className="text-gray-400 text-sm mb-3">{plan.desc}</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full text-center text-sm font-semibold text-indigo-600 bg-indigo-50 py-2.5 rounded-xl">
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => upgrade(plan.key)}
                  disabled={loading === plan.key}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {loading === plan.key ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        All plans include a 14-day free trial. Cancel anytime. Payments via Stripe — secure and PCI compliant.
      </p>
    </div>
  )
}
