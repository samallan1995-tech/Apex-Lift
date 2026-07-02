'use client';
import { useEffect, useState, useCallback } from 'react';
import { useVenue } from '@/lib/venue-context';
import type { DishWithAllergens } from '@/types';
import { ALLERGENS } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function MatrixPage() {
  const { activeVenueId } = useVenue();
  const [dishes, setDishes] = useState<DishWithAllergens[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchDishes = useCallback(async () => {
    if (!activeVenueId) return;
    setLoading(true);
    const res = await fetch(`/api/dishes?venue_id=${activeVenueId}`);
    const data = await res.json();
    setDishes(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeVenueId]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pdf/matrix?venue_id=${activeVenueId}`);
      if (!res.ok) { alert('Could not generate the PDF. Please try again.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'allergen-matrix.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!activeVenueId) return <p className="text-gray-500 text-sm">Select or create a venue first.</p>;

  const availableAllergens = ALLERGENS.filter(a =>
    dishes.some(d => d.allergens[a.key as AllergenKey])
  );
  const displayAllergens = availableAllergens.length > 0 ? availableAllergens : ALLERGENS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Allergen Matrix</h1>
          <p className="text-sm text-gray-500 mt-0.5">All 14 UK FSA allergens across your dishes</p>
        </div>
        <Button onClick={downloadPDF} loading={downloading} disabled={dishes.length === 0}>
          ↓ Download PDF
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          <strong>Disclaimer:</strong> This matrix is an aid only. Your business must verify all allergen information against current supplier specifications. Cross-contamination risks are not shown. Always check supplier data sheets before serving food.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-gray-500 text-sm">No dishes yet — add some on the Dishes page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-green-800 min-w-[180px]">Dish</th>
                  {displayAllergens.map(a => (
                    <th key={a.key} className="px-2 py-3 font-medium text-center min-w-[52px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-base">{a.emoji}</span>
                        <span className="text-xs">{a.short}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish, idx) => (
                  <tr key={dish.id} className={cn(idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-green-50 transition-colors')}>
                    <td className={cn('px-4 py-3 font-medium text-gray-900 sticky left-0', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                      <div>{dish.name}</div>
                      {!dish.available && <span className="text-xs text-gray-400">(hidden)</span>}
                    </td>
                    {displayAllergens.map(a => {
                      const has = dish.allergens[a.key as AllergenKey];
                      return (
                        <td key={a.key} className="px-2 py-3 text-center">
                          {has ? (
                            <span className="text-green-700 text-lg font-bold" title={`Contains ${a.label}`}>●</span>
                          ) : (
                            <span className="text-gray-200 text-lg" title={`Does not contain ${a.label}`}>○</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span><span className="text-green-700 font-bold">●</span> Contains allergen</span>
              <span><span className="text-gray-300">○</span> Not declared</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <span key={a.key} className="text-xs text-gray-500">
                  <strong>{a.short}</strong> = {a.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
