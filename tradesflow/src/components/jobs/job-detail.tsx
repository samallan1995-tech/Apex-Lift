'use client'
import { useState } from 'react'
import type { Job, Engineer, Customer } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusLabel, formatDate, formatTime } from '@/lib/utils'
import { MapPin, Clock, User, Phone, FileText, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobDetailProps {
  job: Job
  engineer?: Engineer
  customer?: Customer
  onStatusChange: (status: string) => Promise<void>
  onCreateQuote: () => void
  onSendSms: () => Promise<void>
}

const STATUSES = ['scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled']

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'purple' | 'danger'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  invoiced: 'purple',
  cancelled: 'danger',
}

export function JobDetail({ job, engineer, customer, onStatusChange, onCreateQuote, onSendSms }: JobDetailProps) {
  const [statusLoading, setStatusLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  const handleStatusChange = async (status: string) => {
    setStatusLoading(true)
    try { await onStatusChange(status) } finally { setStatusLoading(false) }
  }

  const handleSms = async () => {
    setSmsLoading(true)
    try { await onSendSms(); setSmsSent(true) } finally { setSmsLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-mono">{job.reference}</p>
          <h3 className="text-lg font-bold text-white mt-0.5">{job.job_type}</h3>
        </div>
        <Badge variant={statusVariant[job.status] ?? 'default'}>
          {getStatusLabel(job.status)}
        </Badge>
      </div>

      {/* Customer info */}
      {customer && (
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-white font-medium">{customer.name}</span>
            {customer.is_repeat && <Badge variant="success">Repeat</Badge>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4 text-slate-500" />
            {customer.address}, {customer.postcode}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone className="w-4 h-4 text-slate-500" />
            {customer.phone}
          </div>
        </div>
      )}

      {/* Time/Engineer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Scheduled</p>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-white font-medium">{formatDate(job.scheduled_date)}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{formatTime(job.scheduled_time)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Engineer</p>
          {engineer && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: engineer.color }} />
                <span className="text-sm text-white font-medium">{engineer.name}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{job.duration_hours}h duration</p>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {job.notes && (
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Notes</p>
          <p className="text-sm text-slate-300">{job.notes}</p>
        </div>
      )}

      {/* Status change */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={statusLoading || job.status === s}
              onClick={() => handleStatusChange(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                job.status === s
                  ? 'bg-teal-600/20 border-teal-600/50 text-teal-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              )}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          onClick={handleSms}
          loading={smsLoading}
          variant="secondary"
          disabled={smsSent}
          className="w-full"
        >
          {smsSent ? <><CheckCircle className="w-4 h-4 mr-2" /> SMS Sent!</> : 'Send SMS Reminder'}
        </Button>
        <Button onClick={onCreateQuote} variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" /> Create Quote
        </Button>
      </div>
    </div>
  )
}
