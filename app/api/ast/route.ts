import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'
import { generateASTPDF } from '@/lib/pdf'

const schema = z.object({
  propertyId: z.string().uuid(),
  landlordName: z.string().min(2),
  landlordAddress: z.string().min(5),
  landlordEmail: z.string().email(),
  tenantName: z.string().min(2),
  tenantEmail: z.string().email().optional().or(z.literal('')),
  rentAmount: z.coerce.number().positive(),
  depositAmount: z.coerce.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentDueDay: z.coerce.number().int().min(1).max(28).default(1),
  depositScheme: z.string().optional().default('TDS'),
  depositSchemeRef: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const properties = await sql`
      SELECT id, address FROM cg_properties
      WHERE id = ${data.propertyId} AND user_id = ${session.user.id}
    `
    if (!properties.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    const property = properties[0] as { id: string; address: string }

    const pdfBytes = await generateASTPDF({
      ...data,
      propertyAddress: property.address,
      depositScheme: data.depositScheme ?? 'TDS',
      depositSchemeRef: data.depositSchemeRef ?? '',
    })

    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`

    const result = await sql`
      INSERT INTO cg_ast_agreements (
        property_id, landlord_name, landlord_address, landlord_email,
        tenant_name, tenant_email, rent_amount, deposit_amount,
        start_date, end_date, rent_due_day, deposit_scheme, deposit_scheme_ref, pdf_url
      )
      VALUES (
        ${data.propertyId},
        ${data.landlordName},
        ${data.landlordAddress},
        ${data.landlordEmail},
        ${data.tenantName},
        ${data.tenantEmail || null},
        ${data.rentAmount},
        ${data.depositAmount},
        ${data.startDate},
        ${data.endDate},
        ${data.rentDueDay},
        ${data.depositScheme ?? 'TDS'},
        ${data.depositSchemeRef ?? null},
        ${pdfDataUrl}
      )
      RETURNING *
    `

    return NextResponse.json({ ...result[0], pdfBytes: pdfBase64 }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
