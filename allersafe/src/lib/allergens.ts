export const ALLERGENS = [
  { key: 'celery',         label: 'Celery',                          short: 'Cel', emoji: '🌿' },
  { key: 'cereals_gluten', label: 'Cereals containing gluten',       short: 'Glu', emoji: '🌾' },
  { key: 'crustaceans',    label: 'Crustaceans',                     short: 'Cru', emoji: '🦐' },
  { key: 'eggs',           label: 'Eggs',                            short: 'Egg', emoji: '🥚' },
  { key: 'fish',           label: 'Fish',                            short: 'Fis', emoji: '🐟' },
  { key: 'lupin',          label: 'Lupin',                           short: 'Lup', emoji: '🌸' },
  { key: 'milk',           label: 'Milk',                            short: 'Mil', emoji: '🥛' },
  { key: 'molluscs',       label: 'Molluscs',                        short: 'Mol', emoji: '🦪' },
  { key: 'mustard',        label: 'Mustard',                         short: 'Mus', emoji: '🌻' },
  { key: 'tree_nuts',      label: 'Tree nuts',                       short: 'Nut', emoji: '🌰' },
  { key: 'peanuts',        label: 'Peanuts',                         short: 'Pea', emoji: '🥜' },
  { key: 'sesame',         label: 'Sesame',                          short: 'Ses', emoji: '⚪' },
  { key: 'soybeans',       label: 'Soybeans',                        short: 'Soy', emoji: '🫘' },
  { key: 'sulphites',      label: 'Sulphur dioxide & sulphites',     short: 'Sul', emoji: '💨' },
] as const;

export type AllergenKey = typeof ALLERGENS[number]['key'];
export const ALLERGEN_KEYS = ALLERGENS.map(a => a.key) as AllergenKey[];

export function allergenLabel(key: AllergenKey): string {
  return ALLERGENS.find(a => a.key === key)?.label ?? key;
}

export function emptyAllergenMap(): Record<AllergenKey, boolean> {
  return Object.fromEntries(ALLERGEN_KEYS.map(k => [k, false])) as Record<AllergenKey, boolean>;
}

export function rollupAllergens(
  maps: Array<Record<AllergenKey, boolean>>
): Record<AllergenKey, boolean> {
  const result = emptyAllergenMap();
  for (const map of maps) {
    for (const key of ALLERGEN_KEYS) {
      if (map[key]) result[key] = true;
    }
  }
  return result;
}
