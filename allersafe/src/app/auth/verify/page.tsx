import { redirect } from 'next/navigation';

// Magic link verify is handled client-side on the login page.
// This route exists as a fallback redirect.
export default function VerifyPage() {
  redirect('/');
}
