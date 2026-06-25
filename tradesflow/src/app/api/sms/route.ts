import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id } = await req.json()

  const { data: job, error: jobError } = await supabase
    .from('tf_jobs')
    .select('*, engineer:tf_engineers(*), customer:tf_customers(*)')
    .eq('id', job_id)
    .eq('user_id', user.id)
    .single()

  if (jobError || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const customer = job.customer as { name: string; phone: string }
  const engineer = job.engineer as { name: string }
  const message = `Hi ${customer.name}, your engineer ${engineer.name} is on the way. Job ref: ${job.reference}. Reply CONFIRM to confirm or RESCHEDULE to change the time.`

  let twilioSid: string | undefined
  let status = 'sent'

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = (await import('twilio')).default
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      const msg = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone,
      })
      twilioSid = msg.sid
      status = msg.status as string
    } catch (err) {
      console.error('Twilio error:', err)
      status = 'failed'
    }
  }

  await supabase.from('tf_sms_logs').insert({
    job_id,
    customer_phone: customer.phone,
    message,
    twilio_sid: twilioSid,
    status,
  })

  return NextResponse.json({ success: true, status })
}
