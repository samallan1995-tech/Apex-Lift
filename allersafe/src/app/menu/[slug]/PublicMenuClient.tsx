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
  const filtering = excluded.size > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0E2A06] text-white px-4 pt-6 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-[#9DE26B] text-[#0E2A06]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight">{venue.name}</h1>
              {venue.address && <p className="text-[#9DCB8A] text-sm truncate">{venue.address}</p>}
            </div>
          </div>
          <p className="text-[#C0DD97] text-sm mt-3">
            Allergen menu — tap what you&apos;re allergic to and we&apos;ll show the dishes that don&apos;t contain it.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4 space-y-4">
        {/* Allergy picker */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 -mt-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-gray-900 text-sm">I&apos;m allergic to…</h2>
            {filtering && (
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                {excluded.size} selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {allergens.map(a => {
              const inMenu = allergenInAnyDish(a.key);
              const selected = excluded.has(a.key as AllergenKey);
              return (
                <button
                  key={a.key}
                  onClick={() => inMenu && toggle(a.key as AllergenKey)}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-left text-sm transition-all',
                    !inMenu ? 'opacity-40 cursor-default border-gray-100 bg-gray-50 text-gray-500' :
                    selected
                      ? 'border-red-400 bg-red-50 text-red-800 font-semibold ring-1 ring-red-300'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#9DE26B] active:scale-[0.98]'
                  )}
                >
                  <span aria-hidden="true">{a.emoji}</span>
                  <span className="leading-tight">{a.label}</span>
                  {selected && <span className="ml-auto text-red-500 font-bold">✕</span>}
                </button>
              );
            })}
          </div>
          {filtering && (
            <button
              onClick={() => setExcluded(new Set())}
              className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
            >
              Clear all — show everything
            </button>
          )}
        </div>

        {/* Result summary */}
        {filtering && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3.5 text-sm font-semibold flex items-center gap-2.5',
              safeDishes.length > 0
                ? 'bg-[#EAF3DE] text-[#173404] border border-[#C0DD97]'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            )}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-white/70 text-base" aria-hidden="true">
              {safeDishes.length > 0 ? '✅' : '⚠️'}
            </span>
            {safeDishes.length > 0
              ? `${safeDishes.length} of ${dishes.length} dishes don't contain your allergen${excluded.size > 1 ? 's' : ''}`
              : 'No dishes match — please speak to a member of staff'}
          </div>
        )}

        {/* Dishes */}
        <div className="space-y-2">
          {!filtering && (
            <h2 className="font-bold text-gray-900 text-sm px-1">All dishes ({dishes.length})</h2>
          )}

          {safeDishes.length === 0 && filtering ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-4xl mb-2" aria-hidden="true">🤝</p>
              <p className="text-gray-700 font-semibold">Let&apos;s find you something safe</p>
              <p className="text-gray-500 text-sm mt-1">
                Nothing on the standard menu avoids all of those allergens — but the kitchen may be able
                to adapt a dish. Please ask a member of staff.
              </p>
            </div>
          ) : (
            safeDishes.map(dish => (
              <div key={dish.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900">{dish.name}</p>
                  {filtering && (
                    <span className="shrink-0 text-[11px] font-bold text-[#27500A] bg-[#EAF3DE] rounded-full px-2 py-0.5">
                      Safe for you ✓
                    </span>
                  )}
                </div>
                {dish.description && <p className="text-gray-500 text-sm mt-0.5">{dish.description}</p>}
                <div className="mt-2">
                  <AllergenBadgeList allergens={dish.allergens} size="xs" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Important:</strong> &quot;Safe for you&quot; means the dish&apos;s recipe does not contain the
            allergens you selected — always tell staff about your allergy before ordering.
            Cross-contamination can occur in any kitchen, and {venue.name} cannot guarantee dishes are
            entirely free from any allergen.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Powered by <a href="https://allersafe.org" className="font-semibold text-[#3B6D11] hover:underline">AllerSafe</a> — allergen menus for food businesses
        </p>
      </div>
    </div>
  );
}
