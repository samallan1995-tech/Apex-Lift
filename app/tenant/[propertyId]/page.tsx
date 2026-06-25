'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Shield, CheckCircle, AlertTriangle, Droplets, Wrench } from 'lucide-react'

const schema = z.object({
  description: z.string().min(10, 'Please describe the issue in more detail (at least 10 characters)'),
  urgency: z.enum(['low', 'normal', 'high', 'emergency']),
  isDampMould: z.boolean().default(false),
  tenantName: z.string().min(2, 'Please enter your name'),
  tenantEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function TenantPortalPage() {
  const params = useParams()
  const propertyToken = params.propertyId as string
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'normal', isDampMould: false },
  })

  const isDampMould = watch('isDampMould')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, propertyToken }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Submission failed')
      }
      setSubmitted(true)
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Request Submitted</h2>
            <p className="text-muted-foreground mb-4">
              Your maintenance request has been submitted and your landlord has been notified.
            </p>
            <p className="text-sm text-muted-foreground">
              A timestamped record has been created for compliance purposes.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setSubmitted(false)}
            >
              Submit another request
            </Button>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Maintenance Request</h1>
          <p className="text-blue-300 mt-1">Report a maintenance issue with your property</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>
              Your request will be logged with a timestamp and your landlord will be notified immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Your Name *</Label>
                  <Input id="tenantName" placeholder="John Smith" {...register('tenantName')} />
                  {errors.tenantName && (
                    <p className="text-sm text-red-500">{errors.tenantName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantEmail">Your Email</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    placeholder="you@email.com"
                    {...register('tenantEmail')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type of Issue *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('isDampMould', false)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                      !isDampMould
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    General Maintenance
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('isDampMould', true)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                      isDampMould
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-border hover:border-red-300'
                    }`}
                  >
                    <Droplets className="h-4 w-4" />
                    Damp / Mould
                  </button>
                </div>
              </div>

              {isDampMould && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">
                      <strong>Important:</strong> Under Awaab&apos;s Law (Renters&apos; Rights Act 2025),
                      your landlord must assess damp and mould within 7 days and begin
                      remediation within 14 days of this report.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency *</Label>
                <Select
                  defaultValue="normal"
                  onValueChange={(v) => setValue('urgency', v as FormData['urgency'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — not urgent, can wait</SelectItem>
                    <SelectItem value="normal">Normal — needs attention soon</SelectItem>
                    <SelectItem value="high">High — affects daily living</SelectItem>
                    <SelectItem value="emergency">Emergency — immediate danger or no water/heating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the issue in detail — when it started, what you've noticed, where in the property..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Maintenance Request'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your request will be timestamped and recorded for compliance purposes.
                Powered by{' '}
                <span className="font-medium">ComplianceGuard</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
