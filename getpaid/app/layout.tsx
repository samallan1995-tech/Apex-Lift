import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'GetPaid — UK Late Payment Interest Calculator & Invoice Chaser',
    template: '%s | GetPaid',
  },
  description:
    'Free UK statutory late payment interest calculator for B2B invoices. Calculate interest under the Late Payment of Commercial Debts Act 1998, generate formal demand letters, and chase overdue invoices.',
  keywords: [
    'UK late payment interest calculator',
    'statutory interest B2B',
    'invoice chaser',
    'late payment act 1998',
    'letter before action',
    'commercial debt interest',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'GetPaid',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
