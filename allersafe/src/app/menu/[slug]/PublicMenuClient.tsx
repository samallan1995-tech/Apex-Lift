'use client';
import { useState } from 'react';
import type { DishWithAllergens, Venue } from '@/types';
import type { AllergenKey } from '@/lib/allergens';
import { AllergenBadgeList } from '@/components/AllergenBadge';
import { cn } from '@/lib/utils';

interface Props {
  venue: Venue;
  dishes: DishWithAllergens[];
  allergens: ReadonlyArray<{ key: string; label: string; emoji: string; short: string }>;
}

export function PublicMenuClient({ venue, dishes, allergens }: Props) {
  const [excluded, setExcluded] = useState<Set<AllergenKey>>(new Set());

  function toggle(key: AllergenKey) {
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const safeDishes = dishes.filter(dish =>
    Array.from(excluded).every(key => !dish.allergens[key])
  );

  const allergenInAnyDish = (key: string) => dishes.some(d => d.allergens[key as AllergenKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-800 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-xl font-bold">{venue.name}</h1>
              {venue.address && <p className="text-green-300 text-sm">{venue.address}</p>}
            </div>
          </div>
          <p className="text-green-200 text-sm mt-2">
            Allergen menu — tap allergens you need to avoid and we&apos;ll show safe dishes.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Filter section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">I need to avoid…</h2>
          <div className="grid grid-cols-2 gap-2">
            {allergens.map(a => {
              const inMenu = allergenInAnyDish(a.key);
              const selected = excluded.has(a.key as AllergenKey);
              return (
                <button
                  key={a.key}
                  onClick={() => inMenu && toggle(a.key as AllergenKey)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-colors',
                    !inMenu ? 'opacity-40 cursor-default border-gray-100 bg-gray-50 text-gray-500' :
                    selected
                      ? 'border-red-400 bg-red-50 text-red-800 font-medium'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  )}
                >
                  <span>{a.emoji}</span>
                  <span>{a.label}</span>
                  {selected && <span className="ml-auto text-red-500">✕</span>}
                </button>
              );
            })}
          </div>
          {excluded.size > 0 && (
            <button
              onClick={() => setExcluded(new Set())}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">
              {excluded.size === 0 ? 'All dishes' : `Safe dishes (${safeDishes.length} of ${dishes.length})`}
            </h2>
            {excluded.size > 0 && (
              <span className="text-xs text-gray-500">
                {dishes.length - safeDishes.length} hidden
              </span>
            )}
          </div>

          {safeDishes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-4xl mb-2">😔</p>
              <p className="text-gray-600 font-medium">No dishes match your filters</p>
              <p className="text-gray-500 text-sm mt-1">Try removing some filters or ask staff for more information.</p>
            </div>
          ) : (
            safeDishes.map(dish => (
              <div key={dish.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">{dish.name}</p>
                {dish.description && <p className="text-gray-500 text-sm mt-0.5">{dish.description}</p>}
                <div className="mt-2">
                  <AllergenBadgeList allergens={dish.allergens} size="xs" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Important:</strong> This information is provided as a guide. Always inform staff about your allergy or intolerance before ordering. Cross-contamination can occur in our kitchen. {venue.name} cannot guarantee dishes are entirely free from any allergen.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by AllerSafe — allergen management for food businesses
        </p>
      </div>
    </div>
  );
}
