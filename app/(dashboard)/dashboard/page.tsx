import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getPropertyStatus, getExpiryStatus, formatDate, getDaysUntilExpiry, CERTIFICATE_TYPES } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCheck,
  Wrench,
  Plus,
  ArrowRight,
} from 'lucide-react'

interface Property {
  id: string
  address: string
  postcode: string
  bedrooms: number
  tenant_name: string | null
}

interface Certificate {
  id: string
  property_id: string
  type: string
  expiry_date: string | null
}

interface MaintenanceRequest {
  id: string
  property_id: string
  description: string
  urgency: string
  status: string
  is_damp_mould: boolean
  created_at: string
  assessment_due_at: string | null
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const properties = (await sql`
    SELECT id, address, postcode, bedrooms, tenant_name
    FROM properties
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as Property[]

  const certificates = properties.length
    ? ((await sql`
        SELECT id, property_id, type, expiry_date
        FROM certificates
        WHERE property_id = ANY(${properties.map((p) => p.id)})
      `) as Certificate[])
    : ([] as Certificate[])

  const openMaintenance = properties.length
    ? ((await sql`
        SELECT id, property_id, description, urgency, status, is_damp_mould, created_at, assessment_due_at
        FROM maintenance_requests
        WHERE property_id = ANY(${properties.map((p) => p.id)})
          AND status != 'resolved'
        ORDER BY created_at DESC
        LIMIT 5
      `) as MaintenanceRequest[])
    : ([] as MaintenanceRequest[])

  const certsByProperty = certificates.reduce(
    (acc, cert) => {
      if (!acc[cert.property_id]) acc[cert.property_id] = []
      acc[cert.property_id].push(cert)
      return acc
    },
    {} as Record<string, Certificate[]>
  )

  const redCount = properties.filter((p) => getPropertyStatus(certsByProperty[p.id] ?? []) === 'red').length
  const amberCount = properties.filter((p) => getPropertyStatus(certsByProperty[p.id] ?? []) === 'amber').length
  const greenCount = properties.filter((p) => getPropertyStatus(certsByProperty[p.id] ?? []) === 'green').length

  const expiringCerts = certificates
    .filter((c) => {
      if (!c.expiry_date) return false
      const days = getDaysUntilExpiry(c.expiry_date)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())
    .slice(0, 5)

  const awaaabsAlerts = openMaintenance.filter((m) => m.is_damp_mould)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name ?? session?.user?.email}
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {awaaabsAlerts.length > 0 && (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Awaab&apos;s Law Alert — {awaaabsAlerts.length} open damp/mould{' '}
                {awaaabsAlerts.length === 1 ? 'report' : 'reports'}
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                You must assess within 7 days and begin remediation within 14 days under the
                Renters&apos; Rights Act 2025.
              </p>
              <Link href="/maintenance?filter=damp_mould">
                <Button variant="destructive" size="sm" className="mt-2">
                  View Damp/Mould Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-xs text-muted-foreground">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-red-600">{redCount}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{amberCount}</p>
                <p className="text-xs text-muted-foreground">Expiring soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-600">{greenCount}</p>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Properties</CardTitle>
            <Link href="/properties" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No properties yet</p>
                <Link href="/properties/new">
                  <Button size="sm" className="mt-3">
                    <Plus className="h-4 w-4 mr-1" /> Add your first property
                  </Button>
                </Link>
              </div>
            ) : (
              properties.slice(0, 5).map((property) => {
                const certs = certsByProperty[property.id] ?? []
                const status = getPropertyStatus(certs)
                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          status === 'red'
                            ? 'bg-red-500'
                            : status === 'amber'
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{property.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.postcode} · {property.bedrooms} bed
                          {property.tenant_name ? ` · ${property.tenant_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Expiring Certificates
              </CardTitle>
              <Link href="/certificates" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiringCerts.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">All certificates valid for 30+ days</p>
                </div>
              ) : (
                expiringCerts.map((cert) => {
                  const status = getExpiryStatus(cert.expiry_date!)
                  const days = getDaysUntilExpiry(cert.expiry_date!)
                  const certLabel =
                    CERTIFICATE_TYPES.find((t) => t.value === cert.type)?.label ?? cert.type
                  const property = properties.find((p) => p.id === cert.property_id)
                  return (
                    <div
                      key={cert.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${
                        status === 'red'
                          ? 'border-red-200 bg-red-50 dark:bg-red-900/10'
                          : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{certLabel}</p>
                        <p className="text-xs text-muted-foreground">{property?.address}</p>
                      </div>
                      <Badge variant={status as 'red' | 'amber'}>
                        {days === 0 ? 'Today' : days < 0 ? 'Expired' : `${days}d`}
                      </Badge>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Open Maintenance
              </CardTitle>
              <Link href="/maintenance" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {openMaintenance.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">No open maintenance requests</p>
                </div>
              ) : (
                openMaintenance.slice(0, 4).map((req) => {
                  const property = properties.find((p) => p.id === req.property_id)
                  return (
                    <Link
                      key={req.id}
                      href={`/maintenance`}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors ${
                        req.is_damp_mould ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      {req.is_damp_mould ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{req.description}</p>
                        <p className="text-xs text-muted-foreground">{property?.address}</p>
                      </div>
                      <Badge
                        variant={
                          req.urgency === 'emergency'
                            ? 'red'
                            : req.urgency === 'high'
                            ? 'amber'
                            : 'secondary'
                        }
                        className="shrink-0 capitalize text-xs"
                      >
                        {req.urgency}
                      </Badge>
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
