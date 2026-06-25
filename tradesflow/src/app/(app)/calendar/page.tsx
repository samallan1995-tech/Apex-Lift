'use client'
import { useState, useEffect, useCallback } from 'react'
import { WeekView } from '@/components/calendar/week-view'
import { Modal } from '@/components/ui/modal'
import { JobForm } from '@/components/jobs/job-form'
import { JobDetail } from '@/components/jobs/job-detail'
import type { Job, Engineer, Customer } from '@/types'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function CalendarPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [newJobModal, setNewJobModal] = useState(false)
  const [newJobDefaults, setNewJobDefaults] = useState<{ date?: string; engineerId?: string }>({})
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, engineersRes, customersRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/engineers'),
        fetch('/api/customers'),
      ])
      const [jobsData, engineersData, customersData] = await Promise.all([
        jobsRes.json(),
        engineersRes.json(),
        customersRes.json(),
      ])
      setJobs(Array.isArray(jobsData) ? jobsData : [])
      setEngineers(Array.isArray(engineersData) ? engineersData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleJobMove = async (jobId: string, newDate: string, engineerId: string) => {
    // Optimistic update
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, scheduled_date: newDate, engineer_id: engineerId } : j
      )
    )
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_date: newDate, engineer_id: engineerId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Job rescheduled')
    } catch {
      toast.error('Failed to reschedule')
      fetchData()
    }
  }

  const handleCreateJob = async (formData: Parameters<React.ComponentProps<typeof JobForm>['onSubmit']>[0]) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) { toast.error('Failed to create job'); return }
    const job = await res.json()
    setJobs((prev) => [...prev, job])
    setNewJobModal(false)
    toast.success(`Job ${job.reference} created!`)
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedJob) return
    const res = await fetch(`/api/jobs/${selectedJob.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) { toast.error('Failed to update'); return }
    const updated = await res.json()
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
    setSelectedJob(updated)
    if (status === 'completed') {
      toast.success('🎉 Job completed!')
    }
  }

  const handleSendSms = async () => {
    if (!selectedJob) return
    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: selectedJob.id }),
    })
    if (!res.ok) { toast.error('SMS failed to send'); return }
    toast.success('SMS reminder sent!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <h1 className="text-lg font-bold text-white">Calendar</h1>
        <button
          onClick={() => { setNewJobDefaults({}); setNewJobModal(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <WeekView
          jobs={jobs}
          engineers={engineers}
          onJobMove={handleJobMove}
          onJobClick={setSelectedJob}
          onSlotClick={(date, engineerId) => {
            setNewJobDefaults({ date, engineerId })
            setNewJobModal(true)
          }}
        />
      </div>

      {/* New Job Modal */}
      <Modal open={newJobModal} onClose={() => setNewJobModal(false)} title="New Job">
        <JobForm
          engineers={engineers}
          customers={customers}
          defaultDate={newJobDefaults.date}
          defaultEngineerId={newJobDefaults.engineerId}
          onSubmit={handleCreateJob}
          onCancel={() => setNewJobModal(false)}
        />
      </Modal>

      {/* Job Detail Modal */}
      <Modal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.reference ?? ''}
      >
        {selectedJob && (
          <JobDetail
            job={selectedJob}
            engineer={engineers.find((e) => e.id === selectedJob.engineer_id)}
            customer={customers.find((c) => c.id === selectedJob.customer_id)}
            onStatusChange={handleStatusChange}
            onCreateQuote={() => {
              setSelectedJob(null)
              window.location.href = `/quotes?job_id=${selectedJob.id}`
            }}
            onSendSms={handleSendSms}
          />
        )}
      </Modal>
    </div>
  )
}
