import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { formatDate, getDaysUntilExpiry, CERTIFICATE_TYPES } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react'

export default async function CompliancePage() {
  const session = await auth()
  const userId = session?.user?.id ?? ''

  type PropertyRow = { id: string; address: string; postcode: string }
  type CertRow2 = { id: string; property_id: string; type: string; expiry_date: string | null; address: string }
  type MaintenanceRow2 = { id: string; description: string; status: string; created_at: string; assessment_due_at: string | null; remediation_due_at: string | null; assessed_at: string | null; address: string }

  const properties = (await sql`
    SELECT id, address, postcode FROM cg_properties WHERE user_id = ${userId}
  `) as unknown as PropertyRow[]

  const certs = properties.length
    ? ((await sql`
        SELECT c.*, p.address
        FROM cg_certificates c
        JOIN cg_properties p ON p.id = c.property_id
        WHERE p.user_id = ${userId}
      `) as unknown as CertRow2[])
    : ([] as CertRow2[])

  const maintenance = properties.length
    ? ((await sql`
        SELECT mr.*, p.address
        FROM cg_maintenance_requests mr
        JOIN cg_properties p ON p.id = mr.property_id
        WHERE p.user_id = ${userId}
          AND mr.is_damp_mould = true
          AND mr.status != 'resolved'
      `) as unknown as MaintenanceRow2[])
    : ([] as MaintenanceRow2[])

  const complianceScore = calculateScore(properties, certs, maintenance)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance Overview</h1>
        <p className="text-muted-foreground mt-1">
          Your compliance status under the Renters&apos; Rights Act 2025
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold mb-3 ${
                complianceScore >= 80
                  ? 'bg-green-100 text-green-700'
                  : complianceScore >= 50
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {complianceScore}%
            </div>
            <p className="font-semibold text-lg">Compliance Score</p>
            <p className="text-sm text-muted-foreground mt-1">
              {complianceScore >= 80
                ? 'Good standing'
                : complianceScore >= 50
                ? 'Action required'
                : 'Urgent attention needed'}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SummaryRow
              label="Properties managed"
              value={properties.length.toString()}
              status="info"
            />
            <SummaryRow
              label="Certificates expiring in 30 days"
              value={certs.filter(c => {
                if (!c.expiry_date) return false
                const d = getDaysUntilExpiry(c.expiry_date)
                return d >= 0 && d <= 30
              }).length.toString()}
              status={certs.some(c => {
                if (!c.expiry_date) return false
                return getDaysUntilExpiry(c.expiry_date) <= 7
              }) ? 'red' : 'amber'}
            />
            <SummaryRow
              label="Expired certificates"
              value={certs.filter(c => c.expiry_date && getDaysUntilExpiry(c.expiry_date) < 0).length.toString()}
              status={certs.some(c => c.expiry_date && getDaysUntilExpiry(c.expiry_date) < 0) ? 'red' : 'green'}
            />
            <SummaryRow
              label="Open Awaab's Law cases"
              value={maintenance.length.toString()}
              status={maintenance.length > 0 ? 'red' : 'green'}
            />
          </CardContent>
        </Card>
      </div>

      {maintenance.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Awaab&apos;s Law — Open Damp/Mould Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenance.map((req) => {
              const assessmentOverdue =
                req.assessment_due_at &&
                !req.assessed_at &&
                new Date(req.assessment_due_at) < new Date()
              return (
                <div key={req.id} className="p-3 rounded-lg border border-red-200 bg-red-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{req.description}</p>
                      <p className="text-xs text-muted-foreground">{req.address}</p>
                      <div className="flex gap-3 mt-1.5 text-xs">
                        <span>Reported: {formatDate(req.created_at)}</span>
                        {req.assessment_due_at && (
                          <span className={assessmentOverdue ? 'text-red-600 font-bold' : 'text-amber-600'}>
                            {assessmentOverdue ? '⚠ OVERDUE: ' : 'Assessment due: '}
                            {formatDate(req.assessment_due_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href="/maintenance">
                      <Button size="sm" variant="destructive">Respond</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certificate Status by Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No properties yet. <Link href="/properties/new" className="text-primary hover:underline">Add one</Link> to see compliance status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Property</th>
                    {CERTIFICATE_TYPES.slice(0, 5).map((t) => (
                      <th key={t.value} className="text-center py-2 px-2 font-medium text-xs">
                        {t.value === 'gas_safety' ? 'Gas' :
                         t.value === 'epc' ? 'EPC' :
                         t.value === 'eicr' ? 'EICR' :
                         t.value === 'pat' ? 'PAT' : 'Leg'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr key={prop.id} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="py-2 pr-4">
                        <Link href={`/properties/${prop.id}`} className="hover:underline font-medium">
                          {prop.address}
                        </Link>
                        <p className="text-xs text-muted-foreground">{prop.postcode}</p>
                      </td>
                      {CERTIFICATE_TYPES.slice(0, 5).map((certType) => {
                        const cert = certs.find(
                          (c) => c.property_id === prop.id && c.type === certType.value
                        )
                        if (!cert?.expiry_date) {
                          return (
                            <td key={certType.value} className="text-center py-2 px-2">
                              <span className="inline-block w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs leading-5">?</span>
                            </td>
                          )
                        }
                        const days = getDaysUntilExpiry(cert.expiry_date)
                        return (
                          <td key={certType.value} className="text-center py-2 px-2">
                            <span
                              className={`inline-block w-5 h-5 rounded-full text-xs leading-5 font-bold ${
                                days < 0
                                  ? 'bg-red-500 text-white'
                                  : days < 30
                                  ? 'bg-amber-400 text-white'
                                  : 'bg-green-500 text-white'
                              }`}
                            >
                              {days < 0 ? '✗' : '✓'}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'red' | 'amber' | 'green' | 'info'
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-semibold ${
          status === 'red'
            ? 'text-red-600'
            : status === 'amber'
            ? 'text-amber-600'
            : status === 'green'
            ? 'text-green-600'
            : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function calculateScore(
  properties: Array<{ id: string }>,
  certs: Array<{ property_id: string; type: string; expiry_date: string | null }>,
  maintenance: Array<{ id: string }>
): number {
  if (!properties.length) return 100

  const required = ['gas_safety', 'epc', 'eicr']
  let total = 0
  let passing = 0

  for (const prop of properties) {
    for (const certType of required) {
      total++
      const cert = certs.find((c) => c.property_id === prop.id && c.type === certType)
      if (cert?.expiry_date && getDaysUntilExpiry(cert.expiry_date) > 0) passing++
    }
  }

  const awaaabsPenalty = maintenance.length * 10
  const baseScore = total > 0 ? Math.round((passing / total) * 100) : 100
  return Math.max(0, baseScore - awaaabsPenalty)
}
