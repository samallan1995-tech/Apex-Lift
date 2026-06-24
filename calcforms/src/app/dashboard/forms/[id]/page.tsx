import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Form } from '@/lib/types'
import FormBuilder from '@/components/builder/FormBuilder'

export default async function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !form) redirect('/dashboard/forms')

  return <FormBuilder initialForm={form as Form} />
}
