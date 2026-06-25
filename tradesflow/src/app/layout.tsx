import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SWRegistrar } from '@/components/layout/sw-registrar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TradesFlow — Job Management for UK Trades',
  description: 'Drag-drop calendar, SMS reminders, one-click quoting for small trades businesses',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TradesFlow',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <SWRegistrar />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
            duration: 3000,
          }}
        />
      </body>
    </html>
  )
}
