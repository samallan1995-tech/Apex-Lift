import { AuthForm } from '@/components/AuthForm';

export const metadata = {
  title: 'Sign in — AllerSafe',
  description: 'Sign in to AllerSafe with a one-time email code — no password needed.',
  robots: { index: false },
};

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
