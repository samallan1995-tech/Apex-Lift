'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Engineer, Customer } from '@/types'

interface JobFormData {
  customer_id: string
  engineer_id: string
  job_type: string
  description: string
  scheduled_date: string
  scheduled_time: string
  duration_hours: number
  notes: string
}

interface JobFormProps {
  engineers: Engineer[]
  customers: Customer[]
  defaultDate?: string
  defaultEngineerId?: string
  onSubmit: (data: JobFormData) => Promise<void>
  onCancel: () => void
}

const JOB_TYPES = [
  'Boiler Repair', 'Boiler Service', 'Boiler Installation',
  'Gas Leak', 'Radiator Issue', 'Plumbing Emergency',
  'Electrical Fault', 'Consumer Unit', 'Lighting Install',
  'NICEIC Inspection', 'Gas Safe Inspection', 'General Plumbing',
  'Bathroom Fit', 'Kitchen Plumbing', 'Other'
]

export function JobForm({ engineers, customers, defaultDate, defaultEngineerId, onSubmit, onCancel }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<JobFormData>({
    customer_id: '',
    engineer_id: defaultEngineerId ?? '',
    job_type: '',
    description: '',
    scheduled_date: defaultDate ?? new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    duration_hours: 2,
    notes: '',
  })

  const set = (k: keyof JobFormData, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Customer *"
        required
        value={form.customer_id}
        onChange={(e) => set('customer_id', e.target.value)}
      >
        <option value="">Select customer...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name} — {c.postcode}</option>
        ))}
      </Select>

      <Select
        label="Engineer *"
        required
        value={form.engineer_id}
        onChange={(e) => set('engineer_id', e.target.value)}
      >
        <option value="">Select engineer...</option>
        {engineers.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </Select>

      <Select
        label="Job Type *"
        required
        value={form.job_type}
        onChange={(e) => set('job_type', e.target.value)}
      >
        <option value="">Select job type...</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date *"
          type="date"
          required
          value={form.scheduled_date}
          onChange={(e) => set('scheduled_date', e.target.value)}
        />
        <Input
          label="Time *"
          type="time"
          required
          value={form.scheduled_time}
          onChange={(e) => set('scheduled_time', e.target.value)}
        />
      </div>

      <Input
        label="Duration (hours)"
        type="number"
        min={0.5}
        max={24}
        step={0.5}
        value={form.duration_hours}
        onChange={(e) => set('duration_hours', parseFloat(e.target.value))}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Notes</label>
        <textarea
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base min-h-[80px] resize-none"
          placeholder="Any special instructions..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Create Job
        </Button>
      </div>
    </form>
  )
}
