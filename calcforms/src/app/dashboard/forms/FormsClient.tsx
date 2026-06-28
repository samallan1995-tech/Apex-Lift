'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Form } from '@/lib/types'
import { generateSlug } from '@/lib/utils'

export default function FormsClient({ forms, orgId }: { forms: Form[]; orgId: string }) {
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function createNewForm() {
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('forms')
      .insert({
        org_id: orgId,
        title: 'Untitled Form',
        schema: { fields: [] },
        formulas: [],
        theme: { primaryColor: '#4f46e5' },
        status: 'draft',
        public_slug: generateSlug(),
      })
      .select()
      .single()
    if (data) router.push(`/dashboard/forms/${data.id}`)
    setCreating(false)
  }

  async function deleteForm(id: string) {
    if (!confirm('Delete this form and all its submissions? This cannot be undone.')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('forms').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
  }

  async function duplicateForm(form: Form) {
    const supabase = createClient()
    const { data } = await supabase
      .from('forms')
      .insert({
        org_id: orgId,
        title: `${form.title} (copy)`,
        schema: form.schema,
        formulas: form.formulas,
        theme: form.theme,
        status: 'draft',
        public_slug: generateSlug(),
      })
      .select()
      .single()
    if (data) router.push(`/dashboard/forms/${data.id}`)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500 text-sm mt-1">{forms.length} form{forms.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={createNewForm}
          disabled={creating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {creating ? 'Creating...' : '+ New form'}
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No forms yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Create your first calculating form, or start from a template.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={createNewForm} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Create blank form
            </button>
            <Link href="/dashboard/templates" className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">
              Browse templates
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {forms.map(form => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 text-lg">📝</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{form.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {form.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Updated {new Date(form.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs text-gray-400">{form.schema?.fields?.length || 0} fields</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/forms/${form.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  Edit
                </Link>
                <Link href={`/dashboard/forms/${form.id}/submissions`} className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                  Submissions
                </Link>
                <button onClick={() => duplicateForm(form)} className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                  Duplicate
                </button>
                <button
                  onClick={() => deleteForm(form.id)}
                  disabled={deleting === form.id}
                  className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {deleting === form.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
