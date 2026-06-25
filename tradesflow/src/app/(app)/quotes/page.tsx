'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Quote, Job } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Download, ExternalLink, Plus } from 'lucide-react'
import { generateQuotePDF } from '@/lib/pdf/generator'
import toast from 'react-hot-toast'

function QuoteFormContent({ jobs, onSubmit, onCancel }: { jobs: Job[]; onSubmit: (d: { job_id: string; labour_cost: number; materials_cost: number }) => Promise<void>; onCancel: () => void }) {
  const searchParams = useSearchParams()
  const defaultJobId = searchParams.get('job_id') ?? ''
  const [form, setForm] = useState({ job_id: defaultJobId, labour_cost: '', materials_cost: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await onSubmit({
        job_id: form.job_id,
        labour_cost: Math.round(parseFloat(form.labour_cost) * 100),
        materials_cost: Math.round(parseFloat(form.materials_cost) * 100),
      })
    } finally { setLoading(false) }
  }

  const labour = parseFloat(form.labour_cost) || 0
  const materials = parseFloat(form.materials_cost) || 0
  const subtotal = labour + materials
  const vat = subtotal * 0.2
  const total = subtotal + vat

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Job *</label>
        <select
          required
          value={form.job_id}
          onChange={(e) => setForm((f) => ({ ...f, job_id: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[48px] appearance-none"
        >
          <option value="">Select job...</option>
          {jobs.filter((j) => j.status !== 'cancelled').map((j) => (
            <option key={j.id} value={j.id}>{j.reference} — {j.customer?.name} ({j.job_type})</option>
          ))}
        </select>
      </div>
      <Input label="Labour Cost (£)" type="number" min="0" step="0.01" required value={form.labour_cost} onChange={(e) => setForm((f) => ({ ...f, labour_cost: e.target.value }))} />
      <Input label="Materials Cost (£)" type="number" min="0" step="0.01" value={form.materials_cost} onChange={(e) => setForm((f) => ({ ...f, materials_cost: e.target.value }))} />

      {subtotal > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-400"><span>VAT (20%)</span><span>£{vat.toFixed(2)}</span></div>
          <div className="flex justify-between text-white font-bold text-base border-t border-slate-700 pt-2"><span>Total</span><span>£{total.toFixed(2)}</span></div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Create Quote</Button>
      </div>
    </form>
  )
}

function QuoteForm(props: { jobs: Job[]; onSubmit: (d: { job_id: string; labour_cost: number; materials_cost: number }) => Promise<void>; onCancel: () => void }) {
  return (
    <Suspense fallback={<div />}>
      <QuoteFormContent {...props} />
    </Suspense>
  )
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/quotes').then((r) => r.json()),
      fetch('/api/jobs').then((r) => r.json()),
    ]).then(([q, j]) => {
      setQuotes(Array.isArray(q) ? q : [])
      setJobs(Array.isArray(j) ? j : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (data: { job_id: string; labour_cost: number; materials_cost: number }) => {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error('Failed to create quote'); return }
    const quote = await res.json()
    setQuotes((prev) => [quote, ...prev])
    setModal(false)
    toast.success('Quote created!')
  }

  const handleDownloadPDF = async (quote: Quote) => {
    if (!quote.job) return
    const job = quote.job as Job & { customer: { name: string; phone: string; address: string; postcode: string }; engineer: { name: string; color: string; phone: string; vehicle_reg: string } }
    try {
      const blob = generateQuotePDF({
        job: job as unknown as import('@/types').Job,
        quote,
        customer: job.customer as unknown as import('@/types').Customer,
        engineer: job.engineer as unknown as import('@/types').Engineer,
        businessName: 'Your Business',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quote-${job.reference}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('PDF generation failed')
    }
  }

  const statusVariant: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
    draft: 'default',
    sent: 'warning',
    accepted: 'success',
    rejected: 'danger',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Quotes</h1>
        <Button size="sm" onClick={() => setModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Quote
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
        {quotes.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No quotes yet</p>
          </div>
        ) : quotes.map((quote) => (
          <div key={quote.id} className="px-4 py-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-slate-500 font-mono">{(quote.job as Job)?.reference}</p>
                <p className="text-sm font-semibold text-white">{((quote.job as Job)?.customer as { name: string })?.name ?? 'Unknown'}</p>
                <p className="text-xs text-slate-400">{(quote.job as Job)?.job_type}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{formatCurrency(quote.total)}</p>
                <Badge variant={statusVariant[quote.status] ?? 'default'} className="mt-1">
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleDownloadPDF(quote)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              {quote.stripe_payment_link && (
                <a
                  href={quote.stripe_payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-teal-400 hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Pay Link
                </a>
              )}
              <span className="text-xs text-slate-500 ml-auto">{formatDate(quote.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Quote">
        <QuoteForm jobs={jobs} onSubmit={handleCreate} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  )
}
