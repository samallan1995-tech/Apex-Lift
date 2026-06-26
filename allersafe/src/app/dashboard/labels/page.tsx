'use client';
import { useEffect, useState, useCallback } from 'react';
import { useVenue } from '@/lib/venue-context';
import type { DishWithAllergens } from '@/types';
import { ALLERGEN_KEYS } from '@/lib/allergens';
import { AllergenBadgeList } from '@/components/AllergenBadge';
import { Button } from '@/components/ui/Button';

export default function LabelsPage() {
  const { activeVenueId } = useVenue();
  const [dishes, setDishes] = useState<DishWithAllergens[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchDishes = useCallback(async () => {
    if (!activeVenueId) return;
    setLoading(true);
    const res = await fetch(`/api/dishes?venue_id=${activeVenueId}`);
    setDishes(await res.json());
    setLoading(false);
  }, [activeVenueId]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  async function downloadLabel(dish: DishWithAllergens) {
    setDownloading(dish.id);
    try {
      const res = await fetch(`/api/pdf/label/${dish.id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ppds-label-${dish.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  if (!activeVenueId) return <p className="text-gray-500 text-sm">Select or create a venue first.</p>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">PPDS Labels</h1>
        <p className="text-sm text-gray-500 mt-0.5">Natasha&apos;s Law compliant labels for pre-packed for direct sale (PPDS) food</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          <strong>Legal reminder:</strong> PPDS labels must show the product name and a full ingredient list with the 14 allergens emphasised (bold/caps/colour). Your business is legally responsible for accuracy. Verify against supplier specifications before use. These labels are provided as an aid only.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">What&apos;s on the label?</h3>
        <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
          <li>Product (dish) name</li>
          <li>All ingredients in descending weight order</li>
          <li>Allergens highlighted in BOLD CAPS</li>
          <li>Contains summary section</li>
          <li>A4 sheet of 8 cut-out labels + single label page</li>
        </ul>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">🏷️</p>
          <p className="text-gray-500 text-sm">No dishes yet — add some on the Dishes page.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {dishes.map(dish => {
            const ingredientsSorted = [...dish.ingredients].sort((a, b) => b.weight_grams - a.weight_grams);
            const hasIngredients = dish.ingredients.length > 0;

            return (
              <div key={dish.id} className="bg-white rounded-xl border border-gray-200 p-4">
                {/* Label preview */}
                <div className="border-2 border-green-700 rounded-lg p-3 mb-3 text-xs font-mono bg-gray-50">
                  <p className="font-bold text-sm text-gray-900 mb-1">{dish.name}</p>
                  {dish.description && <p className="text-gray-500 mb-2 text-xs">{dish.description}</p>}

                  <p className="text-gray-500 uppercase text-[10px] tracking-wide font-semibold mb-0.5">Ingredients:</p>
                  <p className="text-gray-800 leading-relaxed text-[11px]">
                    {!hasIngredients ? (
                      <span className="text-gray-400 italic">No ingredients listed yet</span>
                    ) : (
                      ingredientsSorted.map((ing, idx) => {
                        const isAllergen = ALLERGEN_KEYS.some(k => ing[k as keyof typeof ing]);
                        return (
                          <span key={ing.ingredient_id}>
                            {isAllergen ? (
                              <strong className="uppercase">{ing.ingredient_name}</strong>
                            ) : (
                              ing.ingredient_name
                            )}
                            {idx < ingredientsSorted.length - 1 ? ', ' : '.'}
                          </span>
                        );
                      })
                    )}
                  </p>

                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <AllergenBadgeList allergens={dish.allergens} size="xs" />
                  </div>
                </div>

                {!hasIngredients && (
                  <p className="text-xs text-amber-600 mb-2">⚠️ Add ingredients via the Dishes page to generate a label.</p>
                )}

                <Button
                  className="w-full"
                  size="sm"
                  variant="secondary"
                  loading={downloading === dish.id}
                  disabled={!hasIngredients}
                  onClick={() => downloadLabel(dish)}
                >
                  ↓ Download PDF label
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
