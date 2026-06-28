import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Template } from '@/lib/types'
import TemplatesClient from './TemplatesClient'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('category')

  // Get user's org
  const { data: org } = await supabase.from('orgs').select('id').eq('owner_id', user.id).single()

  return <TemplatesClient templates={(templates as Template[]) || []} orgId={org?.id} />
}
