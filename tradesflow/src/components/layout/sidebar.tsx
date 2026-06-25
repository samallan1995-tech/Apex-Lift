'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar, Briefcase, Users, FileText, Receipt, Settings, Wrench,
  Wifi, WifiOff, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'

const navItems = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/quotes', label: 'Quotes', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/engineers', label: 'Engineers', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOnline, pendingSync } = useAppStore()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TradesFlow</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Job Management</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
              pathname.startsWith(href)
                ? 'bg-teal-600/20 text-teal-400 border border-teal-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium',
          isOnline ? 'text-green-400' : 'text-amber-400'
        )}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
          {pendingSync > 0 && (
            <span className="ml-auto flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3 h-3" />
              {pendingSync} pending
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
