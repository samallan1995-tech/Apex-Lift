import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            'min-h-[48px] text-base transition-colors',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
