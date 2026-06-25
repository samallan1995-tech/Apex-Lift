'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter
} from '@dnd-kit/core'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import type { Job, Engineer } from '@/types'
import { JobCard } from './job-card'
import { DroppableSlot } from './droppable-slot'
import { cn } from '@/lib/utils'

interface WeekViewProps {
  jobs: Job[]
  engineers: Engineer[]
  onJobMove: (jobId: string, newDate: string, engineerId: string) => void
  onJobClick: (job: Job) => void
  onSlotClick: (date: string, engineerId: string) => void
}

export function WeekView({ jobs, engineers, onJobMove, onJobClick, onSlotClick }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dragging, setDragging] = useState<Job | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const job = jobs.find((j) => j.id === e.active.id)
    setDragging(job ?? null)
  }, [jobs])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setDragging(null)
    if (!e.over) return
    const [date, engineerId] = String(e.over.id).split('|')
    if (date && engineerId) {
      onJobMove(String(e.active.id), date, engineerId)
    }
  }, [onJobMove])

  const getJobsForSlot = (date: Date, engineerId: string) =>
    jobs.filter(
      (j) => j.engineer_id === engineerId && isSameDay(parseISO(j.scheduled_date), date)
    )

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <button
          onClick={() => setCurrentDate((d) => addDays(d, -7))}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm"
        >
          ← Prev
        </button>
        <h2 className="text-sm font-semibold text-white">
          {format(weekStart, 'dd MMM')} – {format(addDays(weekStart, 6), 'dd MMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate((d) => addDays(d, 7))}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm"
        >
          Next →
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-auto">
          {/* Header row: days */}
          <div className="grid sticky top-0 z-10 bg-slate-900 border-b border-slate-700" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
            <div className="p-2" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 text-center text-xs font-medium',
                  isSameDay(day, new Date()) ? 'text-teal-400' : 'text-slate-400'
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div className={cn(
                  'w-7 h-7 flex items-center justify-center mx-auto rounded-full text-sm font-bold mt-0.5',
                  isSameDay(day, new Date()) ? 'bg-teal-500 text-white' : 'text-white'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Engineer rows */}
          {engineers.map((engineer) => (
            <div key={engineer.id} className="border-b border-slate-800">
              {/* Engineer label */}
              <div
                className="px-3 py-2 flex items-center gap-2 bg-slate-800/50 border-b border-slate-700/50 sticky left-0"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: engineer.color }}
                />
                <span className="text-xs font-medium text-slate-300 truncate">{engineer.name}</span>
              </div>

              {/* Day slots */}
              <div
                className="grid min-h-[80px]"
                style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
              >
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const slotJobs = getJobsForSlot(day, engineer.id)
                  return (
                    <DroppableSlot
                      key={`${dateStr}-${engineer.id}`}
                      id={`${dateStr}|${engineer.id}`}
                      onClick={() => onSlotClick(dateStr, engineer.id)}
                      isToday={isSameDay(day, new Date())}
                    >
                      <div className="flex flex-col gap-1 p-1">
                        {slotJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            engineerColor={engineer.color}
                            onClick={() => onJobClick(job)}
                            compact
                          />
                        ))}
                      </div>
                    </DroppableSlot>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {dragging && (
            <div className="opacity-80 rotate-2 pointer-events-none">
              <JobCard
                job={dragging}
                engineerColor={engineers.find((e) => e.id === dragging.engineer_id)?.color ?? '#14b8a6'}
                onClick={() => {}}
                compact
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
