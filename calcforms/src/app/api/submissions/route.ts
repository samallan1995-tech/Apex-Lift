import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { form_id, answers, computed } = await request.json()

  if (!form_id) return NextResponse.json({ error: 'form_id required' }, { status: 400 })

  const supabase = await createClient()

  // Verify form exists and is published (public submissions)
  const { data: form } = await supabase
    .from('forms')
    .select('id, status')
    .eq('id', form_id)
    .eq('status', 'published')
    .single()

  if (!form) return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 })

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({ form_id, answers: answers || {}, computed: computed || {} })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(submission, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const formId = searchParams.get('form_id')
  if (!formId) return NextResponse.json({ error: 'form_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
