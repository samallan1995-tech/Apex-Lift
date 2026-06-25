import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-green-900/50 text-green-300 border border-green-700/50',
    warning: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
    danger: 'bg-red-900/50 text-red-300 border border-red-700/50',
    info: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
    purple: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  }

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
