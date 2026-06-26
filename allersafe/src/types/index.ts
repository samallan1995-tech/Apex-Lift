import type { AllergenKey } from '@/lib/allergens';

export interface User {
  id: string;
  email: string;
  created_at: number;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  created_by: string;
  created_at: number;
}

export interface Ingredient {
  id: string;
  venue_id: string;
  name: string;
  notes: string | null;
  created_at: number;
  celery: boolean;
  cereals_gluten: boolean;
  crustaceans: boolean;
  eggs: boolean;
  fish: boolean;
  lupin: boolean;
  milk: boolean;
  molluscs: boolean;
  mustard: boolean;
  tree_nuts: boolean;
  peanuts: boolean;
  sesame: boolean;
  soybeans: boolean;
  sulphites: boolean;
}

export interface Dish {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  available: boolean;
  created_at: number;
}

export interface DishIngredient {
  id: string;
  dish_id: string;
  ingredient_id: string;
  weight_grams: number;
  ingredient_name: string;
  celery: boolean;
  cereals_gluten: boolean;
  crustaceans: boolean;
  eggs: boolean;
  fish: boolean;
  lupin: boolean;
  milk: boolean;
  molluscs: boolean;
  mustard: boolean;
  tree_nuts: boolean;
  peanuts: boolean;
  sesame: boolean;
  soybeans: boolean;
  sulphites: boolean;
}

export interface DishWithAllergens extends Dish {
  allergens: Record<AllergenKey, boolean>;
  ingredients: DishIngredient[];
}

export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn?: boolean;
}
