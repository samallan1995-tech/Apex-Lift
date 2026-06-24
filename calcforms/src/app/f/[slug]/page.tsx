import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Form } from '@/lib/types'
import PublicFormClient from './PublicFormClient'

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('public_slug', slug)
    .eq('status', 'published')
    .single()

  if (!form) notFound()

  // Get org for branding
  const { data: org } = await supabase.from('orgs').select('name, brand_logo, brand_color, plan').eq('id', form.org_id).single()

  const primaryColor = org?.brand_color || form.theme?.primaryColor || '#4f46e5'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Branded header */}
      <div className="py-4 px-6 border-b border-gray-100 bg-white">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {form.theme?.logo || org?.brand_logo ? (
            <img src={form.theme?.logo || org?.brand_logo} alt="Logo" className="h-7 object-contain" />
          ) : (
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <span className="text-white font-bold text-xs">CF</span>
            </div>
          )}
          <span className="text-sm text-gray-500">{org?.name || 'CalcForms'}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{form.title}</h1>
        <PublicFormClient form={form as Form} />
      </div>

      {/* Powered by badge (removed on team+ plan) */}
      {(!org || org.plan === 'solo') && (
        <div className="text-center py-6">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Powered by <strong>CalcForms</strong>
          </a>
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: form } = await supabase.from('forms').select('title').eq('public_slug', slug).single()
  return { title: form?.title || 'Form' }
}
