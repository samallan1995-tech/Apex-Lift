'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogOut, CreditCard, Bell, Shield, Smartphone } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleInstallPWA = () => {
    toast('Open this app in Chrome/Safari and use "Add to Home Screen"', { icon: '📱' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-400" />
              <h2 className="font-semibold text-white">Subscription</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white font-medium">Free Trial</p>
                <p className="text-xs text-slate-400 mt-0.5">14 days remaining</p>
              </div>
              <Badge variant="warning">Trial</Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Starter (up to 3 users)</span>
                <span className="text-white font-medium">£25/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Additional users</span>
                <span className="text-white font-medium">£10/user/month</span>
              </div>
            </div>
            <Button className="w-full" variant="primary">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-400" />
              <h2 className="font-semibold text-white">SMS Reminders</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              SMS reminders are sent automatically 30 minutes before each job via Twilio.
            </p>
            <div className="bg-slate-700/50 rounded-xl p-3 text-xs text-slate-300">
              <p className="font-mono">&quot;Hi [Customer], your engineer [Name] is on the way. Job ref: [JOB-001]&quot;</p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <h2 className="font-semibold text-white">UK Compliance</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              Track Gas Safe and NICEIC certificates in the Engineers section. You&apos;ll be alerted when certificates are expiring within 30 days.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Gas Safe</p>
                <p className="text-xs text-teal-400 mt-1">✓ Tracked</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">NICEIC</p>
                <p className="text-xs text-teal-400 mt-1">✓ Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Install PWA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              <h2 className="font-semibold text-white">Install App</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              Install TradesFlow on your phone for offline access and a native app experience.
            </p>
            <Button variant="outline" className="w-full" onClick={handleInstallPWA}>
              <Smartphone className="w-4 h-4 mr-2" /> Add to Home Screen
            </Button>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="danger"
          className="w-full"
          onClick={handleSignOut}
          loading={loading}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  )
}
