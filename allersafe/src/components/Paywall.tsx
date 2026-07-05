'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLANS, type PlanKey } from '@/lib/plans';
import { IconShield } from '@/components/icons';

export function Paywall({ email }: { email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [error, setError] = useState('');
  const plans = Object.values(PLANS);

  async function choose(product: PlanKey) {
    setBusy(product);
    setError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not start checkout');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(null);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E2A06] px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#9DE26B] text-[#0E2A06] mb-5">
          <IconShield className="w-7 h-7" />
        </span>
        <h1 className="text-3xl font-extrabold text-white">Your free trial has ended</h1>
        <p className="mt-3 text-[#C0DD97]">
          Choose a plan to keep printing labels, sharing your QR menu, and editing your allergen data.
          Your menu is saved and waiting for you.
        </p>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-8 grid sm:grid-cols-2 gap-4 text-left">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              className={'rounded-2xl p-6 ' + (i === 1 ? 'bg-white' : 'bg-white/5 border border-white/15')}
            >
              <h2 className={'text-lg font-bold ' + (i === 1 ? 'text-gray-900' : 'text-white')}>{plan.name}</h2>
              <p className={i === 1 ? 'text-gray-900' : 'text-white'}>
                <span className="text-4xl font-extrabold">£{plan.priceGBP}</span>
                <span className={i === 1 ? 'text-gray-400' : 'text-[#C0DD97]'}>/mo</span>
              </p>
              <p className={'text-xs mt-1 ' + (i === 1 ? 'text-gray-500' : 'text-[#C0DD97]')}>{plan.blurb}</p>
              <ul className={'mt-4 space-y-1.5 text-sm ' + (i === 1 ? 'text-gray-600' : 'text-[#C0DD97]')}>
                {plan.features.slice(0, 4).map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className={i === 1 ? 'text-[#3B6D11]' : 'text-[#9DE26B]'}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(plan.key)}
                disabled={busy !== null}
                className={'mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 ' +
                  (i === 1 ? 'bg-[#0E2A06] text-white hover:bg-[#143b0a]' : 'bg-[#9DE26B] text-[#0E2A06] hover:bg-[#b6ec90]')}
              >
                {busy === plan.key ? 'Starting…' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-[#9DCB8A]">
          Signed in as {email} · <button onClick={logout} className="underline hover:text-white">Sign out</button>
        </div>
      </div>
    </div>
  );
}
