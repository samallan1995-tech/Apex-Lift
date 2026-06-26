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

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-700 text-white text-3xl mb-4 shadow-lg">
            🛡️
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AllerSafe</h1>
          <p className="text-gray-500 mt-1">UK allergen labelling for food businesses</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {['Natasha\'s Law labels', 'Allergen matrix', 'QR menu', 'Multi-venue'].map(f => (
            <span key={f} className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">{f}</span>
          ))}
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>
                <p className="text-sm text-gray-500 mt-0.5">We&apos;ll email you a one-time code — no password needed.</p>
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
              <Button className="w-full" size="lg" onClick={handleSend} loading={loading} disabled={!email}>
                Send login code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
                </p>
              </div>
              <Input
                label="Login code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="123456"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" size="lg" onClick={handleVerify} loading={loading} disabled={code.length !== 6}>
                Verify & sign in
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

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{' '}
          <Link href="/pricing" className="font-medium text-green-700 hover:text-green-800 underline">
            See plans &amp; pricing
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          AllerSafe helps food businesses manage allergen information. The business remains legally responsible for verifying all allergen declarations against supplier specifications.
        </p>
      </div>
    </div>
  );
}
