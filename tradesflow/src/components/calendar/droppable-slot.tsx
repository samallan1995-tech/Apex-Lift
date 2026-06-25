'use client'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface DroppableSlotProps {
  id: string
  onClick: () => void
  isToday?: boolean
  children: ReactNode
}

export function DroppableSlot({ id, onClick, isToday, children }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        'min-h-[80px] border-r border-slate-800 cursor-pointer transition-colors',
        isToday ? 'bg-teal-950/20' : 'hover:bg-slate-800/50',
        isOver && 'bg-teal-900/30 ring-2 ring-inset ring-teal-500'
      )}
    >
      {children}
    </div>
  )
}
