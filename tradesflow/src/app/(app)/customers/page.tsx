'use client'
import { useState, useEffect } from 'react'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Phone, MapPin, Star } from 'lucide-react'
import toast from 'react-hot-toast'

function CustomerForm({ onSubmit, onCancel }: { onSubmit: (d: Partial<Customer>) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', postcode: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name *" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      <Input label="Phone *" type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
      <Input label="Address *" required value={form.address} onChange={(e) => set('address', e.target.value)} />
      <Input label="Postcode *" required value={form.postcode} onChange={(e) => set('postcode', e.target.value.toUpperCase())} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Notes</label>
        <textarea className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base min-h-[80px] resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Customer</Button>
      </div>
    </form>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async (q?: string) => {
    const url = q ? `/api/customers?q=${encodeURIComponent(q)}` : '/api/customers'
    const res = await fetch(url)
    const data = await res.json()
    setCustomers(Array.isArray(data) ? data : [])
  }

  useEffect(() => { fetchCustomers().finally(() => setLoading(false)) }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleAdd = async (data: Partial<Customer>) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error('Failed to add customer'); return }
    const customer = await res.json()
    setCustomers((prev) => [customer, ...prev])
    setModal(false)
    toast.success('Customer added!')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900 space-y-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Customers</h1>
          <Button size="sm" onClick={() => setModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input className="pl-10" placeholder="Name, postcode, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg font-medium">No customers yet</p>
          </div>
        ) : customers.map((c) => (
          <div key={c.id} className="px-4 py-4 hover:bg-slate-900/50 transition-colors">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                {c.is_repeat && (
                  <Badge variant="warning">
                    <Star className="w-3 h-3 mr-1" /> Repeat
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Phone className="w-3 h-3" /> {c.phone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3" /> {c.address}, {c.postcode}
              </div>
            </div>
            {c.notes && <p className="text-xs text-slate-500 mt-2 italic">{c.notes}</p>}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Customer">
        <CustomerForm onSubmit={handleAdd} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  )
}
