import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'
import { sendMaintenanceNotification } from '@/lib/email'
import { addDays } from 'date-fns'

const createSchema = z.object({
  propertyToken: z.string().optional(),
  propertyId: z.string().uuid().optional(),
  description: z.string().min(10, 'Please provide more detail'),
  urgency: z.enum(['low', 'normal', 'high', 'emergency']).default('normal'),
  isDampMould: z.boolean().default(false),
  tenantName: z.string().optional(),
  tenantEmail: z.string().email().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    let property: { id: string; address: string; user_id: string } | null = null

    if (data.propertyToken) {
      const results = await sql`
        SELECT id, address, user_id FROM cg_properties
        WHERE tenant_portal_token = ${data.propertyToken}
        LIMIT 1
      `
      property = (results[0] as { id: string; address: string; user_id: string }) ?? null
    } else if (data.propertyId) {
      const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const results = await sql`
        SELECT id, address, user_id FROM cg_properties
        WHERE id = ${data.propertyId} AND user_id = ${session.user.id}
        LIMIT 1
      `
      property = (results[0] as { id: string; address: string; user_id: string }) ?? null
    }

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const assessmentDue = data.isDampMould ? addDays(new Date(), 7).toISOString() : null
    const remediationDue = data.isDampMould ? addDays(new Date(), 14).toISOString() : null

    const result = await sql`
      INSERT INTO cg_maintenance_requests (
        property_id, description, urgency, is_damp_mould,
        tenant_name, tenant_email,
        assessment_due_at, remediation_due_at
      )
      VALUES (
        ${property.id},
        ${data.description},
        ${data.urgency},
        ${data.isDampMould},
        ${data.tenantName ?? null},
        ${data.tenantEmail || null},
        ${assessmentDue},
        ${remediationDue}
      )
      RETURNING *
    `

    // Get landlord email to notify
    const landlords = await sql`SELECT email, full_name FROM cg_users WHERE id = ${property.user_id}`
    const landlord = landlords[0] as { email: string; full_name: string | null } | undefined

    if (landlord?.email) {
      try {
        await sendMaintenanceNotification({
          to: landlord.email,
          landlordName: landlord.full_name ?? 'Landlord',
          propertyAddress: property.address,
          requestDescription: data.description,
          urgency: data.urgency,
          tenantPortalUrl: '',
          isAwaaabs: data.isDampMould,
        })
      } catch {
        // Non-critical
      }
    }

    await sql`
      INSERT INTO cg_compliance_logs (property_id, user_id, event_type, event_data, status)
      VALUES (
        ${property.id},
        ${property.user_id},
        'maintenance_request',
        ${JSON.stringify({ urgency: data.urgency, isDampMould: data.isDampMould })},
        ${data.isDampMould ? 'warning' : 'info'}
      )
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  const status = searchParams.get('status')

  let requests
  if (propertyId) {
    const properties = await sql`
      SELECT id FROM cg_properties WHERE id = ${propertyId} AND user_id = ${session.user.id}
    `
    if (!properties.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    requests = await sql`
      SELECT * FROM cg_maintenance_requests
      WHERE property_id = ${propertyId}
      ${status ? sql`AND status = ${status}` : sql``}
      ORDER BY created_at DESC
    `
  } else {
    requests = await sql`
      SELECT mr.*, p.address, p.postcode
      FROM cg_maintenance_requests mr
      JOIN cg_properties p ON p.id = mr.property_id
      WHERE p.user_id = ${session.user.id}
      ${status ? sql`AND mr.status = ${status}` : sql``}
      ORDER BY mr.created_at DESC
    `
  }

  return NextResponse.json(requests)
}
