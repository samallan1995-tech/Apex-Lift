'use client'
import { useState, useEffect } from 'react'
import type { Job } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTime, getStatusLabel } from '@/lib/utils'
import { MapPin, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'purple'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  invoiced: 'purple',
}

export default function EngineerView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    fetch(`/api/jobs?from=${today}&to=${today}`)
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)) : []))
      .finally(() => setLoading(false))
  }, [today])

  const handleMarkComplete = async (job: Job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    if (!res.ok) { toast.error('Failed'); return }
    const updated = await res.json()
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
    toast.success('🎉 Job marked complete!')
  }

  const handleMarkInProgress = async (job: Job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })
    if (!res.ok) return
    const updated = await res.json()
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Today&apos;s Jobs</h1>
        <p className="text-sm text-slate-400">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">No jobs today</p>
            <p className="text-sm mt-2">Enjoy your day off!</p>
          </div>
        ) : jobs.map((job, i) => (
          <div
            key={job.id}
            className={`bg-slate-800 border rounded-2xl overflow-hidden ${
              job.status === 'completed' ? 'border-green-700/50 opacity-75' : 'border-slate-700'
            }`}
          >
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-xs font-mono text-slate-400">{job.reference}</span>
              </div>
              <Badge variant={statusVariant[job.status] ?? 'default'}>
                {getStatusLabel(job.status)}
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white">{job.customer?.name ?? 'Unknown'}</h3>
                <p className="text-sm text-slate-400">{job.job_type}</p>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-slate-500" />
                {formatTime(job.scheduled_time)} · {job.duration_hours}h
              </div>

              {job.customer?.address && (
                <div className="flex items-start gap-1.5 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span>{job.customer.address}, {job.customer.postcode}</span>
                </div>
              )}

              {job.notes && (
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{job.notes}</p>
                </div>
              )}

              {job.status !== 'completed' && job.status !== 'invoiced' && (
                <div className="flex gap-2 pt-1">
                  {job.status === 'scheduled' && (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      onClick={() => handleMarkInProgress(job)}
                    >
                      Start Job
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => handleMarkComplete(job)}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete
                  </Button>
                </div>
              )}
              {job.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Job completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
