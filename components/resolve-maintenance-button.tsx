'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle } from 'lucide-react'

export function ResolveMaintenanceButton({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResolve = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolutionNotes: notes }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Marked as resolved', description: 'Audit trail updated.' })
      setOpen(false)
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="shrink-0 text-green-600 border-green-200 hover:bg-green-50">
        <CheckCircle className="h-4 w-4 mr-1" /> Resolve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Resolved</DialogTitle>
            <DialogDescription>
              Add resolution notes for your compliance audit trail. This record is timestamped and
              cannot be altered.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Resolution Notes (recommended for Awaab&apos;s Law compliance)</Label>
            <Textarea
              placeholder="e.g. Contractor attended on [date]. Damp treated, replastered, repainted. Follow-up inspection scheduled."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={loading}>
              {loading ? 'Saving...' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
