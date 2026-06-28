'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Template } from '@/lib/types'
import { generateSlug } from '@/lib/utils'

const CATEGORY_CONFIG = {
  accounting: { label: 'Accounting', color: 'bg-blue-100 text-blue-700', icon: '🔢' },
  legal: { label: 'Legal', color: 'bg-purple-100 text-purple-700', icon: '⚖️' },
  consulting: { label: 'Consulting', color: 'bg-green-100 text-green-700', icon: '📊' },
}

export default function TemplatesClient({ templates, orgId }: { templates: Template[]; orgId?: string }) {
  const [filter, setFilter] = useState<string>('all')
  const [creating, setCreating] = useState<string | null>(null)
  const router = useRouter()

  const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter)
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  async function useTemplate(template: Template) {
    if (!orgId) return
    setCreating(template.id)
    const supabase = createClient()
    const { data } = await supabase
      .from('forms')
      .insert({
        org_id: orgId,
        title: template.title,
        schema: template.schema,
        formulas: template.formulas,
        theme: { primaryColor: '#4f46e5' },
        status: 'draft',
        public_slug: generateSlug(),
      })
      .select()
      .single()
    if (data) router.push(`/dashboard/forms/${data.id}`)
    setCreating(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Template Marketplace</h1>
        <p className="text-gray-500 text-sm mt-1">Start with a ready-made form for your industry</p>
      </div>

      <div className="flex gap-2 mb-6">
        {categories.map(cat => {
          const config = cat === 'all' ? null : CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors capitalize ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All templates' : config?.label || cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No templates found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => {
            const config = CATEGORY_CONFIG[template.category as keyof typeof CATEGORY_CONFIG]
            const fieldCount = template.schema?.fields?.filter((f: any) => f.type !== 'heading' && f.type !== 'paragraph').length || 0
            const formulaCount = template.formulas?.length || 0

            return (
              <div key={template.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{config?.icon || '📋'}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config?.color || 'bg-gray-100 text-gray-600'}`}>
                      {config?.label || template.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{template.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{template.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>{fieldCount} fields</span>
                    <span>{formulaCount} formulas</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    onClick={() => useTemplate(template)}
                    disabled={creating === template.id || !orgId}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    {creating === template.id ? 'Creating...' : 'Use this template →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">✨</div>
        <h3 className="font-bold text-gray-900 mb-2">Need a custom form?</h3>
        <p className="text-gray-500 text-sm mb-4">Use AI to generate a form from a plain-English description in seconds.</p>
        <button
          onClick={() => router.push('/dashboard/forms')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Create with AI →
        </button>
      </div>
    </div>
  )
}
