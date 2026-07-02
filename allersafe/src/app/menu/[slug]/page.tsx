import { notFound } from 'next/navigation';
import { getVenueBySlug, getDishesWithAllergens, hasActiveAccess } from '@/lib/queries';
import { ALLERGENS } from '@/lib/allergens';
import { PublicMenuClient } from './PublicMenuClient';

// Always render fresh: allergen data and the owner's access status must be
// current on every scan — never serve a stale cached menu.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function MenuUnavailable({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <span className="text-4xl mb-4" aria-hidden="true">🛡️</span>
      <h1 className="text-xl font-bold text-gray-900">{name}</h1>
      <p className="mt-2 text-gray-500 max-w-sm">
        This allergen menu is temporarily unavailable. Please ask a member of staff for allergen
        information before ordering.
      </p>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const venue = await getVenueBySlug(params.slug);
  if (!venue) return { title: 'Menu not found' };
  return {
    title: `${venue.name} — Allergen Menu`,
    description: `Check allergen information for ${venue.name}. Filter dishes by allergen to find what's safe for you.`,
  };
}

export default async function PublicMenuPage({ params }: { params: { slug: string } }) {
  const venue = await getVenueBySlug(params.slug);
  if (!venue) notFound();

  // The QR menu goes dark if the owning account's trial has lapsed without a plan.
  if (!(await hasActiveAccess(venue.created_by))) {
    return <MenuUnavailable name={venue.name} />;
  }

  const dishes = await getDishesWithAllergens(venue.id);
  const availableDishes = dishes.filter(d => d.available);

  return (
    <PublicMenuClient venue={venue} dishes={availableDishes} allergens={ALLERGENS} />
  );
}
