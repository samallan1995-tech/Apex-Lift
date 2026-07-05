import { ALLERGENS } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';
import { cn } from '@/lib/utils';

interface Props {
  allergenKey: AllergenKey;
  size?: 'xs' | 'sm';
}

export function AllergenBadge({ allergenKey, size = 'sm' }: Props) {
  const allergen = ALLERGENS.find(a => a.key === allergenKey);
  if (!allergen) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200',
        size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'
      )}
      title={allergen.label}
    >
      <span>{allergen.emoji}</span>
      <span>{allergen.short}</span>
    </span>
  );
}

interface AllergenBadgeListProps {
  allergens: Record<AllergenKey, boolean>;
  size?: 'xs' | 'sm';
}

export function AllergenBadgeList({ allergens, size = 'sm' }: AllergenBadgeListProps) {
  const present = Object.entries(allergens)
    .filter(([, v]) => v)
    .map(([k]) => k as AllergenKey);

  if (present.length === 0) {
    return <span className="text-xs text-gray-400 italic">No allergens declared</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {present.map(k => <AllergenBadge key={k} allergenKey={k} size={size} />)}
    </div>
  );
}
