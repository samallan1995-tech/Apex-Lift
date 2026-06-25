import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getPropertyStatus, getDaysUntilExpiry, CERTIFICATE_TYPES } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Plus, ArrowRight, Bed, User, MapPin } from 'lucide-react'

interface Property {
  id: string
  address: string
  postcode: string
  bedrooms: number
  tenant_name: string | null
  tenant_email: string | null
  created_at: string
}

interface Certificate {
  id: string
  property_id: string
  type: string
  expiry_date: string | null
}

const STATUS_LABELS = {
  red: 'Urgent',
  amber: 'Expiring soon',
  green: 'Compliant',
}

export default async function PropertiesPage() {
  const session = await auth()
  const userId = session?.user?.id ?? ''

  const properties = (await sql`
    SELECT id, address, postcode, bedrooms, tenant_name, tenant_email, created_at
    FROM cg_properties
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as unknown as Property[]

  const certificates = properties.length
    ? ((await sql`
        SELECT id, property_id, type, expiry_date
        FROM cg_certificates
        WHERE property_id = ANY(${properties.map((p) => p.id)})
      `) as unknown as Certificate[])
    : ([] as Certificate[])

  const certsByProperty = certificates.reduce(
    (acc, cert) => {
      if (!acc[cert.property_id]) acc[cert.property_id] = []
      acc[cert.property_id].push(cert)
      return acc
    },
    {} as Record<string, Certificate[]>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your rental portfolio</p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Add your first rental property to start tracking compliance certificates and
                maintenance.
              </p>
              <Link href="/properties/new">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" /> Add Your First Property
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((property) => {
            const certs = certsByProperty[property.id] ?? []
            const status = getPropertyStatus(certs)
            const requiredTypes = ['gas_safety', 'epc', 'eicr', 'legionella']
            const missingTypes = requiredTypes.filter(
              (t) => !certs.some((c: Certificate) => c.type === t && c.expiry_date)
            )
            const expiringSoon = certs.filter((c: Certificate) => {
              if (!c.expiry_date) return false
              const days = getDaysUntilExpiry(c.expiry_date)
              return days >= 0 && days <= 30
            })

            return (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card
                  className={`h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                    status === 'red'
                      ? 'border-l-red-500'
                      : status === 'amber'
                      ? 'border-l-amber-500'
                      : 'border-l-green-500'
                  }`}
                >
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            status === 'red'
                              ? 'bg-red-500'
                              : status === 'amber'
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                        />
                        <Badge variant={status as 'red' | 'amber' | 'green'} className="text-xs">
                          {STATUS_LABELS[status]}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold text-sm leading-tight mb-1">{property.address}</h3>

                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {property.postcode}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Bed className="h-3 w-3" />
                        {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}
                      </div>
                      {property.tenant_name && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {property.tenant_name}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {CERTIFICATE_TYPES.slice(0, 5).map((certType) => {
                          const cert = certs.find((c: Certificate) => c.type === certType.value)
                          const isMissing = !cert?.expiry_date
                          const days = cert?.expiry_date ? getDaysUntilExpiry(cert.expiry_date) : null
                          const certStatus =
                            isMissing
                              ? 'missing'
                              : days! < 0
                              ? 'expired'
                              : days! < 7
                              ? 'urgent'
                              : days! < 30
                              ? 'soon'
                              : 'ok'

                          return (
                            <span
                              key={certType.value}
                              title={certType.label}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                certStatus === 'ok'
                                  ? 'bg-green-100 text-green-700'
                                  : certStatus === 'soon'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {certType.value === 'gas_safety'
                                ? 'Gas'
                                : certType.value === 'epc'
                                ? 'EPC'
                                : certType.value === 'eicr'
                                ? 'EICR'
                                : certType.value === 'pat'
                                ? 'PAT'
                                : 'Leg'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
