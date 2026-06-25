import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tf_quotes')
    .select('*, job:tf_jobs(*, customer:tf_customers(*), engineer:tf_engineers(*))')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { job_id, labour_cost, materials_cost } = body

  const subtotal = labour_cost + materials_cost
  const vat_amount = Math.round(subtotal * 0.2)
  const total = subtotal + vat_amount

  const { data: job } = await supabase
    .from('tf_jobs')
    .select('*, customer:tf_customers(*)')
    .eq('id', job_id)
    .single()

  let stripe_payment_link: string | undefined
  if (process.env.STRIPE_SECRET_KEY && job) {
    try {
      const { default: Stripe } = await import('stripe')
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      const price = await stripe.prices.create({
        unit_amount: total,
        currency: 'gbp',
        product_data: { name: `${job.job_type} — ${job.reference}` },
      })
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      })
      stripe_payment_link = link.url
    } catch {
      // Stripe optional
    }
  }

  const { data, error } = await supabase
    .from('tf_quotes')
    .insert({ job_id, labour_cost, materials_cost, vat_amount, total, stripe_payment_link, status: 'draft' })
    .select('*, job:tf_jobs(*, customer:tf_customers(*), engineer:tf_engineers(*))')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
