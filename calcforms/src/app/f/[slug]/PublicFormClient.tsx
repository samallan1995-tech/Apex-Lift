'use client'
import { useState } from 'react'
import { Form } from '@/lib/types'
import { evaluateFormulas, shouldShowField } from '@/lib/formula-engine'
import FormPreview from '@/components/form-renderer/FormPreview'

export default function PublicFormClient({ form }: { form: Form }) {
  const [values, setValues] = useState<Record<string, string | number | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const computed = evaluateFormulas(
    (form.formulas || []).map(f => ({ name: f.name, fieldId: f.fieldId, expression: f.expression })),
    values
  )

  function handleChange(fieldId: string, value: string | number | null) {
    setValues(prev => ({ ...prev, [fieldId]: value }))
  }

  async function handleSubmit() {
    // Basic validation
    for (const field of form.schema?.fields || []) {
      if (!shouldShowField(field.conditionalLogic, values)) continue
      if (field.required && (values[field.id] === null || values[field.id] === undefined || values[field.id] === '')) {
        setError(`Please fill in: ${field.label}`)
        return
      }
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: form.id, answers: values, computed }),
      })
      if (!res.ok) throw new Error('Submission failed')
      const data = await res.json()
      setSubmissionId(data.id)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {submitted && submissionId && (
        <div className="mb-4 text-center">
          <a
            href={`/api/pdf/${submissionId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
          >
            📄 Download PDF summary
          </a>
        </div>
      )}

      <FormPreview
        form={form}
        values={values}
        computed={computed}
        onChange={handleChange}
        onSubmit={submitted ? undefined : handleSubmit}
        submitted={submitted}
        submitting={submitting}
      />
    </div>
  )
}
