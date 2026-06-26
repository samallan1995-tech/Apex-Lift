'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import type { Venue } from '@/types';
import { VenueProvider, useVenue } from '@/lib/venue-context';
import { VenueSwitcher } from '@/components/VenueSwitcher';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊', exact: true },
  { href: '/dashboard/ingredients', label: 'Ingredients', icon: '🥗' },
  { href: '/dashboard/dishes', label: 'Dishes', icon: '🍽️' },
  { href: '/dashboard/matrix', label: 'Allergen Matrix', icon: '📋' },
  { href: '/dashboard/labels', label: 'PPDS Labels', icon: '🏷️' },
  { href: '/dashboard/qr', label: 'QR Menu', icon: '📱' },
  { href: '/dashboard/billing', label: 'Billing & plan', icon: '💳' },
];

interface Props {
  email: string;
  venues: Venue[];
  children: React.ReactNode;
}

export function DashboardShell({ email, venues, children }: Props) {
  return (
    <VenueProvider initialVenues={venues}>
      <Inner email={email}>{children}</Inner>
    </VenueProvider>
  );
}

function Inner({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeVenueId, venues, setActiveVenueId, addVenue } = useVenue();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-green-900 text-white transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="font-bold text-lg leading-none">AllerSafe</p>
            <p className="text-xs text-green-300 mt-0.5">Allergen management</p>
          </div>
        </div>

        {/* Venue switcher */}
        <div className="px-3 py-3 border-b border-green-800">
          <VenueSwitcher
            venues={venues}
            activeVenueId={activeVenueId}
            onSwitch={setActiveVenueId}
            onCreated={addVenue}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800 hover:text-white'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-green-800 space-y-2">
          <p className="text-xs text-green-400 truncate">{email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-green-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z" clipRule="evenodd" />
            </svg>
          </button>
          {!activeVenueId && venues.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              No venue yet — click the venue switcher to create one.
            </p>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
