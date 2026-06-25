import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query = supabase
    .from('tf_jobs')
    .select('*, engineer:tf_engineers(*), customer:tf_customers(*)')
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: true })

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (from) query = query.gte('scheduled_date', from)
  if (to) query = query.lte('scheduled_date', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { count } = await supabase
    .from('tf_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const reference = `JOB-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { data, error } = await supabase
    .from('tf_jobs')
    .insert({ ...body, user_id: user.id, reference, status: 'scheduled' })
    .select('*, engineer:tf_engineers(*), customer:tf_customers(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
