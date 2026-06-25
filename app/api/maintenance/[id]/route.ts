import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  resolutionNotes: z.string().optional(),
  assessedAt: z.string().optional(),
  remediationStartedAt: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await sql`
    SELECT mr.id FROM maintenance_requests mr
    JOIN properties p ON p.id = mr.property_id
    WHERE mr.id = ${params.id} AND p.user_id = ${session.user.id}
  `
  if (!requests.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const data = updateSchema.parse(body)

  const result = await sql`
    UPDATE maintenance_requests
    SET
      status = COALESCE(${data.status ?? null}, status),
      resolution_notes = COALESCE(${data.resolutionNotes ?? null}, resolution_notes),
      assessed_at = COALESCE(${data.assessedAt ?? null}::timestamptz, assessed_at),
      remediation_started_at = COALESCE(${data.remediationStartedAt ?? null}::timestamptz, remediation_started_at),
      resolved_at = CASE WHEN ${data.status ?? ''} = 'resolved' THEN NOW() ELSE resolved_at END,
      updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `

  return NextResponse.json(result[0])
}
