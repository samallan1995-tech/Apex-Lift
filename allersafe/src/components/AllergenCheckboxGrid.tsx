'use client';
import { ALLERGENS } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';
import { cn } from '@/lib/utils';

interface Props {
  value: Record<AllergenKey, boolean>;
  onChange: (key: AllergenKey, checked: boolean) => void;
  disabled?: boolean;
}

export function AllergenCheckboxGrid({ value, onChange, disabled }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">UK FSA 14 Allergens</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ALLERGENS.map(a => {
          const checked = value[a.key as AllergenKey] ?? false;
          return (
            <label
              key={a.key}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors select-none',
                checked
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={e => onChange(a.key as AllergenKey, e.target.checked)}
                className="w-4 h-4 rounded accent-green-700"
              />
              <span className="text-sm">{a.emoji} {a.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
