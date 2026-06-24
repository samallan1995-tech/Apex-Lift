'use client'
import { useState } from 'react'
import { FormField, Formula } from '@/lib/types'

export default function AIGenerateModal({
  onApply, onClose
}: {
  onApply: (schema: { fields: FormField[] }, formulas: Formula[]) => void
  onClose: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ schema: { fields: FormField[] }; formulas: Formula[] } | null>(null)

  async function generate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setPreview(null)
    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data = await res.json()
      setPreview(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    'Conveyancing quote intake for residential property purchase',
    'Self-assessment tax return fee estimator',
    'Consulting project proposal with hourly rates and VAT',
    'Employment tribunal eligibility assessment',
    'Payroll services quote calculator for small businesses',
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">✨ AI Form Generator</h2>
            <p className="text-xs text-gray-400 mt-0.5">Describe your form in plain English</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What kind of form do you need?</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. A conveyancing quote form for residential property purchases that calculates legal fees, disbursements and VAT based on property value and type"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Try an example:</div>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button key={i} onClick={() => setPrompt(ex)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-gray-600 transition-colors">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {preview && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm font-semibold text-green-800 mb-2">Generated successfully!</div>
              <div className="text-xs text-green-700">
                {preview.schema.fields.length} fields · {preview.formulas.length} formulas
              </div>
              <div className="mt-2 space-y-1">
                {preview.schema.fields.slice(0, 5).map((f: FormField) => (
                  <div key={f.id} className="text-xs text-green-800">• {f.label} <span className="text-green-500">({f.type})</span></div>
                ))}
                {preview.schema.fields.length > 5 && (
                  <div className="text-xs text-green-600">...and {preview.schema.fields.length - 5} more</div>
                )}
              </div>
              {preview.formulas.length > 0 && (
                <div className="mt-2 border-t border-green-200 pt-2">
                  <div className="text-xs font-medium text-green-700 mb-1">Formulas:</div>
                  {preview.formulas.map((f: Formula) => (
                    <div key={f.fieldId} className="text-xs text-green-800 font-mono">
                      {f.name} = {f.expression}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl py-2.5 transition-colors">
            Cancel
          </button>
          {preview ? (
            <button onClick={() => onApply(preview.schema, preview.formulas)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Apply to builder →
            </button>
          ) : (
            <button onClick={generate} disabled={loading || !prompt.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              {loading ? 'Generating...' : '✨ Generate form'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
