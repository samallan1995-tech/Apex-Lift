import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { format } from 'date-fns'

interface ASTData {
  landlordName: string
  landlordAddress: string
  landlordEmail: string
  tenantName: string
  tenantEmail?: string
  propertyAddress: string
  rentAmount: number
  depositAmount: number
  startDate: string
  endDate: string
  rentDueDay: number
  depositScheme: string
  depositSchemeRef: string
}

export async function generateASTPDF(data: ASTData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page1 = pdfDoc.addPage([595, 842])
  const { width, height } = page1.getSize()

  const margin = 50
  let y = height - margin

  const drawText = (
    page: ReturnType<typeof pdfDoc.addPage>,
    text: string,
    options: {
      x?: number
      y: number
      size?: number
      bold?: boolean
      color?: ReturnType<typeof rgb>
    }
  ) => {
    page.drawText(text, {
      x: options.x ?? margin,
      y: options.y,
      size: options.size ?? 10,
      font: options.bold ? boldFont : font,
      color: options.color ?? rgb(0, 0, 0),
    })
  }

  const drawLine = (page: ReturnType<typeof pdfDoc.addPage>, yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: width - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })
  }

  // Header
  drawText(page1, 'ASSURED SHORTHOLD TENANCY AGREEMENT', {
    y,
    size: 16,
    bold: true,
    color: rgb(0.12, 0.22, 0.37),
  })
  y -= 18
  drawText(page1, 'Compliant with the Renters\' Rights Act 2025', {
    y,
    size: 10,
    color: rgb(0.4, 0.4, 0.4),
  })
  y -= 30

  drawLine(page1, y)
  y -= 20

  // Parties
  drawText(page1, 'PARTIES', { y, size: 12, bold: true })
  y -= 18

  drawText(page1, 'Landlord:', { y, bold: true })
  drawText(page1, data.landlordName, { x: 150, y })
  y -= 14
  drawText(page1, 'Landlord Address:', { y, bold: true })
  drawText(page1, data.landlordAddress, { x: 150, y })
  y -= 14
  drawText(page1, 'Landlord Email:', { y, bold: true })
  drawText(page1, data.landlordEmail, { x: 150, y })
  y -= 20

  drawText(page1, 'Tenant:', { y, bold: true })
  drawText(page1, data.tenantName, { x: 150, y })
  y -= 14
  drawText(page1, 'Tenant Email:', { y, bold: true })
  drawText(page1, data.tenantEmail ?? '—', { x: 150, y })
  y -= 30

  drawLine(page1, y)
  y -= 20

  // Property
  drawText(page1, 'THE PROPERTY', { y, size: 12, bold: true })
  y -= 18
  drawText(page1, 'Address:', { y, bold: true })
  drawText(page1, data.propertyAddress, { x: 150, y })
  y -= 30

  drawLine(page1, y)
  y -= 20

  // Tenancy terms
  drawText(page1, 'TENANCY TERMS', { y, size: 12, bold: true })
  y -= 18
  drawText(page1, 'Start Date:', { y, bold: true })
  drawText(page1, format(new Date(data.startDate), 'dd MMMM yyyy'), { x: 150, y })
  y -= 14
  drawText(page1, 'End Date:', { y, bold: true })
  drawText(page1, format(new Date(data.endDate), 'dd MMMM yyyy'), { x: 150, y })
  y -= 14
  drawText(page1, 'Monthly Rent:', { y, bold: true })
  drawText(page1, `£${data.rentAmount.toFixed(2)} per month`, { x: 150, y })
  y -= 14
  drawText(page1, 'Rent Due Day:', { y, bold: true })
  drawText(page1, `${data.rentDueDay}${getOrdinal(data.rentDueDay)} of each month`, { x: 150, y })
  y -= 14
  drawText(page1, 'Deposit:', { y, bold: true })
  drawText(page1, `£${data.depositAmount.toFixed(2)}`, { x: 150, y })
  y -= 14
  drawText(page1, 'Deposit Scheme:', { y, bold: true })
  drawText(page1, data.depositScheme, { x: 150, y })
  y -= 14
  drawText(page1, 'Deposit Ref:', { y, bold: true })
  drawText(page1, data.depositSchemeRef || 'To be confirmed within 30 days', { x: 150, y })
  y -= 30

  drawLine(page1, y)
  y -= 20

  // Key clauses
  drawText(page1, 'KEY STATUTORY CLAUSES', { y, size: 12, bold: true })
  y -= 20

  const clauses = [
    {
      title: '1. Section 21 Abolition (Renters\' Rights Act 2025)',
      text: 'This tenancy is governed by the Renters\' Rights Act 2025. No-fault evictions under Section 21 of the Housing Act 1988 are abolished. The landlord may only recover possession on specific grounds set out in Schedule 2 of the Housing Act 1988 as amended.',
    },
    {
      title: '2. Awaab\'s Law (Damp and Mould)',
      text: 'The landlord acknowledges obligations under Section 10A of the Landlord and Tenant Act 1985 (Awaab\'s Law). The landlord must investigate hazardous damp and mould within 7 days of a written report, and commence remediation within 14 days. Failure to comply may result in enforcement action by the local authority.',
    },
    {
      title: '3. Deposit Protection',
      text: `The deposit of £${data.depositAmount.toFixed(2)} must be protected in a government-approved scheme within 30 days of receipt. The tenant must be provided with the Prescribed Information within the same period.`,
    },
    {
      title: '4. Decent Homes Standard',
      text: 'The landlord must ensure the property meets the Decent Homes Standard throughout the tenancy, including keeping the property free from Category 1 hazards as defined by the Housing Health and Safety Rating System (HHSRS).',
    },
    {
      title: '5. Tenant\'s Right to Pet',
      text: 'The tenant may request permission to keep a pet in the property. The landlord may not unreasonably refuse such a request. Any refusal must be in writing with reasons given within 28 days.',
    },
    {
      title: '6. Rent Increases',
      text: 'Rent may only be increased once per year. The landlord must provide at least 2 months\' written notice of any rent increase using the prescribed Section 13 notice.',
    },
  ]

  for (const clause of clauses) {
    if (y < 150) {
      // Add new page
      const newPage = pdfDoc.addPage([595, 842])
      y = height - margin
      drawText(newPage, clause.title, { y, bold: true, size: 10 })
      y -= 14
      const lines = wrapText(clause.text, 70)
      for (const line of lines) {
        drawText(newPage, line, { y, size: 9, color: rgb(0.2, 0.2, 0.2) })
        y -= 13
      }
      y -= 10
    } else {
      drawText(page1, clause.title, { y, bold: true, size: 10 })
      y -= 14
      const lines = wrapText(clause.text, 70)
      for (const line of lines) {
        drawText(page1, line, { y, size: 9, color: rgb(0.2, 0.2, 0.2) })
        y -= 13
      }
      y -= 10
    }
  }

  // Signatures page
  const sigPage = pdfDoc.addPage([595, 842])
  let sy = height - margin

  drawText(sigPage, 'SIGNATURES', { y: sy, size: 14, bold: true })
  sy -= 30

  drawText(sigPage, 'By signing below, both parties confirm they have read and agreed to the terms of this', { y: sy, size: 10 })
  sy -= 14
  drawText(sigPage, 'Assured Shorthold Tenancy Agreement.', { y: sy, size: 10 })
  sy -= 40

  drawText(sigPage, 'LANDLORD', { y: sy, bold: true })
  sy -= 20
  drawText(sigPage, 'Name:', { y: sy, bold: true })
  drawText(sigPage, data.landlordName, { x: 150, y: sy })
  sy -= 30
  drawText(sigPage, 'Signature: ___________________________', { y: sy })
  sy -= 20
  drawText(sigPage, 'Date: ___________________________', { y: sy })
  sy -= 50

  drawLine(sigPage, sy)
  sy -= 30

  drawText(sigPage, 'TENANT', { y: sy, bold: true })
  sy -= 20
  drawText(sigPage, 'Name:', { y: sy, bold: true })
  drawText(sigPage, data.tenantName, { x: 150, y: sy })
  sy -= 30
  drawText(sigPage, 'Signature: ___________________________', { y: sy })
  sy -= 20
  drawText(sigPage, 'Date: ___________________________', { y: sy })
  sy -= 50

  // Footer
  drawLine(sigPage, 80)
  drawText(sigPage, `Generated by ComplianceGuard on ${format(new Date(), 'dd MMMM yyyy')} | complianceguard.co.uk`, {
    y: 60,
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  })
  drawText(sigPage, 'This document is for guidance only. Seek legal advice for complex situations.', {
    y: 46,
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  })

  return pdfDoc.save()
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).length > maxChars) {
      lines.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current)
  return lines
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
