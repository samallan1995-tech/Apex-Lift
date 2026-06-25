'use client'
import { useState, useEffect } from 'react'
import type { Quote, Job } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, Download, CheckCircle } from 'lucide-react'
import { generateInvoicePDF } from '@/lib/pdf/generator'
import toast from 'react-hot-toast'

export default function InvoicesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotes')
      .then((r) => r.json())
      .then((data) => setQuotes(Array.isArray(data) ? data.filter((q: Quote) => q.status === 'accepted' || (q.job as Job)?.status === 'completed' || (q.job as Job)?.status === 'invoiced') : []))
      .finally(() => setLoading(false))
  }, [])

  const handleConvertToInvoice = async (quote: Quote) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_id: quote.id }),
    })
    if (!res.ok) { toast.error('Failed'); return }
    toast.success('Invoice created!')
  }

  const handleDownloadPDF = async (quote: Quote) => {
    if (!quote.job) return
    const job = quote.job as Job & { customer: { name: string; phone: string; address: string; postcode: string; email: string; notes: string; is_repeat: boolean; user_id: string; created_at: string }; engineer: { name: string; color: string; phone: string; vehicle_reg: string; user_id: string; created_at: string } }
    try {
      const blob = generateInvoicePDF({
        job: job as unknown as import('@/types').Job,
        quote,
        customer: job.customer as unknown as import('@/types').Customer,
        engineer: job.engineer as unknown as import('@/types').Engineer,
        businessName: 'Your Business',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${(job as Job).reference}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('PDF generation failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Invoices</h1>
        <p className="text-sm text-slate-400 mt-0.5">Completed jobs ready to invoice</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
        {quotes.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Complete a job and create a quote to invoice</p>
          </div>
        ) : quotes.map((quote) => {
          const job = quote.job as Job
          const customer = (job?.customer as { name: string } | undefined)
          return (
            <div key={quote.id} className="px-4 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-500 font-mono">INV-{job?.reference}</p>
                  <p className="text-sm font-semibold text-white">{customer?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{job?.job_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(quote.total)}</p>
                  <Badge variant="success" className="mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" /> Ready
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleDownloadPDF(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3 h-3" /> Invoice PDF
                </button>
                <button
                  onClick={() => handleConvertToInvoice(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-900/50 rounded-lg text-xs text-teal-400 hover:bg-teal-900 transition-colors"
                >
                  <Receipt className="w-3 h-3" /> Mark Invoiced
                </button>
                <span className="text-xs text-slate-500 ml-auto">{formatDate(quote.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
