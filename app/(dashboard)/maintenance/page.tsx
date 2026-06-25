import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { formatDate, getDaysUntilExpiry } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, Clock, Wrench, CheckCircle } from 'lucide-react'
import { ResolveMaintenanceButton } from '@/components/resolve-maintenance-button'

interface MaintenanceRow {
  id: string
  property_id: string
  description: string
  urgency: string
  status: string
  is_damp_mould: boolean
  created_at: string
  resolved_at: string | null
  assessment_due_at: string | null
  remediation_due_at: string | null
  assessed_at: string | null
  address: string
  postcode: string
}

export default async function MaintenancePage() {
  const session = await auth()
  const userId = session?.user?.id ?? ''

  const requests = (await sql`
    SELECT mr.*, p.address, p.postcode
    FROM cg_maintenance_requests mr
    JOIN cg_properties p ON p.id = mr.property_id
    WHERE p.user_id = ${userId}
    ORDER BY
      mr.is_damp_mould DESC,
      mr.urgency = 'emergency' DESC,
      mr.urgency = 'high' DESC,
      mr.created_at DESC
  `) as unknown as MaintenanceRow[]

  const open = requests.filter((r) => r.status !== 'resolved')
  const resolved = requests.filter((r) => r.status === 'resolved')
  const awaaabs = open.filter((r) => r.is_damp_mould)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Track and resolve maintenance requests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{open.length}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-red-600">{awaaabs.length}</p>
            <p className="text-xs text-muted-foreground">Awaab&apos;s Law</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{open.filter(r => r.urgency === 'emergency').length}</p>
            <p className="text-xs text-muted-foreground">Emergency</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-600">{resolved.length}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {awaaabs.length > 0 && (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Awaab&apos;s Law: {awaaabs.length} damp/mould report{awaaabs.length > 1 ? 's' : ''} require action
              </p>
              <p className="text-sm text-red-600 mt-1">
                Assess within 7 days · Begin remediation within 14 days
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Open Requests ({open.length})</h2>
        {open.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-60" />
            <p>No open maintenance requests</p>
          </div>
        ) : (
          open.map((req: MaintenanceRow) => <MaintenanceCard key={req.id} req={req} />)
        )}
      </div>

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-muted-foreground">Resolved ({resolved.length})</h2>
          {resolved.slice(0, 10).map((req: MaintenanceRow) => (
            <MaintenanceCard key={req.id} req={req} />
          ))}
        </div>
      )}
    </div>
  )
}

function MaintenanceCard({ req }: { req: MaintenanceRow }) {
  const isResolved = req.status === 'resolved'
  const assessmentOverdue =
    req.assessment_due_at &&
    !req.assessed_at &&
    !isResolved &&
    new Date(req.assessment_due_at) < new Date()

  return (
    <Card className={`${req.is_damp_mould && !isResolved ? 'border-red-300' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
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
                variant={isResolved ? 'green' : req.status === 'in_progress' ? 'amber' : 'outline'}
                className="text-xs"
              >
                {req.status === 'in_progress' ? 'In progress' : req.status}
              </Badge>
            </div>

            <p className="font-medium text-sm">{req.description}</p>

            <Link
              href={`/properties/${req.property_id}`}
              className="text-xs text-primary hover:underline"
            >
              {req.address}
            </Link>

            <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Reported: {formatDate(req.created_at)}
              </span>
              {req.assessment_due_at && !isResolved && (
                <span
                  className={`flex items-center gap-1 ${
                    assessmentOverdue ? 'text-red-600 font-medium' : 'text-amber-600'
                  }`}
                >
                  {assessmentOverdue && <AlertTriangle className="h-3 w-3" />}
                  Assessment due: {formatDate(req.assessment_due_at)}
                  {assessmentOverdue && ' (OVERDUE)'}
                </span>
              )}
              {req.remediation_due_at && !isResolved && (
                <span className="flex items-center gap-1 text-amber-600">
                  Remediation due: {formatDate(req.remediation_due_at)}
                </span>
              )}
              {isResolved && req.resolved_at && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Resolved: {formatDate(req.resolved_at)}
                </span>
              )}
            </div>
          </div>

          {!isResolved && <ResolveMaintenanceButton requestId={req.id} />}
        </div>
      </CardContent>
    </Card>
  )
}
