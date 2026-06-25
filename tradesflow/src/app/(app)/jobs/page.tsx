'use client'
import { useState, useEffect } from 'react'
import type { Job } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStatusLabel, formatDate, formatTime } from '@/lib/utils'
import { Search, Plus, MapPin, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { JobForm } from '@/components/jobs/job-form'
import toast from 'react-hot-toast'
import type { Engineer, Customer } from '@/types'

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'purple' | 'danger'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  invoiced: 'purple',
  cancelled: 'danger',
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [newJobModal, setNewJobModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs').then((r) => r.json()),
      fetch('/api/engineers').then((r) => r.json()),
      fetch('/api/customers').then((r) => r.json()),
    ]).then(([j, e, c]) => {
      setJobs(Array.isArray(j) ? j : [])
      setEngineers(Array.isArray(e) ? e : [])
      setCustomers(Array.isArray(c) ? c : [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter((j) => {
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    const matchSearch = !search ||
      j.reference.toLowerCase().includes(search.toLowerCase()) ||
      j.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      j.job_type.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleCreateJob = async (formData: Parameters<React.ComponentProps<typeof JobForm>['onSubmit']>[0]) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) { toast.error('Failed to create job'); return }
    const job = await res.json()
    setJobs((prev) => [job, ...prev])
    setNewJobModal(false)
    toast.success(`Job ${job.reference} created!`)
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
          <h1 className="text-xl font-bold text-white">Jobs</h1>
          <Button size="sm" onClick={() => setNewJobModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Job
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            className="pl-10"
            placeholder="Search jobs, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'scheduled', 'in_progress', 'completed', 'invoiced'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm mt-1">Create your first job to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((job) => (
              <div key={job.id} className="px-4 py-4 hover:bg-slate-900/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-mono text-slate-500">{job.reference}</span>
                    <h3 className="text-sm font-semibold text-white">{job.customer?.name ?? 'Unknown'}</h3>
                    <p className="text-sm text-slate-400">{job.job_type}</p>
                  </div>
                  <Badge variant={statusVariant[job.status] ?? 'default'}>
                    {getStatusLabel(job.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(job.scheduled_date)} {formatTime(job.scheduled_time)}
                  </span>
                  {job.customer?.postcode && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.customer.postcode}
                    </span>
                  )}
                </div>
                {job.engineer && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: job.engineer.color }} />
                    <span className="text-xs text-slate-400">{job.engineer.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={newJobModal} onClose={() => setNewJobModal(false)} title="New Job">
        <JobForm
          engineers={engineers}
          customers={customers}
          onSubmit={handleCreateJob}
          onCancel={() => setNewJobModal(false)}
        />
      </Modal>
    </div>
  )
}
