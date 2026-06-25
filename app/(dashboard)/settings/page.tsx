import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UpgradeButton } from '@/components/upgrade-button'
import { PLANS } from '@/lib/stripe'
import { Shield, CheckCircle, CreditCard } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  const userId = session?.user?.id

  const users = await sql`
    SELECT email, full_name, subscription_tier, subscription_status, trial_ends_at, created_at
    FROM users WHERE id = ${userId}
  `
  const user = users[0] as {
    email: string
    full_name: string | null
    subscription_tier: string
    subscription_status: string
    trial_ends_at: string | null
    created_at: string
  }

  const propertyCount = (
    await sql`SELECT COUNT(*) as count FROM properties WHERE user_id = ${userId}`
  )[0] as { count: string }

  const isOnTrial = user.subscription_tier === 'trial'
  const currentPlan = PLANS[user.subscription_tier as keyof typeof PLANS]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and subscription</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user.full_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Properties</p>
              <p className="font-medium">{propertyCount.count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </CardTitle>
          <CardDescription>
            {isOnTrial
              ? `You are on a free trial${user.trial_ends_at ? ` expiring ${new Date(user.trial_ends_at).toLocaleDateString('en-GB')}` : ''}`
              : currentPlan
              ? `You are on the ${currentPlan.name} plan`
              : 'Free account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isOnTrial && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                <strong>Trial ending soon.</strong> Upgrade to keep managing your compliance certificates and avoid interruption.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrentPlan = user.subscription_tier === key
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-5 ${
                    isCurrentPlan ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>
                    {isCurrentPlan && (
                      <Badge variant="default" className="shrink-0">Current</Badge>
                    )}
                  </div>

                  <p className="text-3xl font-bold mb-1">
                    £{(plan.price / 100).toFixed(0)}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Up to {plan.properties} {(plan.properties as number) === 1 ? 'property' : 'properties'} · 30-day free trial
                  </p>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <UpgradeButton plan={key as 'starter' | 'pro'} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Awaab&apos;s Law Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Under the <strong>Renters&apos; Rights Act 2025</strong>, landlords must respond to damp and mould
            complaints within strict timeframes:
          </p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Investigate and assess within <strong>7 days</strong></li>
            <li>Commence remediation within <strong>14 days</strong></li>
            <li>Complete repair within a <strong>reasonable time</strong></li>
          </ul>
          <p>
            ComplianceGuard automatically tracks these deadlines when a tenant submits a damp/mould
            report through the tenant portal.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
