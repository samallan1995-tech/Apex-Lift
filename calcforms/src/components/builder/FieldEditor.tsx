'use client'
import { useState } from 'react'
import { FormField, FieldOption } from '@/lib/types'
import { ConditionalLogic, ConditionalRule } from '@/lib/formula-engine'

const OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'contains', label: 'contains' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
]

export default function FieldEditor({
  field, allFields, onChange, onClose
}: {
  field: FormField
  allFields: FormField[]
  onChange: (f: FormField) => void
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<'settings' | 'logic'>('settings')

  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch })
  }

  function updateOption(index: number, patch: Partial<FieldOption>) {
    const options = [...(field.options || [])]
    options[index] = { ...options[index], ...patch }
    update({ options })
  }

  function addOption() {
    const n = (field.options?.length || 0) + 1
    update({ options: [...(field.options || []), { label: `Option ${n}`, value: `option_${n}` }] })
  }

  function removeOption(index: number) {
    const options = [...(field.options || [])]
    options.splice(index, 1)
    update({ options })
  }

  function updateLogic(logic: ConditionalLogic | undefined) {
    update({ conditionalLogic: logic })
  }

  function addRule() {
    const otherFields = allFields.filter(f => f.id !== field.id && f.type !== 'heading' && f.type !== 'paragraph')
    if (otherFields.length === 0) return
    const currentLogic = field.conditionalLogic || { action: 'show', match: 'all', rules: [] }
    const newRule: ConditionalRule = { fieldId: otherFields[0].id, operator: 'equals', value: '' }
    updateLogic({ ...currentLogic, rules: [...currentLogic.rules, newRule] })
  }

  function updateRule(index: number, patch: Partial<ConditionalRule>) {
    const logic = field.conditionalLogic!
    const rules = [...logic.rules]
    rules[index] = { ...rules[index], ...patch }
    updateLogic({ ...logic, rules })
  }

  function removeRule(index: number) {
    const logic = field.conditionalLogic!
    const rules = logic.rules.filter((_, i) => i !== index)
    updateLogic(rules.length === 0 ? undefined : { ...logic, rules })
  }

  const otherFields = allFields.filter(f => f.id !== field.id && f.type !== 'heading' && f.type !== 'paragraph')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Edit Field</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
      <div className="flex border-b border-gray-100">
        {(['settings', 'logic'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-2.5 font-medium capitalize transition-colors ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'settings' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Field ID <span className="font-mono text-gray-300">(used in formulas)</span></label>
              <input value={field.id} disabled className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 font-mono text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <input
                value={field.label}
                onChange={e => update({ label: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {field.type !== 'heading' && field.type !== 'paragraph' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                  <input
                    value={field.placeholder || ''}
                    onChange={e => update({ placeholder: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Enter a value..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Help text</label>
                  <input
                    value={field.helpText || ''}
                    onChange={e => update({ helpText: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={e => update({ required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>
              </>
            )}

            {(field.type === 'number' || field.type === 'currency') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
                  <input type="number" value={field.min ?? ''} onChange={e => update({ min: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
                  <input type="number" value={field.max ?? ''} onChange={e => update({ max: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            )}

            {field.type === 'currency' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prefix</label>
                <input value={field.prefix || '£'} onChange={e => update({ prefix: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            {field.type === 'select' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Options</label>
                <div className="space-y-2">
                  {(field.options || []).map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={opt.label}
                        onChange={e => updateOption(i, { label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_') })}
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Option label"
                      />
                      <button onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400 text-sm shrink-0">×</button>
                    </div>
                  ))}
                  <button onClick={addOption} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add option</button>
                </div>
              </div>
            )}

            {field.type === 'paragraph' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                <textarea
                  value={field.helpText || ''}
                  onChange={e => update({ helpText: e.target.value })}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paragraph text..."
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'logic' && (
          <div>
            <div className="text-xs text-gray-500 mb-3">
              Control when this field is shown based on other fields' values.
            </div>
            {!field.conditionalLogic ? (
              <div className="text-center py-6">
                <button onClick={() => {
                  updateLogic({ action: 'show', match: 'all', rules: [] })
                  addRule()
                }} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  + Add conditional logic
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={field.conditionalLogic.action}
                    onChange={e => updateLogic({ ...field.conditionalLogic!, action: e.target.value as 'show' | 'hide' })}
                    className="border border-gray-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                  </select>
                  <span className="text-gray-600 text-xs">this field when</span>
                  <select
                    value={field.conditionalLogic.match}
                    onChange={e => updateLogic({ ...field.conditionalLogic!, match: e.target.value as 'all' | 'any' })}
                    className="border border-gray-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="all">ALL</option>
                    <option value="any">ANY</option>
                  </select>
                  <span className="text-gray-600 text-xs">rules match:</span>
                </div>

                {field.conditionalLogic.rules.map((rule, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <select
                      value={rule.fieldId}
                      onChange={e => updateRule(i, { fieldId: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                    >
                      {otherFields.map(f => (
                        <option key={f.id} value={f.id}>{f.label} ({f.id})</option>
                      ))}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={e => updateRule(i, { operator: e.target.value as ConditionalRule['operator'] })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                    >
                      {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    {rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && (
                      <input
                        value={String(rule.value || '')}
                        onChange={e => updateRule(i, { value: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                        placeholder="Value..."
                      />
                    )}
                    <button onClick={() => removeRule(i)} className="text-xs text-red-500 hover:text-red-600">Remove rule</button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button onClick={addRule} disabled={otherFields.length === 0} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add rule</button>
                  <button onClick={() => updateLogic(undefined)} className="text-xs text-red-500 hover:text-red-600 ml-auto">Remove all logic</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
