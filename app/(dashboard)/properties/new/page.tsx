'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  address: z.string().min(5, 'Please enter a full address'),
  postcode: z.string().min(5, 'Please enter a valid postcode').max(8),
  bedrooms: z.coerce.number().int().min(1).max(20),
  tenantName: z.string().optional(),
  tenantEmail: z.string().email().optional().or(z.literal('')),
  propertyType: z.enum(['house', 'flat', 'hmo', 'bungalow']),
})

type FormData = z.infer<typeof schema>

export default function NewPropertyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { propertyType: 'house', bedrooms: 1 },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create property')
      const property = await res.json()
      toast({ title: 'Property added!', description: data.address })
      router.push(`/properties/${property.id}`)
    } catch {
      toast({ title: 'Error', description: 'Failed to add property', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/properties" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to properties
        </Link>
        <h1 className="text-2xl font-bold">Add Property</h1>
        <p className="text-muted-foreground mt-1">Add a new rental property to track compliance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Property Details
          </CardTitle>
          <CardDescription>Enter the details for your rental property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 14 Victoria Street, Manchester"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  placeholder="e.g. M1 1AA"
                  {...register('postcode')}
                  className="uppercase"
                />
                {errors.postcode && (
                  <p className="text-sm text-red-500">{errors.postcode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={1}
                  max={20}
                  {...register('bedrooms')}
                />
                {errors.bedrooms && (
                  <p className="text-sm text-red-500">{errors.bedrooms.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Property Type *</Label>
              <Select
                defaultValue="house"
                onValueChange={(v) => setValue('propertyType', v as FormData['propertyType'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="flat">Flat / Apartment</SelectItem>
                  <SelectItem value="hmo">HMO (House in Multiple Occupation)</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-medium mb-4">Tenant Details (optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Tenant Name</Label>
                  <Input
                    id="tenantName"
                    placeholder="e.g. John Smith"
                    {...register('tenantName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantEmail">Tenant Email</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    placeholder="tenant@email.com"
                    {...register('tenantEmail')}
                  />
                  {errors.tenantEmail && (
                    <p className="text-sm text-red-500">{errors.tenantEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/properties">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Property'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
