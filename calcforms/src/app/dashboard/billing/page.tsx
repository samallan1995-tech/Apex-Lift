import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLANS } from '@/lib/types'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: org } = await supabase
    .from('orgs')
    .select('id, name, plan, stripe_customer_id, stripe_subscription_id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/dashboard/forms')

  return <BillingClient org={org} />
}
