'use client'
import { useState, useEffect } from 'react'
import type { Engineer, Certificate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { daysUntilExpiry, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function EngineerForm({ onSubmit, onCancel }: { onSubmit: (d: Partial<Engineer>) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', vehicle_reg: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name *" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      <Input label="Phone *" type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      <Input label="Vehicle Reg" value={form.vehicle_reg} onChange={(e) => set('vehicle_reg', e.target.value.toUpperCase())} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Engineer</Button>
      </div>
    </form>
  )
}

function CertForm({ engineerId, onSubmit, onCancel }: { engineerId: string; onSubmit: (d: Partial<Certificate>) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<{ engineer_id: string; type: import('@/types').CertType; cert_number: string; expiry_date: string }>({ engineer_id: engineerId, type: 'gas_safe', cert_number: '', expiry_date: '' })
  const [loading, setLoading] = useState(false)
  const set = <K extends 'engineer_id' | 'type' | 'cert_number' | 'expiry_date'>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v as typeof form[K] }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Certificate Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
        <option value="gas_safe">Gas Safe</option>
        <option value="niceic">NICEIC</option>
        <option value="electrical">Electrical</option>
        <option value="other">Other</option>

      </Select>
      <Input label="Certificate Number" value={form.cert_number} onChange={(e) => set('cert_number', e.target.value)} />
      <Input label="Expiry Date *" type="date" required value={form.expiry_date} onChange={(e) => set('expiry_date', e.target.value)} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Certificate</Button>
      </div>
    </form>
  )
}

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [certs, setCerts] = useState<Certificate[]>([])
  const [engineerModal, setEngineerModal] = useState(false)
  const [certModal, setCertModal] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/engineers').then((r) => r.json()),
      fetch('/api/certificates').then((r) => r.json()),
    ]).then(([e, c]) => {
      setEngineers(Array.isArray(e) ? e : [])
      setCerts(Array.isArray(c) ? c : [])
    })
  }, [])

  const handleAddEngineer = async (data: Partial<Engineer>) => {
    const res = await fetch('/api/engineers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error('Failed'); return }
    const eng = await res.json()
    setEngineers((prev) => [...prev, eng])
    setEngineerModal(false)
    toast.success('Engineer added!')
  }

  const handleAddCert = async (data: Partial<Certificate>) => {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error('Failed'); return }
    const cert = await res.json()
    setCerts((prev) => [...prev, cert])
    setCertModal(null)
    toast.success('Certificate added!')
  }

  const getCertBadge = (cert: Certificate) => {
    const days = daysUntilExpiry(cert.expiry_date)
    if (days < 0) return <Badge variant="danger"><AlertTriangle className="w-3 h-3 mr-1" /> Expired</Badge>
    if (days <= 30) return <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" /> {days}d left</Badge>
    return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Valid</Badge>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Engineers</h1>
        <Button size="sm" onClick={() => setEngineerModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {engineers.map((eng) => {
          const engCerts = certs.filter((c) => c.engineer_id === eng.id)
          return (
            <Card key={eng.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: eng.color }}>
                      {eng.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{eng.name}</p>
                      <p className="text-xs text-slate-400">{eng.phone}</p>
                    </div>
                  </div>
                  {eng.vehicle_reg && (
                    <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded">{eng.vehicle_reg}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Certificates</p>
                    <button
                      onClick={() => setCertModal(eng.id)}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >
                      + Add cert
                    </button>
                  </div>
                  {engCerts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No certificates added</p>
                  ) : engCerts.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-white capitalize">{cert.type.replace('_', ' ')}</p>
                        {cert.cert_number && <p className="text-xs text-slate-400">{cert.cert_number}</p>}
                        <p className="text-xs text-slate-500">Expires {formatDate(cert.expiry_date)}</p>
                      </div>
                      {getCertBadge(cert)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {engineers.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">No engineers yet</p>
            <p className="text-sm mt-1">Add your first engineer to get started</p>
          </div>
        )}
      </div>

      <Modal open={engineerModal} onClose={() => setEngineerModal(false)} title="Add Engineer">
        <EngineerForm onSubmit={handleAddEngineer} onCancel={() => setEngineerModal(false)} />
      </Modal>

      <Modal open={!!certModal} onClose={() => setCertModal(null)} title="Add Certificate">
        {certModal && (
          <CertForm engineerId={certModal} onSubmit={handleAddCert} onCancel={() => setCertModal(null)} />
        )}
      </Modal>
    </div>
  )
}
