import { AuthForm } from '@/components/AuthForm';

export const metadata = {
  title: 'Start your free 14-day trial — AllerSafe',
  description:
    "Create your AllerSafe account with just an email — no password, no card. Natasha's Law labels, allergen matrix and QR menus, free for 14 days.",
  alternates: { canonical: 'https://allersafe.org/signup' },
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
