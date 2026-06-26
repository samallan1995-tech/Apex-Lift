'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVenue } from '@/lib/venue-context';
import type { DishWithAllergens, Ingredient } from '@/types';
import { ALLERGEN_KEYS } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';

export default function DashboardPage() {
  const { activeVenueId, venues } = useVenue();
  const [dishes, setDishes] = useState<DishWithAllergens[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeVenueId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/dishes?venue_id=${activeVenueId}`).then(r => r.json()),
      fetch(`/api/ingredients?venue_id=${activeVenueId}`).then(r => r.json()),
    ])
      .then(([d, i]) => { setDishes(d); setIngredients(i); })
      .finally(() => setLoading(false));
  }, [activeVenueId]);

  const venue = venues.find(v => v.id === activeVenueId);

  const allergenCoverage = ALLERGEN_KEYS.reduce((acc, key) => {
    acc[key] = dishes.filter(d => d.allergens[key as AllergenKey]).length;
    return acc;
  }, {} as Record<string, number>);

  const topAllergens = Object.entries(allergenCoverage)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (!activeVenueId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-xl font-semibold text-gray-700">Create your first venue</h2>
        <p className="text-gray-500 mt-2 text-sm max-w-xs">Click the venue switcher in the sidebar to create your first venue and start adding dishes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{venue?.name ?? 'Dashboard'}</h1>
        {venue?.address && <p className="text-gray-500 text-sm mt-0.5">{venue.address}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Dishes', value: dishes.length, icon: '🍽️', href: '/dashboard/dishes' },
          { label: 'Ingredients', value: ingredients.length, icon: '🥗', href: '/dashboard/ingredients' },
          { label: 'Allergens declared', value: Object.values(allergenCoverage).filter(v => v > 0).length, icon: '⚠️', href: '/dashboard/matrix' },
          { label: 'Available dishes', value: dishes.filter(d => d.available).length, icon: '✅', href: '/dashboard/dishes' },
        ].map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-400 hover:shadow-sm transition-all"
          >
            <p className="text-2xl">{stat.icon}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? '—' : stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add ingredient', href: '/dashboard/ingredients', icon: '➕' },
              { label: 'Add dish', href: '/dashboard/dishes', icon: '🍳' },
              { label: 'Download allergen matrix', href: `/api/pdf/matrix?venue_id=${activeVenueId}`, icon: '📥', external: true },
              { label: 'View public QR menu', href: `/menu/${venue?.slug}`, icon: '📱', external: true },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors group"
              >
                <span className="text-base">{action.icon}</span>
                <span>{action.label}</span>
                <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Top allergens */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Most common allergens</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : topAllergens.length === 0 ? (
            <p className="text-sm text-gray-400">No allergen data yet — add some dishes.</p>
          ) : (
            <div className="space-y-2">
              {topAllergens.map(([key, count]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span>{count} dish{count !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${Math.round((count / Math.max(dishes.length, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Legal responsibility reminder</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          AllerSafe is a management tool only. Your business remains legally responsible under UK food labelling law (including Natasha&apos;s Law / PPDS regulations) for verifying all allergen declarations against current supplier specifications, checking for cross-contamination risks, and ensuring labels are accurate before serving. Never rely solely on this software. Review your labels against supplier data regularly.
        </p>
      </div>
    </div>
  );
}
