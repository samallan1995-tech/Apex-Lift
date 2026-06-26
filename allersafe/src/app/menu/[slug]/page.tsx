import { notFound } from 'next/navigation';
import { getVenueBySlug } from '@/lib/queries';
import { getDishesWithAllergens } from '@/lib/queries';
import { ALLERGENS } from '@/lib/allergens';
import { PublicMenuClient } from './PublicMenuClient';

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

  const dishes = await getDishesWithAllergens(venue.id);
  const availableDishes = dishes.filter(d => d.available);

  return (
    <PublicMenuClient venue={venue} dishes={availableDishes} allergens={ALLERGENS} />
  );
}
