'use client'
import { Form, FormField } from '@/lib/types'
import { shouldShowField } from '@/lib/formula-engine'

interface FormPreviewProps {
  form: Form
  values: Record<string, string | number | null>
  computed: Record<string, number | string | null>
  onChange: (fieldId: string, value: string | number | null) => void
  onSubmit?: () => void
  submitted?: boolean
  submitting?: boolean
}

export default function FormPreview({ form, values, computed, onChange, onSubmit, submitted, submitting }: FormPreviewProps) {
  const theme = form.theme || {}
  const primaryColor = theme.primaryColor || '#4f46e5'
  const fields = form.schema?.fields || []
  const formulas = form.formulas || []

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Submitted!</h3>
        <p className="text-gray-500 text-sm">{theme.successMessage || 'Thank you! Your response has been recorded.'}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {theme.logo && (
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <img src={theme.logo} alt="Logo" className="h-8 object-contain" />
        </div>
      )}

      <div className="p-6 space-y-5">
        {fields.map(field => {
          const visible = shouldShowField(field.conditionalLogic, values)
          if (!visible) return null

          return <FieldRenderer key={field.id} field={field} value={values[field.id] ?? ''} onChange={v => onChange(field.id, v)} primaryColor={primaryColor} />
        })}

        {/* Computed results */}
        {formulas.length > 0 && (
          <div className="rounded-xl border-2 p-4 mt-4" style={{ borderColor: primaryColor + '30', backgroundColor: primaryColor + '08' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: primaryColor }}>
              Calculated Results
            </div>
            <div className="space-y-2">
              {formulas.map(formula => {
                const value = computed[formula.fieldId]
                if (value === null || value === undefined) return null
                let display = String(value)
                if (formula.format === 'currency') {
                  const n = parseFloat(display)
                  if (!isNaN(n)) display = `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                } else if (formula.format === 'percentage') {
                  display = `${value}%`
                }
                return (
                  <div key={formula.fieldId} className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">{formula.label || formula.name}</span>
                    <span className="text-sm font-bold" style={{ color: primaryColor }}>{display}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? 'Submitting...' : (theme.buttonText || 'Submit')}
          </button>
        )}
      </div>
    </div>
  )
}

function FieldRenderer({ field, value, onChange, primaryColor }: {
  field: FormField
  value: string | number
  onChange: (v: string | number | null) => void
  primaryColor: string
}) {
  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
  const focusStyle = { '--tw-ring-color': primaryColor } as React.CSSProperties

  if (field.type === 'heading') {
    return <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">{field.label}</h3>
  }

  if (field.type === 'paragraph') {
    return <p className="text-gray-500 text-sm leading-relaxed">{field.helpText || field.label}</p>
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'text' && (
        <input type="text" value={String(value || '')} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} required={field.required}
          className={inputClass} style={focusStyle} />
      )}

      {(field.type === 'number') && (
        <input type="number" value={String(value || '')} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
          placeholder={field.placeholder} min={field.min} max={field.max} step={field.step}
          required={field.required} className={inputClass} style={focusStyle} />
      )}

      {field.type === 'currency' && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{field.prefix || '£'}</span>
          <input type="number" value={String(value || '')} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder || '0.00'} min={field.min} max={field.max} step={0.01}
            required={field.required} className={`${inputClass} pl-7`} style={focusStyle} />
        </div>
      )}

      {field.type === 'select' && (
        <select value={String(value || '')} onChange={e => onChange(e.target.value)}
          required={field.required} className={`${inputClass} bg-white`} style={focusStyle}>
          <option value="">Select an option...</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === 'date' && (
        <input type="date" value={String(value || '')} onChange={e => onChange(e.target.value)}
          required={field.required} className={inputClass} style={focusStyle} />
      )}

      {field.type === 'file' && (
        <input type="file" onChange={e => onChange(e.target.files?.[0]?.name || null)}
          required={field.required}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
      )}

      {field.helpText && (
        <p className="text-xs text-gray-400">{field.helpText}</p>
      )}
    </div>
  )
}
