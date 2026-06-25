'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function UpgradeButton({ plan }: { plan: 'starter' | 'pro' }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.location.href = url
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Loading...' : `Upgrade to ${plan === 'pro' ? 'Pro' : 'Starter'}`}
    </Button>
  )
}
