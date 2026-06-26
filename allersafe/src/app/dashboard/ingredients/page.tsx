'use client';
import { useEffect, useState, useCallback } from 'react';
import { useVenue } from '@/lib/venue-context';
import type { Ingredient } from '@/types';
import { ALLERGEN_KEYS, emptyAllergenMap } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';
import { AllergenCheckboxGrid } from '@/components/AllergenCheckboxGrid';
import { AllergenBadgeList } from '@/components/AllergenBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type FormData = {
  name: string;
  notes: string;
  allergens: Record<AllergenKey, boolean>;
};

function blankForm(): FormData {
  return { name: '', notes: '', allergens: emptyAllergenMap() };
}

function ingredientToAllergens(ing: Ingredient): Record<AllergenKey, boolean> {
  return Object.fromEntries(ALLERGEN_KEYS.map(k => [k, !!(ing as unknown as Record<string, unknown>)[k]])) as Record<AllergenKey, boolean>;
}

export default function IngredientsPage() {
  const { activeVenueId } = useVenue();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<FormData>(blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    if (!activeVenueId) return;
    setLoading(true);
    const res = await fetch(`/api/ingredients?venue_id=${activeVenueId}`);
    const data = await res.json();
    setIngredients(data);
    setLoading(false);
  }, [activeVenueId]);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  function openAdd() {
    setForm(blankForm());
    setEditing(null);
    setError('');
    setModal('add');
  }

  function openEdit(ing: Ingredient) {
    setForm({ name: ing.name, notes: ing.notes ?? '', allergens: ingredientToAllergens(ing) });
    setEditing(ing);
    setError('');
    setModal('edit');
  }

  async function handleSave() {
    if (!form.name.trim() || !activeVenueId) return;
    setSaving(true);
    setError('');
    try {
      const url = modal === 'add' ? '/api/ingredients' : `/api/ingredients/${editing!.id}`;
      const method = modal === 'add' ? 'POST' : 'PATCH';
      const body = {
        ...(modal === 'add' ? { venue_id: activeVenueId } : {}),
        name: form.name,
        notes: form.notes || null,
        ...form.allergens,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      await fetchIngredients();
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ingredient? Dishes using it will lose this allergen data.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      setIngredients(prev => prev.filter(i => i.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  if (!activeVenueId) {
    return <p className="text-gray-500 text-sm">Select or create a venue first.</p>;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Ingredient Library</h1>
        <Button onClick={openAdd}>+ Add ingredient</Button>
      </div>

      <Input
        placeholder="Search ingredients…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">🥗</p>
          <p className="text-gray-500 text-sm">{search ? 'No ingredients match your search.' : 'No ingredients yet — add your first one.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(ing => {
            const allergens = ingredientToAllergens(ing);
            return (
              <div key={ing.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{ing.name}</p>
                  {ing.notes && <p className="text-xs text-gray-500 mt-0.5">{ing.notes}</p>}
                  <div className="mt-1.5">
                    <AllergenBadgeList allergens={allergens} size="xs" />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(ing)}>Edit</Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleting === ing.id}
                    onClick={() => handleDelete(ing.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add ingredient' : `Edit — ${editing?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Ingredient name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Wheat flour"
            autoFocus
          />
          <Input
            label="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. Organic, refined"
          />
          <AllergenCheckboxGrid
            value={form.allergens}
            onChange={(key, checked) => setForm(f => ({ ...f, allergens: { ...f.allergens, [key]: checked } }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} loading={saving} disabled={!form.name.trim()}>
              {modal === 'add' ? 'Add ingredient' : 'Save changes'}
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
