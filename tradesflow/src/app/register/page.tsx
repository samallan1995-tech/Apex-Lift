'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Wrench, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', businessName: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { business_name: form.businessName } },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: form.email,
        business_name: form.businessName,
        subscription_tier: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      toast.success('Account created! Starting your 14-day free trial.')
      router.push('/calendar')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TradesFlow</h1>
          <p className="text-slate-400 mt-1 text-sm">14-day free trial, no card needed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col gap-2 mb-2">
            {['Drag-drop job calendar', 'SMS reminders to customers', 'One-click PDF quotes'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Business Name"
              placeholder="Smith Plumbing & Heating"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Start Free Trial
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            £25/month after trial. Cancel anytime.
          </p>

          <p className="text-center text-sm text-slate-400">
            Have an account?{' '}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
