'use client';
import { useEffect } from 'react';

/**
 * Root error boundary. Catches otherwise-uncaught client render errors, reports
 * them to /api/error-report (so they land in Vercel logs), and shows a friendly
 * recovery screen instead of a white page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 20, color: '#111827', margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', maxWidth: 380, margin: '0 0 20px', lineHeight: 1.5 }}>
            We hit an unexpected error and our team has been notified. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{ background: '#0E2A06', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
