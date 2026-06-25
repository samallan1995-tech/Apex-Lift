import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { notFound } from 'next/navigation'
import { getExpiryStatus, getDaysUntilExpiry, formatDate, CERTIFICATE_TYPES } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  ArrowLeft,
  FileCheck,
  Wrench,
  FileText,
  Shield,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { AddCertificateDialog } from '@/components/add-certificate-dialog'
import { DeletePropertyButton } from '@/components/delete-property-button'

interface Params {
  params: { id: string }
}

export default async function PropertyDetailPage({ params }: Params) {
  const session = await auth()
  const userId = session?.user?.id

  const properties = await sql`
    SELECT * FROM properties
    WHERE id = ${params.id} AND user_id = ${userId}
    LIMIT 1
  `

  if (!properties.length) notFound()
  const property = properties[0] as {
    id: string
    address: string
    postcode: string
    bedrooms: number
    tenant_name: string | null
    tenant_email: string | null
    tenant_portal_token: string
    property_type: string
    is_hmo: boolean
    notes: string | null
    created_at: string
  }

  const certificates = await sql`
    SELECT * FROM certificates
    WHERE property_id = ${params.id}
    ORDER BY expiry_date ASC NULLS LAST
  ` as Array<{
    id: string
    type: string
    expiry_date: string | null
    issue_date: string | null
    image_url: string | null
    file_name: string | null
    notes: string | null
    uploaded_at: string
  }>

  const maintenanceRequests = await sql`
    SELECT * FROM maintenance_requests
    WHERE property_id = ${params.id}
    ORDER BY created_at DESC
    LIMIT 20
  ` as Array<{
    id: string
    description: string
    urgency: string
    status: string
    is_damp_mould: boolean
    created_at: string
    resolved_at: string | null
    assessment_due_at: string | null
    remediation_due_at: string | null
  }>

  const astAgreements = await sql`
    SELECT * FROM ast_agreements
    WHERE property_id = ${params.id}
    ORDER BY generated_at DESC
    LIMIT 5
  ` as Array<{
    id: string
    tenant_name: string
    rent_amount: string
    start_date: string
    end_date: string
    generated_at: string
    pdf_url: string | null
  }>

  const tenantPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/tenant/${property.tenant_portal_token}`

  const requiredCerts = ['gas_safety', 'epc', 'eicr', 'pat', 'legionella']
  const missingCerts = requiredCerts.filter((t) => !certificates.some((c) => c.type === t))

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/properties"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to properties
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{property.address}</h1>
            <p className="text-muted-foreground mt-1">
              {property.postcode} · {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}{' '}
              {property.property_type}
              {property.tenant_name ? ` · Tenant: ${property.tenant_name}` : ' · Vacant'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/ast/new?propertyId=${property.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" /> Generate AST
              </Button>
            </Link>
            <DeletePropertyButton propertyId={property.id} />
          </div>
        </div>
      </div>

      {missingCerts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-700">Missing certificates</p>
              <p className="text-sm text-amber-600 mt-1">
                {missingCerts
                  .map((t) => CERTIFICATE_TYPES.find((c) => c.value === t)?.label ?? t)
                  .join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates">
            <FileCheck className="h-4 w-4 mr-1.5" /> Certificates
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-1.5" /> Maintenance ({maintenanceRequests.filter(m => m.status !== 'resolved').length})
          </TabsTrigger>
          <TabsTrigger value="ast">
            <FileText className="h-4 w-4 mr-1.5" /> AST Agreements
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <Shield className="h-4 w-4 mr-1.5" /> Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Compliance Certificates</h2>
            <AddCertificateDialog propertyId={property.id} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CERTIFICATE_TYPES.map((certType) => {
              const cert = certificates.find((c) => c.type === certType.value)
              const status = cert?.expiry_date ? getExpiryStatus(cert.expiry_date) : 'unknown'
              const days = cert?.expiry_date ? getDaysUntilExpiry(cert.expiry_date) : null

              return (
                <Card
                  key={certType.value}
                  className={`border-l-4 ${
                    !cert
                      ? 'border-l-gray-300'
                      : status === 'red'
                      ? 'border-l-red-500'
                      : status === 'amber'
                      ? 'border-l-amber-500'
                      : 'border-l-green-500'
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm">{certType.label}</p>
                        {cert?.expiry_date ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {formatDate(cert.expiry_date)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Not uploaded</p>
                        )}
                        {cert?.expiry_date && days !== null && (
                          <p
                            className={`text-xs font-medium mt-0.5 ${
                              status === 'red'
                                ? 'text-red-600'
                                : status === 'amber'
                                ? 'text-amber-600'
                                : 'text-green-600'
                            }`}
                          >
                            {days < 0
                              ? 'Expired'
                              : days === 0
                              ? 'Expires today'
                              : `${days} days remaining`}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Renew every {certType.renewalYears} year{certType.renewalYears !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {cert ? (
                        <Badge
                          variant={status as 'red' | 'amber' | 'green'}
                          className="shrink-0 text-xs"
                        >
                          {status === 'green' ? '✓' : status === 'amber' ? '!' : '✗'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 text-xs text-gray-500">
                          Missing
                        </Badge>
                      )}
                    </div>
                    {cert?.image_url && (
                      <a
                        href={cert.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" /> View certificate
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Maintenance Requests</h2>
            <div className="flex gap-2">
              <a
                href={tenantPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Tenant portal link
              </a>
            </div>
          </div>
          {maintenanceRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No maintenance requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {maintenanceRequests.map((req) => (
                <Card
                  key={req.id}
                  className={req.is_damp_mould ? 'border-red-200' : ''}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {req.is_damp_mould && (
                            <Badge variant="red" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Awaab&apos;s Law
                            </Badge>
                          )}
                          <Badge
                            variant={
                              req.urgency === 'emergency'
                                ? 'red'
                                : req.urgency === 'high'
                                ? 'amber'
                                : 'secondary'
                            }
                            className="text-xs capitalize"
                          >
                            {req.urgency}
                          </Badge>
                          <Badge
                            variant={req.status === 'resolved' ? 'green' : 'outline'}
                            className="text-xs capitalize"
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mt-2">{req.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(req.created_at)}
                          </span>
                          {req.assessment_due_at && req.status !== 'resolved' && (
                            <span className="flex items-center gap-1 text-amber-600">
                              Assessment due: {formatDate(req.assessment_due_at)}
                            </span>
                          )}
                          {req.remediation_due_at && req.status !== 'resolved' && (
                            <span className="flex items-center gap-1 text-amber-600">
                              Remediation due: {formatDate(req.remediation_due_at)}
                            </span>
                          )}
                          {req.resolved_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Resolved: {formatDate(req.resolved_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ast" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">AST Agreements</h2>
            <Link href={`/ast/new?propertyId=${property.id}`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Generate New AST
              </Button>
            </Link>
          </div>
          {astAgreements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No AST agreements generated yet</p>
              <Link href={`/ast/new?propertyId=${property.id}`}>
                <Button size="sm" className="mt-3">Generate AST Agreement</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {astAgreements.map((ast) => (
                <Card key={ast.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ast.tenant_name}</p>
                        <p className="text-xs text-muted-foreground">
                          £{ast.rent_amount}/month · {formatDate(ast.start_date)} – {formatDate(ast.end_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated: {formatDate(ast.generated_at)}
                        </p>
                      </div>
                      {ast.pdf_url && (
                        <a href={ast.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Download PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <ComplianceChecklist property={property} certificates={certificates} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ComplianceChecklist({
  property,
  certificates,
}: {
  property: { property_type: string; is_hmo: boolean }
  certificates: Array<{ type: string; expiry_date: string | null }>
}) {
  const checks = [
    {
      category: 'Pre-tenancy',
      items: [
        { id: 'gas_safety', label: 'Gas Safety Certificate', required: true, period: 'Annual' },
        { id: 'epc', label: 'Energy Performance Certificate (EPC)', required: true, period: 'Every 10 years' },
        { id: 'eicr', label: 'Electrical Installation Condition Report (EICR)', required: true, period: 'Every 5 years' },
        { id: 'legionella', label: 'Legionella Risk Assessment', required: true, period: 'Every 2 years' },
        { id: 'pat', label: 'PAT Testing', required: property.property_type === 'hmo', period: 'Every 5 years' },
        { id: 'deposit_protection', label: 'Deposit protected in government scheme', required: true, period: 'Per tenancy' },
        { id: 'ast_signed', label: 'Signed AST Agreement', required: true, period: 'Per tenancy' },
        { id: 'how_to_rent', label: 'How to Rent guide provided to tenant', required: true, period: 'Per tenancy' },
      ],
    },
    {
      category: 'Ongoing',
      items: [
        { id: 'smoke_detector', label: 'Smoke detector on every floor', required: true, period: 'Check annually' },
        { id: 'co_detector', label: 'CO detector near solid fuel appliances', required: true, period: 'Check annually' },
        { id: 'damp_mould', label: 'Awaab\'s Law: Respond to damp/mould within 7 days', required: true, period: 'Ongoing' },
        { id: 'repairs', label: 'Respond to repair requests within reasonable time', required: true, period: 'Ongoing' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Renters&apos; Rights Act 2025:</strong> This checklist reflects the updated requirements
          under the new legislation. Section 21 no-fault evictions are abolished. Awaab&apos;s Law applies
          to all damp and mould complaints.
        </p>
      </div>

      {checks.map((group) => (
        <div key={group.category}>
          <h3 className="font-semibold mb-3">{group.category} Requirements</h3>
          <div className="space-y-2">
            {group.items.map((item) => {
              const cert = certificates.find((c) => c.type === item.id)
              const hasCert = !!cert?.expiry_date
              const status = hasCert ? getExpiryStatus(cert!.expiry_date!) : null
              const complete = hasCert && status !== 'red'

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    !item.required
                      ? 'opacity-60 border-dashed'
                      : complete
                      ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-red-200 bg-red-50/50 dark:bg-red-900/10'
                  }`}
                >
                  {complete ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <div className={`h-5 w-5 rounded-full border-2 shrink-0 ${item.required ? 'border-red-400' : 'border-gray-300'}`} />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  {!item.required && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
