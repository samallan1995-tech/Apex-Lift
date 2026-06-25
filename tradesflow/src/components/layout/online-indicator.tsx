'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { getPendingActions } from '@/lib/idb'
import { Wifi, WifiOff } from 'lucide-react'

export function OnlineIndicator() {
  const { isOnline, pendingSync, setOnline, setPendingSync } = useAppStore()

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    setOnline(navigator.onLine)
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
  }, [setOnline])

  useEffect(() => {
    const checkPending = async () => {
      const actions = await getPendingActions()
      setPendingSync(actions.length)
    }
    checkPending()
    const interval = setInterval(checkPending, 30000)
    return () => clearInterval(interval)
  }, [setPendingSync])

  if (isOnline && pendingSync === 0) return null

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
      isOnline ? 'bg-amber-900/80 text-amber-300' : 'bg-red-900/80 text-red-300'
    }`}>
      {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isOnline ? `${pendingSync} pending sync` : 'Offline mode'}
    </div>
  )
}
