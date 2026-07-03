'use client';
import { useState } from 'react';
import Link from 'next/link';

export function LeadForm({ source }: { source: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit() {
    if (!email) return;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, marketingConsent: consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setState('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-bold text-green-900">Check your inbox 📬</p>
        <p className="mt-1 text-sm text-green-800">
          We&apos;ve emailed your template link. You can also{' '}
          <Link href="/free-allergen-matrix/template" className="underline font-semibold">open it right now</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <label htmlFor="lead-email" className="text-sm font-medium text-gray-700">Your email address</label>
      <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
        <input
          id="lead-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="you@restaurant.co.uk"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          onClick={submit}
          disabled={!email || state === 'sending'}
          className="rounded-lg bg-[#0E2A06] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#143b0a] disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Email me the template'}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-green-700"
        />
        <span>
          Also send me occasional allergen-compliance tips (optional — unsubscribe anytime).
        </span>
      </label>
      <p className="mt-2 text-xs text-gray-400">
        We&apos;ll email you the template link. We won&apos;t share your address, and unless you tick the box
        above we won&apos;t email you again. See our <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
