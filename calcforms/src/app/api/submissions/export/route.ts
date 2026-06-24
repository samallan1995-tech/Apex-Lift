import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Form, Submission } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const formId = searchParams.get('form_id')
  if (!formId) return NextResponse.json({ error: 'form_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })

  const f = form as Form
  const fields = (f.schema?.fields || []).filter(
    field => field.type !== 'heading' && field.type !== 'paragraph'
  )
  const formulas = f.formulas || []

  // Build CSV headers
  const headers = [
    'Submission ID',
    'Date',
    ...fields.map(field => field.label),
    ...formulas.map(formula => formula.label || formula.name),
  ]

  // Build CSV rows
  const rows = (submissions as Submission[]).map(sub => {
    const date = new Date(sub.created_at).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const fieldValues = fields.map(field => {
      const val = sub.answers?.[field.id]
      return csvEscape(val !== null && val !== undefined ? String(val) : '')
    })

    const formulaValues = formulas.map(formula => {
      const val = sub.computed?.[formula.fieldId]
      if (val === null || val === undefined) return ''
      if (formula.format === 'currency') {
        const n = parseFloat(String(val))
        return isNaN(n) ? '' : `£${n.toFixed(2)}`
      }
      return csvEscape(String(val))
    })

    return [sub.id.slice(0, 8).toUpperCase(), date, ...fieldValues, ...formulaValues]
  })

  const csv = [headers.map(csvEscape), ...rows]
    .map(row => row.join(','))
    .join('\n')

  const filename = `${f.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-submissions.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
