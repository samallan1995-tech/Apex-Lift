import Link from 'next/link';
import type { DishWithAllergens, Venue } from '@/types';
import { ALLERGENS, emptyAllergenMap, type AllergenKey } from '@/lib/allergens';
import { PublicMenuClient } from '../menu/[slug]/PublicMenuClient';

export const metadata = {
  title: 'Live example allergen menu — AllerSafe',
  description:
    'Try a real AllerSafe QR allergen menu. Tap the allergens you need to avoid and see which dishes are safe — exactly what your customers would see.',
  alternates: { canonical: 'https://allersafe.org/demo' },
};

const DEMO_VENUE: Venue = {
  id: 'demo-venue',
  name: 'The Corner Bakery (example)',
  slug: 'demo',
  address: '12 Market Street, York',
  created_by: 'demo',
  created_at: 0,
};

function dish(
  id: string,
  name: string,
  description: string,
  allergens: AllergenKey[]
): DishWithAllergens {
  const map = emptyAllergenMap();
  for (const k of allergens) map[k] = true;
  return {
    id,
    venue_id: DEMO_VENUE.id,
    name,
    description,
    available: true,
    created_at: 0,
    allergens: map,
    ingredients: [],
  };
}

const DEMO_DISHES: DishWithAllergens[] = [
  dish('d1', 'Sourdough loaf', 'Slow-fermented white sourdough, baked daily.', ['cereals_gluten']),
  dish('d2', 'Cheese & tomato toastie', 'Mature cheddar and tomato on thick-cut bloomer.', ['cereals_gluten', 'milk']),
  dish('d3', 'Chicken & pesto baguette', 'Roast chicken, basil pesto, rocket.', ['cereals_gluten', 'milk', 'tree_nuts']),
  dish('d4', 'Carrot cake', 'With walnuts and cream-cheese frosting.', ['cereals_gluten', 'eggs', 'milk', 'tree_nuts']),
  dish('d5', 'Peanut butter flapjack', 'Oats, peanut butter, honey.', ['cereals_gluten', 'peanuts']),
  dish('d6', 'Tomato & basil soup', 'Served with a sourdough chunk on the side.', ['celery']),
  dish('d7', 'Falafel & hummus salad box', 'Chickpea falafel, hummus, seasonal leaves.', ['sesame']),
  dish('d8', 'Bakewell tart', 'Almond frangipane, raspberry jam, shortcrust.', ['cereals_gluten', 'eggs', 'milk', 'tree_nuts']),
  dish('d9', 'Fruit salad pot', 'Fresh seasonal fruit. No declared allergens.', []),
  dish('d10', 'Smoked salmon bagel', 'Smoked salmon and chive cream cheese.', ['cereals_gluten', 'fish', 'milk', 'sesame']),
];

export default function DemoMenuPage() {
  return (
    <div>
      {/* Demo banner */}
      <div className="bg-[#0E2A06] text-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold text-[#9DE26B]">Example menu.</span>{' '}
            This is what your customers see when they scan your QR code — try the filters.
          </p>
          <Link
            href="/login"
            className="text-xs font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-lg px-3 py-1.5 shrink-0"
          >
            Build yours free
          </Link>
        </div>
      </div>
      <PublicMenuClient venue={DEMO_VENUE} dishes={DEMO_DISHES} allergens={ALLERGENS} />
    </div>
  );
}
