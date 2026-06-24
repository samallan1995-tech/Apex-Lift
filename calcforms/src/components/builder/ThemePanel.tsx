'use client'
import { FormTheme } from '@/lib/types'

const PRESET_COLORS = [
  '#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#1e293b',
]

export default function ThemePanel({
  theme, onChange
}: {
  theme: FormTheme
  onChange: (t: FormTheme) => void
}) {
  function update(patch: Partial<FormTheme>) {
    onChange({ ...theme, ...patch })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Brand colour</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => update({ primaryColor: color })}
              style={{ backgroundColor: color }}
              className={`w-7 h-7 rounded-full border-2 transition-all ${theme.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
            />
          ))}
        </div>
        <input
          type="color"
          value={theme.primaryColor || '#4f46e5'}
          onChange={e => update({ primaryColor: e.target.value })}
          className="h-8 w-full rounded border border-gray-200 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button label</label>
        <input
          value={theme.buttonText || 'Submit'}
          onChange={e => update({ buttonText: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Success message</label>
        <textarea
          value={theme.successMessage || 'Thank you! Your response has been recorded.'}
          onChange={e => update({ successMessage: e.target.value })}
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Logo URL</label>
        <input
          value={theme.logo || ''}
          onChange={e => update({ logo: e.target.value })}
          placeholder="https://..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  )
}
