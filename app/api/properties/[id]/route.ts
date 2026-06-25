import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const properties = await sql`
    SELECT id FROM properties WHERE id = ${params.id} AND user_id = ${session.user.id}
  `
  if (!properties.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`DELETE FROM properties WHERE id = ${params.id}`
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const properties = await sql`
    SELECT id FROM properties WHERE id = ${params.id} AND user_id = ${session.user.id}
  `
  if (!properties.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { address, postcode, bedrooms, tenantName, tenantEmail, notes } = body

  const result = await sql`
    UPDATE properties
    SET
      address = COALESCE(${address ?? null}, address),
      postcode = COALESCE(${postcode ?? null}, postcode),
      bedrooms = COALESCE(${bedrooms ?? null}, bedrooms),
      tenant_name = ${tenantName ?? null},
      tenant_email = ${tenantEmail ?? null},
      notes = ${notes ?? null},
      updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `

  return NextResponse.json(result[0])
}
