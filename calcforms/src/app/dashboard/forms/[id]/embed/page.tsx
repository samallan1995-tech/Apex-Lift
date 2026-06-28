import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmbedClient from './EmbedClient'

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: form } = await supabase.from('forms').select('id, title, public_slug, status').eq('id', id).single()
  if (!form) redirect('/dashboard/forms')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calcforms.io'

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/dashboard/forms" className="hover:text-gray-600">Forms</Link>
          <span>/</span>
          <Link href={`/dashboard/forms/${id}`} className="hover:text-gray-600">{form.title}</Link>
          <span>/</span>
          <span className="text-gray-600">Embed & Share</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Embed & Share</h1>
      </div>

      {form.status !== 'published' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <span>⚠️</span>
          This form is in <strong>draft</strong> mode. Publish it first to share or embed.
          <Link href={`/dashboard/forms/${id}`} className="ml-auto font-medium underline">Go to builder →</Link>
        </div>
      )}

      <EmbedClient formSlug={form.public_slug} appUrl={appUrl} />
    </div>
  )
}
