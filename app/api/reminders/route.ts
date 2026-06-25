import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendCertificateReminder } from '@/lib/email'
import { getDaysUntilExpiry, CERTIFICATE_TYPES } from '@/lib/utils'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  // Verify cron secret to prevent abuse
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const certificates = await sql`
    SELECT
      c.id, c.type, c.expiry_date, c.reminder_30_sent, c.reminder_7_sent,
      p.address, p.user_id,
      u.email, u.full_name
    FROM certificates c
    JOIN properties p ON p.id = c.property_id
    JOIN users u ON u.id = p.user_id
    WHERE c.expiry_date IS NOT NULL
      AND c.expiry_date > NOW()
      AND u.email IS NOT NULL
  ` as Array<{
    id: string
    type: string
    expiry_date: string
    reminder_30_sent: boolean
    reminder_7_sent: boolean
    address: string
    user_id: string
    email: string
    full_name: string | null
  }>

  const sent: string[] = []

  for (const cert of certificates) {
    const days = getDaysUntilExpiry(cert.expiry_date)
    const certLabel = CERTIFICATE_TYPES.find((t) => t.value === cert.type)?.label ?? cert.type
    const expiryFormatted = format(new Date(cert.expiry_date), 'dd MMMM yyyy')

    if (days <= 7 && !cert.reminder_7_sent) {
      await sendCertificateReminder({
        to: cert.email,
        landlordName: cert.full_name ?? 'Landlord',
        propertyAddress: cert.address,
        certificateType: certLabel,
        expiryDate: expiryFormatted,
        daysUntilExpiry: days,
      })
      await sql`UPDATE certificates SET reminder_7_sent = true WHERE id = ${cert.id}`
      sent.push(`7d: ${cert.id}`)
    } else if (days <= 30 && !cert.reminder_30_sent) {
      await sendCertificateReminder({
        to: cert.email,
        landlordName: cert.full_name ?? 'Landlord',
        propertyAddress: cert.address,
        certificateType: certLabel,
        expiryDate: expiryFormatted,
        daysUntilExpiry: days,
      })
      await sql`UPDATE certificates SET reminder_30_sent = true WHERE id = ${cert.id}`
      sent.push(`30d: ${cert.id}`)
    }
  }

  return NextResponse.json({ sent: sent.length, ids: sent })
}
