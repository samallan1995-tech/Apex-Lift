import type { Metadata } from 'next';
import LoginClient from './LoginClient';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign In — GetPaid',
  description: 'Sign in to GetPaid with a passwordless magic link.',
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-brand-700">
            GetPaid
          </a>
          <p className="mt-2 text-sm text-gray-600">Sign in with a one-time code — no password needed.</p>
        </div>
        <LoginClient />
        <p className="mt-6 text-center text-xs text-gray-400">
          No account? Just enter your email and we&apos;ll create one for you.
        </p>
      </div>
    </div>
  );
}
