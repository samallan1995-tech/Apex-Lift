import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Form, Submission } from '@/lib/types'

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
  if (!form) redirect('/dashboard/forms')

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', id)
    .order('created_at', { ascending: false })

  const formData = form as Form
  const fields = formData.schema?.fields?.filter(f => f.type !== 'heading' && f.type !== 'paragraph') || []
  const formulas = formData.formulas || []

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link href="/dashboard/forms" className="hover:text-gray-600">Forms</Link>
              <span>/</span>
              <Link href={`/dashboard/forms/${id}`} className="hover:text-gray-600">{form.title}</Link>
              <span>/</span>
              <span className="text-gray-600">Submissions</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title} — Submissions</h1>
            <p className="text-gray-500 text-sm mt-1">{(submissions || []).length} response{submissions?.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/forms/${id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg transition-colors">
              Edit form
            </Link>
            <Link href={`/dashboard/forms/${id}/embed`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
              Embed & share
            </Link>
          </div>
        </div>

        {(!submissions || submissions.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h2>
            <p className="text-gray-500 text-sm mb-4">Share your form to start collecting responses.</p>
            <Link href={`/dashboard/forms/${id}/embed`} className="text-sm font-medium text-indigo-600 hover:underline">
              Get share link →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    {fields.slice(0, 4).map(f => (
                      <th key={f.id} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide truncate max-w-32">
                        {f.label}
                      </th>
                    ))}
                    {formulas.slice(0, 3).map(f => (
                      <th key={f.fieldId} className="text-left px-4 py-3 text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                        {f.label || f.name}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(submissions as Submission[]).map(sub => (
                    <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {fields.slice(0, 4).map(f => {
                        const val = sub.answers?.[f.id]
                        return (
                          <td key={f.id} className="px-4 py-3 text-sm text-gray-700 max-w-32">
                            <div className="truncate">{val !== null && val !== undefined ? String(val) : '—'}</div>
                          </td>
                        )
                      })}
                      {formulas.slice(0, 3).map(f => {
                        const val = sub.computed?.[f.fieldId]
                        let display = val !== null && val !== undefined ? String(val) : '—'
                        if (f.format === 'currency' && val !== null && val !== undefined) {
                          const n = parseFloat(display)
                          if (!isNaN(n)) display = `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
                        }
                        return (
                          <td key={f.fieldId} className="px-4 py-3 text-sm font-semibold text-indigo-700">
                            {display}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/api/pdf/${sub.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
