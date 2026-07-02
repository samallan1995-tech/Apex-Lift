import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AllerSafe — UK Allergen Labelling for Food Businesses',
  description: "Manage UK FSA allergen information, generate Natasha's Law PPDS labels, allergen matrices, and public QR menus for your food business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
