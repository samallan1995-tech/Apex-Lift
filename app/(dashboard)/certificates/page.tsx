import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  getExpiryStatus,
  getDaysUntilExpiry,
  formatDate,
  CERTIFICATE_TYPES,
} from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileCheck, AlertTriangle, Clock, CheckCircle, ExternalLink } from 'lucide-react'

interface CertRow {
  id: string
  property_id: string
  type: string
  expiry_date: string | null
  issue_date: string | null
  image_url: string | null
  notes: string | null
  uploaded_at: string
  address: string
  postcode: string
}

export default async function CertificatesPage() {
  const session = await auth()
  const userId = session?.user?.id ?? ''

  const certs = (await sql`
    SELECT c.*, p.address, p.postcode
    FROM cg_certificates c
    JOIN cg_properties p ON p.id = c.property_id
    WHERE p.user_id = ${userId}
    ORDER BY c.expiry_date ASC NULLS LAST
  `) as unknown as CertRow[]

  const expired = certs.filter((c) => c.expiry_date && getDaysUntilExpiry(c.expiry_date) < 0)
  const urgent = certs.filter((c) => {
    if (!c.expiry_date) return false
    const d = getDaysUntilExpiry(c.expiry_date)
    return d >= 0 && d < 7
  })
  const expiring = certs.filter((c) => {
    if (!c.expiry_date) return false
    const d = getDaysUntilExpiry(c.expiry_date)
    return d >= 7 && d <= 30
  })
  const valid = certs.filter((c) => c.expiry_date && getDaysUntilExpiry(c.expiry_date) > 30)

  const sections = [
    { label: 'Expired', certs: expired, variant: 'red' as const, icon: AlertTriangle },
    { label: 'Expiring within 7 days', certs: urgent, variant: 'red' as const, icon: AlertTriangle },
    { label: 'Expiring in 7–30 days', certs: expiring, variant: 'amber' as const, icon: Clock },
    { label: 'Valid (30+ days)', certs: valid, variant: 'green' as const, icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground mt-1">All certificates across your portfolio</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-red-600">{expired.length + urgent.length}</p>
            <p className="text-xs text-muted-foreground">Urgent</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-amber-600">{expiring.length}</p>
            <p className="text-xs text-muted-foreground">Expiring soon</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-600">{valid.length}</p>
            <p className="text-xs text-muted-foreground">Valid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{certs.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {certs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">No certificates yet. Add them from a property page.</p>
              <Link href="/properties">
                <Button size="sm" className="mt-3">Go to Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        sections
          .filter((s) => s.certs.length > 0)
          .map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon
                  className={`h-4 w-4 ${
                    section.variant === 'red'
                      ? 'text-red-500'
                      : section.variant === 'amber'
                      ? 'text-amber-500'
                      : 'text-green-500'
                  }`}
                />
                <h2 className="font-semibold text-sm">
                  {section.label} ({section.certs.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.certs.map((cert) => {
                  const certLabel =
                    CERTIFICATE_TYPES.find((t) => t.value === cert.type)?.label ?? cert.type
                  const days = cert.expiry_date ? getDaysUntilExpiry(cert.expiry_date) : null
                  const status = cert.expiry_date ? getExpiryStatus(cert.expiry_date) : 'unknown'

                  return (
                    <Card key={cert.id} className={`border-l-4 ${
                      status === 'red' ? 'border-l-red-500' :
                      status === 'amber' ? 'border-l-amber-500' : 'border-l-green-500'
                    }`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm">{certLabel}</p>
                            <Link
                              href={`/properties/${cert.property_id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {cert.address}
                            </Link>
                            {cert.expiry_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Expires: {formatDate(cert.expiry_date)}
                              </p>
                            )}
                            {days !== null && (
                              <p className={`text-xs font-medium ${
                                days < 0 ? 'text-red-600' :
                                days < 7 ? 'text-red-500' :
                                days < 30 ? 'text-amber-500' : 'text-green-600'
                              }`}>
                                {days < 0 ? `Expired ${Math.abs(days)}d ago` :
                                 days === 0 ? 'Expires today' :
                                 `${days} days remaining`}
                              </p>
                            )}
                          </div>
                          <Badge variant={section.variant} className="text-xs shrink-0">
                            {section.variant === 'green' ? '✓' : days !== null && days < 0 ? 'Expired' : `${days}d`}
                          </Badge>
                        </div>
                        {cert.image_url && (
                          <a
                            href={cert.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
