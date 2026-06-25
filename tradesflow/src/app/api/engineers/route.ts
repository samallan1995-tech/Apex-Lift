import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ENGINEER_COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899', '#10b981', '#f97316']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('engineers')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { count } = await supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const color = ENGINEER_COLORS[(count ?? 0) % ENGINEER_COLORS.length]

  const body = await req.json()
  const { data, error } = await supabase
    .from('engineers')
    .insert({ ...body, user_id: user.id, color })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
