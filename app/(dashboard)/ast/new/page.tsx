'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  propertyId: z.string().uuid(),
  landlordName: z.string().min(2),
  landlordAddress: z.string().min(5),
  landlordEmail: z.string().email(),
  tenantName: z.string().min(2),
  tenantEmail: z.string().email().optional().or(z.literal('')),
  rentAmount: z.coerce.number().positive(),
  depositAmount: z.coerce.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentDueDay: z.coerce.number().int().min(1).max(28),
  depositScheme: z.string(),
  depositSchemeRef: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Property {
  id: string
  address: string
  tenant_name: string | null
  tenant_email: string | null
}

export default function NewASTPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [pdfBytes, setPdfBytes] = useState<string | null>(null)

  const preselectedPropertyId = searchParams.get('propertyId')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: preselectedPropertyId ?? '',
      rentDueDay: 1,
      depositScheme: 'TDS',
    },
  })

  const selectedPropertyId = watch('propertyId')

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data: Property[]) => {
        setProperties(data)
        if (preselectedPropertyId) {
          const prop = data.find((p: Property) => p.id === preselectedPropertyId)
          if (prop?.tenant_name) setValue('tenantName', prop.tenant_name)
          if (prop?.tenant_email) setValue('tenantEmail', prop.tenant_email)
        }
      })
  }, [preselectedPropertyId, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/ast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      setPdfBytes(result.pdfBytes)
      toast({ title: 'AST Generated!', description: 'Your compliant 2025 AST is ready to download.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to generate AST', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!pdfBytes) return
    const binary = atob(pdfBytes)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'AST-Agreement.pdf'
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/properties" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Generate AST Agreement</h1>
        <p className="text-muted-foreground mt-1">
          Compliant with the Renters&apos; Rights Act 2025 — includes Section 21 abolition and Awaab&apos;s Law clauses
        </p>
      </div>

      {pdfBytes ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AST Agreement Ready</h2>
              <p className="text-muted-foreground mb-6">
                Your compliant 2025 AST has been generated with all required statutory clauses.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={downloadPDF} size="lg">
                  <Download className="h-5 w-5 mr-2" /> Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPdfBytes(null)}
                  size="lg"
                >
                  Generate Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Agreement Details
            </CardTitle>
            <CardDescription>
              Fill in the details to generate a legally-compliant AST agreement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label>Property *</Label>
                <Select
                  defaultValue={preselectedPropertyId ?? ''}
                  onValueChange={(v) => {
                    setValue('propertyId', v)
                    const prop = properties.find((p) => p.id === v)
                    if (prop?.tenant_name) setValue('tenantName', prop.tenant_name)
                    if (prop?.tenant_email) setValue('tenantEmail', prop.tenant_email ?? '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyId && <p className="text-sm text-red-500">Please select a property</p>}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Landlord Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Landlord Name *</Label>
                      <Input placeholder="Full legal name" {...register('landlordName')} />
                      {errors.landlordName && <p className="text-sm text-red-500">{errors.landlordName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Landlord Email *</Label>
                      <Input type="email" {...register('landlordEmail')} />
                      {errors.landlordEmail && <p className="text-sm text-red-500">{errors.landlordEmail.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Landlord Address *</Label>
                    <Input placeholder="Full address" {...register('landlordAddress')} />
                    {errors.landlordAddress && <p className="text-sm text-red-500">{errors.landlordAddress.message}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Tenant Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tenant Name *</Label>
                    <Input {...register('tenantName')} />
                    {errors.tenantName && <p className="text-sm text-red-500">{errors.tenantName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tenant Email</Label>
                    <Input type="email" {...register('tenantEmail')} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Tenancy Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" {...register('startDate')} />
                    {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input type="date" {...register('endDate')} />
                    {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Rent (£) *</Label>
                    <Input type="number" step="0.01" {...register('rentAmount')} />
                    {errors.rentAmount && <p className="text-sm text-red-500">{errors.rentAmount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Amount (£) *</Label>
                    <Input type="number" step="0.01" {...register('depositAmount')} />
                    {errors.depositAmount && <p className="text-sm text-red-500">{errors.depositAmount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Rent Due Day</Label>
                    <Input type="number" min={1} max={28} {...register('rentDueDay')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Scheme</Label>
                    <Select defaultValue="TDS" onValueChange={(v) => setValue('depositScheme', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TDS">TDS (Tenancy Deposit Scheme)</SelectItem>
                        <SelectItem value="DPS">DPS (Deposit Protection Service)</SelectItem>
                        <SelectItem value="MyDeposits">MyDeposits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link href="/properties">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate AST PDF'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
