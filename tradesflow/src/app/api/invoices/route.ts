import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { quote_id } = await req.json()
  const { data, error } = await supabase
    .from('invoices')
    .insert({ quote_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update job status to invoiced
  const { data: quote } = await supabase.from('quotes').select('job_id').eq('id', quote_id).single()
  if (quote) {
    await supabase.from('jobs').update({ status: 'invoiced' }).eq('id', quote.job_id)
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote_id)
  }

  return NextResponse.json(data, { status: 201 })
}
