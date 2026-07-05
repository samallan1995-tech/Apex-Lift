'use client';
import { useState } from 'react';

export function EnquiryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit() {
    if (!name || !email) return;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/menu-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
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
        <p className="text-lg font-bold text-green-900">Enquiry sent ✅</p>
        <p className="mt-1 text-sm text-green-800">
          Thanks {name.split(' ')[0]} — we&apos;ll reply within one working day to arrange your menu import.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mi-name" className="text-sm font-medium text-gray-700">Your name</label>
          <input
            id="mi-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Sam Smith"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label htmlFor="mi-email" className="text-sm font-medium text-gray-700">Email address</label>
          <input
            id="mi-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@restaurant.co.uk"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>
      <div>
        <label htmlFor="mi-msg" className="text-sm font-medium text-gray-700">
          Anything we should know? <span className="text-gray-400 font-normal">(optional — or we&apos;ll reply to arrange it)</span>
        </label>
        <textarea
          id="mi-msg"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="e.g. Café with ~40 menu items, menu is a PDF, allergen info in supplier spec sheets…"
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={!name || !email || state === 'sending'}
        className="rounded-xl bg-[#0E2A06] px-6 py-3 text-sm font-semibold text-white hover:bg-[#143b0a] disabled:opacity-60"
      >
        {state === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
    </div>
  );
}
