import { cn } from '@/lib/utils'
import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            'min-h-[48px] text-base appearance-none transition-colors',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
