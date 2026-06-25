import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}
const FROM = () => process.env.RESEND_FROM_EMAIL ?? 'noreply@complianceguard.co.uk'

export async function sendCertificateReminder({
  to,
  landlordName,
  propertyAddress,
  certificateType,
  expiryDate,
  daysUntilExpiry,
}: {
  to: string
  landlordName: string
  propertyAddress: string
  certificateType: string
  expiryDate: string
  daysUntilExpiry: number
}) {
  const urgency = daysUntilExpiry <= 7 ? 'URGENT: ' : ''
  const subject = `${urgency}Your ${certificateType} expires on ${expiryDate}`

  await getResend().emails.send({
    from: FROM(),
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceGuard</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">UK Landlord Compliance Made Simple</p>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: 0;">
          ${daysUntilExpiry <= 7 ? `
          <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #991b1b; font-weight: bold; margin: 0;">⚠️ Urgent Action Required</p>
          </div>` : `
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-weight: bold; margin: 0;">⏰ Reminder: ${daysUntilExpiry} days remaining</p>
          </div>`}

          <p style="color: #374151; font-size: 16px;">Dear ${landlordName},</p>

          <p style="color: #374151;">Your <strong>${certificateType}</strong> certificate for:</p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #111827; font-weight: 600;">${propertyAddress}</p>
          </div>

          <p style="color: #374151;">expires on <strong>${expiryDate}</strong> — that's <strong>${daysUntilExpiry} days from now</strong>.</p>

          <p style="color: #374151;">Under UK law, failing to maintain a valid ${certificateType} is a criminal offence and can result in fines up to £5,000.</p>

          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Renew Certificate Now →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            This reminder was sent by ComplianceGuard on behalf of your landlord compliance account.
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #1e3a5f;">Manage your reminders</a>
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendMaintenanceNotification({
  to,
  landlordName,
  propertyAddress,
  requestDescription,
  urgency,
  tenantPortalUrl,
  isAwaaabs = false,
}: {
  to: string
  landlordName: string
  propertyAddress: string
  requestDescription: string
  urgency: string
  tenantPortalUrl: string
  isAwaaabs?: boolean
}) {
  const subject = isAwaaabs
    ? `⚠️ AWAAB'S LAW: Damp/Mould Report — ${propertyAddress}`
    : `New Maintenance Request — ${propertyAddress}`

  await getResend().emails.send({
    from: FROM(),
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceGuard</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: 0;">
          ${isAwaaabs ? `
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #991b1b; font-weight: bold; margin: 0; font-size: 18px;">🚨 Awaab's Law Alert</p>
            <p style="color: #991b1b; margin: 8px 0 0; font-size: 14px;">
              You must assess this damp/mould issue within <strong>7 days</strong> and begin remediation within <strong>14 days</strong> under the Renters' Rights Act 2025.
            </p>
          </div>` : ''}

          <p style="color: #374151;">Dear ${landlordName},</p>
          <p style="color: #374151;">A new maintenance request has been submitted for <strong>${propertyAddress}</strong>:</p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Description:</p>
            <p style="margin: 0; color: #111827;">${requestDescription}</p>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Urgency: <span style="color: ${urgency === 'emergency' ? '#ef4444' : urgency === 'high' ? '#f59e0b' : '#22c55e'}; font-weight: 600;">${urgency.toUpperCase()}</span></p>
          </div>

          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View & Respond →
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: 'Welcome to ComplianceGuard — Your 30-day free trial has started',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceGuard</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">UK Landlord Compliance Made Simple</p>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: 0;">
          <h2 style="color: #111827;">Welcome, ${name}! 🎉</h2>
          <p style="color: #374151;">Your 30-day free trial has started. Here's what you can do:</p>
          <ul style="color: #374151; line-height: 2;">
            <li>Add your rental properties</li>
            <li>Track Gas Safety, EPC, EICR certificates</li>
            <li>Set up automated reminders</li>
            <li>Generate compliant 2025 AST agreements</li>
            <li>Stay Awaab's Law compliant</li>
          </ul>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to Your Dashboard →
            </a>
          </div>
        </div>
      </div>
    `,
  })
}
