import jsPDF from 'jspdf'
import type { Job, Quote, Customer, Engineer } from '@/types'

interface QuoteData {
  job: Job
  quote: Quote
  customer: Customer
  engineer: Engineer
  businessName: string
}

export function generateQuotePDF(data: QuoteData): Blob {
  const doc = new jsPDF()
  const { job, quote, customer, engineer, businessName } = data

  // Header
  doc.setFontSize(24)
  doc.setTextColor(15, 118, 110)
  doc.text(businessName, 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Quote', 190, 20, { align: 'right' })

  doc.setFontSize(16)
  doc.setTextColor(30)
  doc.text('QUOTE', 190, 30, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Ref: ${job.reference}`, 190, 38, { align: 'right' })
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 190, 44, { align: 'right' })

  // Divider
  doc.setDrawColor(220)
  doc.line(14, 50, 196, 50)

  // Customer info
  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text('Bill To:', 14, 60)
  doc.setTextColor(20)
  doc.setFontSize(11)
  doc.text(customer.name, 14, 67)
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(customer.address, 14, 73)
  doc.text(customer.postcode, 14, 79)
  doc.text(customer.phone, 14, 85)

  // Job details
  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text('Job Details:', 120, 60)
  doc.setTextColor(20)
  doc.setFontSize(11)
  doc.text(job.job_type, 120, 67)
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Engineer: ${engineer.name}`, 120, 73)
  doc.text(`Scheduled: ${new Date(job.scheduled_date).toLocaleDateString('en-GB')} at ${job.scheduled_time}`, 120, 79)

  // Line items table
  doc.setFontSize(10)
  doc.setFillColor(15, 118, 110)
  doc.rect(14, 100, 182, 8, 'F')
  doc.setTextColor(255)
  doc.text('Description', 18, 106)
  doc.text('Amount', 185, 106, { align: 'right' })

  doc.setTextColor(30)
  doc.setFontSize(9)

  let y = 115
  if (quote.labour_cost > 0) {
    doc.text('Labour', 18, y)
    doc.text(`£${(quote.labour_cost / 100).toFixed(2)}`, 185, y, { align: 'right' })
    y += 10
  }

  if (quote.materials_cost > 0) {
    doc.text('Materials', 18, y)
    doc.text(`£${(quote.materials_cost / 100).toFixed(2)}`, 185, y, { align: 'right' })
    y += 10
  }

  // Totals
  y += 5
  doc.setDrawColor(220)
  doc.line(120, y, 196, y)
  y += 8

  doc.setTextColor(60)
  doc.text('Subtotal', 130, y)
  doc.text(`£${((quote.total - quote.vat_amount) / 100).toFixed(2)}`, 185, y, { align: 'right' })
  y += 8

  doc.text('VAT (20%)', 130, y)
  doc.text(`£${(quote.vat_amount / 100).toFixed(2)}`, 185, y, { align: 'right' })
  y += 10

  doc.setFontSize(12)
  doc.setTextColor(15, 118, 110)
  doc.setFillColor(240, 253, 250)
  doc.rect(120, y - 5, 76, 12, 'F')
  doc.text('Total', 130, y + 3)
  doc.setFontSize(13)
  doc.text(`£${(quote.total / 100).toFixed(2)}`, 185, y + 3, { align: 'right' })

  // Payment link
  if (quote.stripe_payment_link) {
    y += 25
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text('Pay online:', 14, y)
    doc.setTextColor(15, 118, 110)
    doc.text(quote.stripe_payment_link, 14, y + 7)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(140)
  doc.text('Thank you for your business. Payment due within 30 days of completion.', 105, 280, { align: 'center' })

  return doc.output('blob')
}

export function generateInvoicePDF(data: QuoteData): Blob {
  const doc = new jsPDF()
  const { job, quote, customer, businessName } = data

  doc.setFontSize(24)
  doc.setTextColor(15, 118, 110)
  doc.text(businessName, 14, 20)

  doc.setFontSize(16)
  doc.setTextColor(30)
  doc.text('INVOICE', 190, 30, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Invoice: INV-${job.reference}`, 190, 38, { align: 'right' })
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 190, 44, { align: 'right' })

  doc.setDrawColor(220)
  doc.line(14, 50, 196, 50)

  doc.setFontSize(10)
  doc.setTextColor(60)
  doc.text('Bill To:', 14, 60)
  doc.setTextColor(20)
  doc.setFontSize(11)
  doc.text(customer.name, 14, 67)
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(customer.address, 14, 73)
  doc.text(customer.postcode, 14, 79)

  doc.setFontSize(10)
  doc.setFillColor(15, 118, 110)
  doc.rect(14, 100, 182, 8, 'F')
  doc.setTextColor(255)
  doc.text('Description', 18, 106)
  doc.text('Amount', 185, 106, { align: 'right' })

  doc.setTextColor(30)
  doc.setFontSize(9)

  let y = 115
  doc.text(job.job_type, 18, y)
  doc.text('—', 185, y, { align: 'right' })
  y += 10

  if (quote.labour_cost > 0) {
    doc.text('  Labour', 18, y)
    doc.text(`£${(quote.labour_cost / 100).toFixed(2)}`, 185, y, { align: 'right' })
    y += 10
  }

  if (quote.materials_cost > 0) {
    doc.text('  Materials', 18, y)
    doc.text(`£${(quote.materials_cost / 100).toFixed(2)}`, 185, y, { align: 'right' })
    y += 10
  }

  y += 5
  doc.setDrawColor(220)
  doc.line(120, y, 196, y)
  y += 8

  doc.setTextColor(60)
  doc.text('Subtotal', 130, y)
  doc.text(`£${((quote.total - quote.vat_amount) / 100).toFixed(2)}`, 185, y, { align: 'right' })
  y += 8

  doc.text('VAT (20%)', 130, y)
  doc.text(`£${(quote.vat_amount / 100).toFixed(2)}`, 185, y, { align: 'right' })
  y += 10

  doc.setFontSize(12)
  doc.setTextColor(15, 118, 110)
  doc.setFillColor(240, 253, 250)
  doc.rect(120, y - 5, 76, 12, 'F')
  doc.text('Total Due', 130, y + 3)
  doc.setFontSize(13)
  doc.text(`£${(quote.total / 100).toFixed(2)}`, 185, y + 3, { align: 'right' })

  if (quote.stripe_payment_link) {
    y += 25
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text('Pay securely online:', 14, y)
    doc.setTextColor(15, 118, 110)
    doc.text(quote.stripe_payment_link, 14, y + 7)
  }

  doc.setFontSize(8)
  doc.setTextColor(140)
  doc.text('Payment due within 30 days. Bank transfer or online payment accepted.', 105, 280, { align: 'center' })

  return doc.output('blob')
}
