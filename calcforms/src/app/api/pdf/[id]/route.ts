import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSubmissionPDF } from '@/lib/pdf-generator'
import { Form, Submission } from '@/lib/types'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, forms(*)')
    .eq('id', id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  const form = (submission as any).forms as Form
  const sub = { ...submission, forms: undefined } as Submission

  // Get org name
  const { data: org } = await supabase.from('orgs').select('name').eq('id', form.org_id).single()

  try {
    const pdfBytes = await generateSubmissionPDF(form, sub, org?.name)
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="calcforms-${id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
