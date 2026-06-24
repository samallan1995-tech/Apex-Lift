import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Form, Submission } from './types'

export async function generateSubmissionPDF(
  form: Form,
  submission: Submission,
  orgName?: string
): Promise<ArrayBuffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const theme = form.theme || {}
  const primaryColor = hexToRgb(theme.primaryColor || '#4f46e5')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Logo / org name
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(orgName || 'CalcForms', 14, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(form.title, 14, 20)

  // Date on right
  doc.setFontSize(9)
  const dateStr = new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 20, { align: 'right' })

  let yPos = 38

  // Form responses section
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Form Responses', 14, yPos)
  yPos += 6

  const fields = form.schema?.fields || []
  const answers = submission.answers || {}
  const responseRows: [string, string][] = []

  for (const field of fields) {
    if (field.type === 'heading' || field.type === 'paragraph' || field.type === 'formula') continue
    const rawValue = answers[field.id]
    if (rawValue === null || rawValue === undefined || rawValue === '') continue

    let displayValue = String(rawValue)
    if (field.type === 'currency') {
      const n = parseFloat(displayValue)
      if (!isNaN(n)) displayValue = `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    responseRows.push([field.label, displayValue])
  }

  if (responseRows.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Field', 'Response']],
      body: responseRows,
      headStyles: {
        fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
      margin: { left: 14, right: 14 },
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Computed results section
  const computed = submission.computed || {}
  const formulas = form.formulas || []
  const computedRows: [string, string][] = []

  for (const formula of formulas) {
    const value = computed[formula.fieldId]
    if (value === null || value === undefined) continue
    let displayValue = String(value)
    if (formula.format === 'currency') {
      const n = parseFloat(displayValue)
      if (!isNaN(n)) displayValue = `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (formula.format === 'percentage') {
      displayValue = `${value}%`
    }
    computedRows.push([formula.label || formula.name, displayValue])
  }

  if (computedRows.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Calculated Results', 14, yPos)
    yPos += 6

    autoTable(doc, {
      startY: yPos,
      head: [['Calculation', 'Value']],
      body: computedRows,
      headStyles: {
        fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 1: { fontStyle: 'bold', textColor: [primaryColor.r, primaryColor.g, primaryColor.b] } },
      margin: { left: 14, right: 14 },
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFillColor(245, 245, 250)
  doc.rect(0, pageHeight - 16, pageWidth, 16, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 130)
  doc.text('Powered by CalcForms — calcforms.io', pageWidth / 2, pageHeight - 7, { align: 'center' })
  doc.text(`Ref: ${submission.id.slice(0, 8).toUpperCase()}`, 14, pageHeight - 7)

  return doc.output('arraybuffer') as ArrayBuffer
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 79, g: 70, b: 229 }
}
