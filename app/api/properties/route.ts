import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  address: z.string().min(5),
  postcode: z.string().min(5).max(8),
  bedrooms: z.coerce.number().int().min(1).max(20),
  tenantName: z.string().optional(),
  tenantEmail: z.string().email().optional().or(z.literal('')),
  propertyType: z.enum(['house', 'flat', 'hmo', 'bungalow']).default('house'),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const properties = await sql`
    SELECT p.*,
      (SELECT COUNT(*) FROM certificates c WHERE c.property_id = p.id) as cert_count,
      (SELECT COUNT(*) FROM maintenance_requests m WHERE m.property_id = p.id AND m.status != 'resolved') as open_maintenance
    FROM properties p
    WHERE p.user_id = ${session.user.id}
    ORDER BY p.created_at DESC
  `

  return NextResponse.json(properties)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const result = await sql`
      INSERT INTO properties (user_id, address, postcode, bedrooms, tenant_name, tenant_email, property_type)
      VALUES (
        ${session.user.id},
        ${data.address},
        ${data.postcode.toUpperCase()},
        ${data.bedrooms},
        ${data.tenantName ?? null},
        ${data.tenantEmail || null},
        ${data.propertyType}
      )
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
