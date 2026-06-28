import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Form } from '@/lib/types'
import { generateSlug } from '@/lib/utils'
import { redirect } from 'next/navigation'
import FormsClient from './FormsClient'

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user's org
  const { data: org } = await supabase
    .from('orgs')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  let orgId = org?.id

  // Auto-create org if none exists
  if (!orgId) {
    const orgName = user.user_metadata?.org_name || user.email?.split('@')[0] || 'My Firm'
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36)
    const { data: newOrg } = await supabase
      .from('orgs')
      .insert({ name: orgName, slug: orgSlug, owner_id: user.id, plan: 'solo' })
      .select()
      .single()
    orgId = newOrg?.id
  }

  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })

  return <FormsClient forms={(forms as Form[]) || []} orgId={orgId} />
}
