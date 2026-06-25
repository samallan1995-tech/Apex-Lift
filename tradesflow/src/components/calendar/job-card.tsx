'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Job } from '@/types'
import { getStatusColor, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  engineerColor: string
  onClick: () => void
  compact?: boolean
}

export function JobCard({ job, engineerColor, onClick, compact }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: engineerColor }}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'relative rounded-lg border-l-4 bg-slate-700/80 px-2 py-1.5 cursor-grab active:cursor-grabbing select-none',
        'hover:bg-slate-600/80 transition-colors',
        isDragging && 'opacity-40 ring-2 ring-teal-400',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <div className="font-semibold text-white truncate">{job.customer?.name ?? 'Unknown'}</div>
      <div className="text-slate-400 truncate">{job.job_type}</div>
      {!compact && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-500">{formatTime(job.scheduled_time)}</span>
          <span className={cn('w-2 h-2 rounded-full', getStatusColor(job.status))} />
        </div>
      )}
    </div>
  )
}
