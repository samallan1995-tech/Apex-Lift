'use client';
import { useEffect, useState, useCallback } from 'react';
import { useVenue } from '@/lib/venue-context';
import type { DishWithAllergens, Ingredient } from '@/types';

import { AllergenBadgeList } from '@/components/AllergenBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

type IngredientRow = { ingredient_id: string; weight_grams: number };

export default function DishesPage() {
  const { activeVenueId } = useVenue();
  const [dishes, setDishes] = useState<DishWithAllergens[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'ingredients' | null>(null);
  const [selected, setSelected] = useState<DishWithAllergens | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dishIngredients, setDishIngredients] = useState<IngredientRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDishes = useCallback(async () => {
    if (!activeVenueId) return;
    setLoading(true);
    const res = await fetch(`/api/dishes?venue_id=${activeVenueId}`);
    setDishes(await res.json());
    setLoading(false);
  }, [activeVenueId]);

  const fetchIngredients = useCallback(async () => {
    if (!activeVenueId) return;
    const res = await fetch(`/api/ingredients?venue_id=${activeVenueId}`);
    setIngredients(await res.json());
  }, [activeVenueId]);

  useEffect(() => {
    fetchDishes();
    fetchIngredients();
  }, [fetchDishes, fetchIngredients]);

  function openAdd() {
    setName('');
    setDescription('');
    setSelected(null);
    setError('');
    setModal('add');
  }

  function openEdit(dish: DishWithAllergens) {
    setName(dish.name);
    setDescription(dish.description ?? '');
    setSelected(dish);
    setError('');
    setModal('edit');
  }

  function openIngredients(dish: DishWithAllergens) {
    setSelected(dish);
    setDishIngredients(dish.ingredients.map(i => ({ ingredient_id: i.ingredient_id, weight_grams: i.weight_grams })));
    setError('');
    setModal('ingredients');
  }

  async function handleSaveDish() {
    if (!name.trim() || !activeVenueId) return;
    setSaving(true);
    setError('');
    try {
      const url = modal === 'add' ? '/api/dishes' : `/api/dishes/${selected!.id}`;
      const method = modal === 'add' ? 'POST' : 'PATCH';
      const body = {
        ...(modal === 'add' ? { venue_id: activeVenueId } : {}),
        name,
        description: description || null,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      await fetchDishes();
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveIngredients() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/dishes/${selected.id}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: dishIngredients.filter(i => i.ingredient_id) }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDishes();
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailable(dish: DishWithAllergens) {
    await fetch(`/api/dishes/${dish.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: dish.name, description: dish.description, available: !dish.available }),
    });
    fetchDishes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this dish?')) return;
    await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    setDishes(prev => prev.filter(d => d.id !== id));
  }

  function addIngredientRow() {
    setDishIngredients(prev => [...prev, { ingredient_id: '', weight_grams: 0 }]);
  }

  function updateIngredientRow(idx: number, field: keyof IngredientRow, value: string | number) {
    setDishIngredients(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  function removeIngredientRow(idx: number) {
    setDishIngredients(prev => prev.filter((_, i) => i !== idx));
  }

  const filtered = dishes.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  if (!activeVenueId) return <p className="text-gray-500 text-sm">Select or create a venue first.</p>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Dishes</h1>
        <Button onClick={openAdd}>+ Add dish</Button>
      </div>

      <Input placeholder="Search dishes…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">🍽️</p>
          <p className="text-gray-500 text-sm">{search ? 'No dishes match.' : 'No dishes yet — add your first one.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(dish => (
            <div key={dish.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{dish.name}</p>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full font-medium',
                      dish.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {dish.available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                  {dish.description && <p className="text-xs text-gray-500 mt-0.5">{dish.description}</p>}
                  <div className="mt-1.5">
                    <AllergenBadgeList allergens={dish.allergens} size="xs" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {dish.ingredients.length} ingredient{dish.ingredients.length !== 1 ? 's' : ''}
                    {dish.ingredients.length > 0 && ': ' + dish.ingredients.slice(0, 3).map(i => i.ingredient_name).join(', ')}
                    {dish.ingredients.length > 3 && '…'}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" onClick={() => openIngredients(dish)}>Ingredients</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleAvailable(dish)}>
                    {dish.available ? 'Hide' : 'Show'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(dish)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(dish.id)}>Del</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit dish modal */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add dish' : `Edit — ${selected?.name}`}
      >
        <div className="space-y-3">
          <Input label="Dish name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Caesar Salad" autoFocus />
          <Input label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description for the QR menu" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSaveDish} loading={saving} disabled={!name.trim()}>
              {modal === 'add' ? 'Create dish' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Ingredients modal */}
      <Modal open={modal === 'ingredients'} onClose={() => setModal(null)} title={`Ingredients — ${selected?.name}`} size="lg">
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter weight in grams for each ingredient — they will appear on PPDS labels in descending order (heaviest first). Allergens are rolled up automatically.
          </p>

          <div className="space-y-2">
            {dishIngredients.map((row, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={row.ingredient_id}
                  onChange={e => updateIngredientRow(idx, 'ingredient_id', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                >
                  <option value="">— Select ingredient —</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={row.weight_grams}
                  onChange={e => updateIngredientRow(idx, 'weight_grams', parseFloat(e.target.value) || 0)}
                  placeholder="g"
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
                <span className="text-xs text-gray-500 w-4">g</span>
                <button onClick={() => removeIngredientRow(idx)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addIngredientRow}>+ Add ingredient</Button>

          {ingredients.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              No ingredients in library yet. Add some on the Ingredients page first.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSaveIngredients} loading={saving}>Save ingredients</Button>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
