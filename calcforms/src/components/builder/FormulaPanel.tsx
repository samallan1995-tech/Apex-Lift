'use client'
import { useState } from 'react'
import { Formula, FormField } from '@/lib/types'

export default function FormulaPanel({
  formulas, fields, onChange
}: {
  formulas: Formula[]
  fields: FormField[]
  onChange: (formulas: Formula[]) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function addFormula() {
    const n = formulas.length + 1
    const newFormula: Formula = {
      name: `formula_${n}`,
      fieldId: `calc_${n}_${Date.now().toString(36)}`,
      expression: '',
      label: `Calculation ${n}`,
      format: 'number',
    }
    onChange([...formulas, newFormula])
    setEditingIndex(formulas.length)
  }

  function updateFormula(index: number, patch: Partial<Formula>) {
    const updated = formulas.map((f, i) => i === index ? { ...f, ...patch } : f)
    onChange(updated)
  }

  function removeFormula(index: number) {
    onChange(formulas.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const availableFields = fields.filter(f => f.type !== 'heading' && f.type !== 'paragraph')

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="text-xs text-gray-400 mb-3 px-1 leading-relaxed">
        Formulas compute values from field inputs. Reference fields by their ID or formula name. Use: <code className="bg-gray-100 px-1 rounded">+  -  *  /  IF(cond, a, b)  round(x, 2)</code>
      </div>

      {formulas.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">∑</div>
          <p className="text-xs text-gray-400 mb-3">No formulas yet</p>
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {formulas.map((formula, i) => (
            <div key={i} className={`border rounded-lg overflow-hidden transition-all ${editingIndex === i ? 'border-indigo-300 shadow-sm' : 'border-gray-100'}`}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setEditingIndex(editingIndex === i ? null : i)}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{formula.label || formula.name}</div>
                  <div className="text-xs text-gray-400 font-mono truncate mt-0.5">{formula.expression || 'No expression'}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{formula.format || 'num'}</span>
                  <span className="text-gray-400 text-xs">{editingIndex === i ? '▲' : '▼'}</span>
                </div>
              </div>

              {editingIndex === i && (
                <div className="border-t border-gray-100 p-3 space-y-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Display label</label>
                    <input
                      value={formula.label || ''}
                      onChange={e => updateFormula(i, { label: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Formula name <span className="text-gray-400">(for cross-references)</span></label>
                    <input
                      value={formula.name}
                      onChange={e => updateFormula(i, { name: e.target.value.replace(/[^a-z0-9_]/gi, '_') })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expression</label>
                    <textarea
                      value={formula.expression}
                      onChange={e => updateFormula(i, { expression: e.target.value })}
                      rows={3}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. hours * rate * 1.2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
                    <select
                      value={formula.format || 'number'}
                      onChange={e => updateFormula(i, { format: e.target.value as Formula['format'] })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                    >
                      <option value="number">Number</option>
                      <option value="currency">Currency (£)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Available field IDs</label>
                    <div className="flex flex-wrap gap-1">
                      {availableFields.map(f => (
                        <span key={f.id} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-indigo-100"
                          onClick={() => updateFormula(i, { expression: formula.expression + f.id })}
                          title={f.label}
                        >
                          {f.id}
                        </span>
                      ))}
                      {formulas.filter((_, fi) => fi !== i).map(f => (
                        <span key={f.name} className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-purple-100"
                          onClick={() => updateFormula(i, { expression: formula.expression + f.name })}
                          title={`Formula: ${f.label}`}
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeFormula(i)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    Delete formula
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={addFormula} className="w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 hover:border-indigo-400 rounded-lg py-2.5 transition-colors">
        + Add formula
      </button>
    </div>
  )
}
