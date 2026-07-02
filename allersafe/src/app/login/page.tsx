'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  async function handleSend() {
    if (!email || !agreed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, agreed }),
      });
      if (!res.ok) throw new Error('Failed to send code');
      setStep('code');
    } catch {
      setError('Could not send code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Invalid code');
      }
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0E2A06]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#9DE26B] text-[#0E2A06]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <span className="text-2xl font-bold text-white">AllerSafe</span>
          </Link>
          <p className="text-[#9DE26B] mt-3 text-sm font-medium">14 days free · no payment for 2 weeks · cancel anytime</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-black/5 p-7">
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Start your free trial</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we&apos;ll send a one-time code — no password, and <strong>no card needed</strong>. You won&apos;t be charged anything for 14 days, and you can cancel anytime.
                </p>
              </div>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="you@restaurant.co.uk"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-green-700 focus:ring-green-600"
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3B6D11] underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3B6D11] underline">Privacy Policy</a>,
                  including that my business is responsible for verifying all allergen information.
                </span>
              </label>
              <Button className="w-full" size="lg" onClick={handleSend} loading={loading} disabled={!email || !agreed}>
                Email me a login code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-character code to <strong>{email}</strong>. It expires in 15 minutes.
                </p>
              </div>
              <Input
                label="Login code"
                type="text"
                autoCapitalize="characters"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="K7M2PQ"
                className="tracking-[0.4em] font-mono uppercase"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" size="lg" onClick={handleVerify} loading={loading} disabled={code.length !== 6}>
                Verify &amp; continue
              </Button>
              <button
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[#C0DD97] mt-6">
          Want the details first?{' '}
          <Link href="/pricing" className="font-semibold text-white hover:underline">
            See plans &amp; pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
