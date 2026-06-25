import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  propertyId: z.string().uuid(),
  type: z.string().min(1),
  expiryDate: z.string().min(1),
  issueDate: z.string().optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    // Verify property belongs to user
    const properties = await sql`
      SELECT id FROM cg_properties WHERE id = ${data.propertyId} AND user_id = ${session.user.id}
    `
    if (!properties.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    // Upsert certificate (one per type per property)
    const result = await sql`
      INSERT INTO cg_certificates (property_id, type, expiry_date, issue_date, image_url, notes)
      VALUES (
        ${data.propertyId},
        ${data.type},
        ${data.expiryDate},
        ${data.issueDate ?? null},
        ${data.imageUrl ?? null},
        ${data.notes ?? null}
      )
      ON CONFLICT (property_id, type)
      DO UPDATE SET
        expiry_date = EXCLUDED.expiry_date,
        issue_date = EXCLUDED.issue_date,
        image_url = COALESCE(EXCLUDED.image_url, cg_certificates.image_url),
        notes = COALESCE(EXCLUDED.notes, cg_certificates.notes),
        reminder_30_sent = false,
        reminder_7_sent = false,
        updated_at = NOW()
      RETURNING *
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

  if (propertyId) {
    const properties = await sql`
      SELECT id FROM cg_properties WHERE id = ${propertyId} AND user_id = ${session.user.id}
    `
    if (!properties.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const certs = await sql`
      SELECT * FROM cg_certificates WHERE property_id = ${propertyId} ORDER BY expiry_date ASC
    `
    return NextResponse.json(certs)
  }

  // All certs for user
  const certs = await sql`
    SELECT c.*, p.address, p.postcode
    FROM cg_certificates c
    JOIN cg_properties p ON p.id = c.property_id
    WHERE p.user_id = ${session.user.id}
    ORDER BY c.expiry_date ASC NULLS LAST
  `
  return NextResponse.json(certs)
}
