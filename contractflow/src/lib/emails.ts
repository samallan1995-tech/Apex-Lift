import { resend, EMAIL_FROM } from "@/lib/resend";

// ---------------------------------------------------------------------------
// Shared template helpers
// ---------------------------------------------------------------------------

const BRAND_COLOR = "#6366f1";
const BRAND_COLOR_DARK = "#4f46e5";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>ContractFlow</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,${BRAND_COLOR_DARK} 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display:inline-block;background-color:rgba(255,255,255,0.15);border-radius:8px;padding:8px 16px;">
                      <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">&#9632; ContractFlow</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:13px;color:#94a3b8;">Sent by ContractFlow &mdash; Professional Contract &amp; Invoice Management</p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">If you have questions, reply to this email or contact your account manager.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 0 auto;">
    <tr>
      <td style="border-radius:8px;background:linear-gradient(135deg,${BRAND_COLOR} 0%,${BRAND_COLOR_DARK} 100%);">
        <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;color:#475569;line-height:1.6;">${text}</p>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748b;background-color:#f8fafc;border-radius:4px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#0f172a;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

function infoTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:16px 0;">
    ${rows.map(([label, value]) => infoRow(label, value)).join("\n")}
  </table>`;
}

function badge(text: string, color = BRAND_COLOR): string {
  return `<span style="display:inline-block;padding:4px 12px;font-size:12px;font-weight:600;color:${color};background-color:${color}1a;border-radius:100px;border:1px solid ${color}33;">${text}</span>`;
}

// ---------------------------------------------------------------------------
// 1. Contract signing request
// ---------------------------------------------------------------------------

export async function sendContractEmail(
  to: string,
  contractTitle: string,
  clientName: string,
  signingUrl: string,
  orgName: string
): Promise<void> {
  const html = baseTemplate(`
    ${heading(`You have a contract to sign`)}
    ${paragraph(`Hi ${clientName},`)}
    ${paragraph(`<strong>${orgName}</strong> has sent you a contract for your review and signature. Please take a moment to read the document carefully before signing.`)}
    ${divider()}
    ${infoTable([
      ["Organisation", orgName],
      ["Contract", contractTitle],
    ])}
    ${paragraph(`Click the button below to review and sign your contract. This link is unique to you and secure.`)}
    ${ctaButton("Review &amp; Sign Contract", signingUrl)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">If you were not expecting this email or believe it was sent in error, you can safely ignore it. The link will expire in 30 days.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Action required: Please sign "${contractTitle}"`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 2. Contract signed confirmation (to the organisation)
// ---------------------------------------------------------------------------

export async function sendContractSignedEmail(
  to: string,
  contractTitle: string,
  clientName: string,
  orgName: string
): Promise<void> {
  const html = baseTemplate(`
    ${heading(`Contract signed`)}
    ${paragraph(`Great news! <strong>${clientName}</strong> has signed the contract.`)}
    ${divider()}
    ${infoTable([
      ["Organisation", orgName],
      ["Contract", contractTitle],
      ["Signed by", clientName],
      ["Status", "Signed"],
    ])}
    ${paragraph(`You can log in to your ContractFlow dashboard to view and download the signed document.`)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">This is an automated notification from ContractFlow.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Contract signed: "${contractTitle}"`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 3. Invoice email with payment link
// ---------------------------------------------------------------------------

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  paymentUrl: string,
  orgName: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

  const html = baseTemplate(`
    ${heading(`Invoice from ${orgName}`)}
    ${paragraph(`You have received an invoice from <strong>${orgName}</strong>. Please review the details below and complete payment by the due date.`)}
    ${divider()}
    ${infoTable([
      ["Invoice number", invoiceNumber],
      ["Amount due", formattedAmount],
      ["Due date", dueDate],
      ["Sent by", orgName],
    ])}
    ${paragraph(`Paying online is quick, secure, and takes less than a minute.`)}
    ${ctaButton("Pay Invoice Now", paymentUrl)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">If you have already paid this invoice, please disregard this email. For billing queries, please contact ${orgName} directly.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Invoice ${invoiceNumber} from ${orgName} — ${formattedAmount} due ${dueDate}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 4. Payment received confirmation
// ---------------------------------------------------------------------------

export async function sendPaymentReceivedEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  orgName: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

  const html = baseTemplate(`
    ${heading(`Payment received — thank you!`)}
    ${paragraph(`We have successfully received your payment for the invoice below.`)}
    ${divider()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:8px;">
          <div style="font-size:36px;margin-bottom:8px;">&#10003;</div>
          <div style="font-size:28px;font-weight:700;color:#16a34a;">${formattedAmount}</div>
          <div style="font-size:14px;color:#15803d;margin-top:4px;">Payment confirmed</div>
        </td>
      </tr>
    </table>
    ${infoTable([
      ["Invoice number", invoiceNumber],
      ["Amount paid", formattedAmount],
      ["Received from", orgName],
      ["Status", "Paid"],
    ])}
    ${paragraph(`Your payment has been processed and your invoice has been marked as paid. A receipt is attached to this email for your records.`)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">This is an automated payment confirmation from ContractFlow.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Payment received: Invoice ${invoiceNumber} — ${formattedAmount}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 5. Payment reminder
// ---------------------------------------------------------------------------

export async function sendPaymentReminderEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  paymentUrl: string,
  orgName: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

  const html = baseTemplate(`
    ${heading(`Friendly payment reminder`)}
    ${paragraph(`This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> from <strong>${orgName}</strong> is due soon.`)}
    ${divider()}
    ${infoTable([
      ["Invoice number", invoiceNumber],
      ["Amount due", formattedAmount],
      ["Due date", dueDate],
    ])}
    ${paragraph(`Please complete your payment before the due date to avoid any late fees. If you have already paid, please disregard this reminder.`)}
    ${ctaButton("Pay Now", paymentUrl)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">If you have questions about this invoice, please contact ${orgName} directly.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Reminder: Invoice ${invoiceNumber} from ${orgName} is due on ${dueDate}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 6. Overdue notice
// ---------------------------------------------------------------------------

export async function sendOverdueReminderEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  paymentUrl: string,
  orgName: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

  const html = baseTemplate(`
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;font-weight:600;color:#c2410c;">&#9888; Overdue payment notice</p>
        </td>
      </tr>
    </table>
    ${heading(`Invoice ${invoiceNumber} is overdue`)}
    ${paragraph(`Invoice <strong>${invoiceNumber}</strong> from <strong>${orgName}</strong> was due on <strong>${dueDate}</strong> and has not been paid.`)}
    ${divider()}
    ${infoTable([
      ["Invoice number", invoiceNumber],
      ["Amount overdue", formattedAmount],
      ["Due date", dueDate],
      ["Status", "Overdue"],
    ])}
    ${paragraph(`Please settle this invoice as soon as possible. Continued non-payment may affect your account status.`)}
    ${ctaButton("Pay Overdue Invoice", paymentUrl)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">If you believe this is an error or have already made payment, please contact ${orgName} immediately.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Overdue: Invoice ${invoiceNumber} from ${orgName} — action required`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 7. Team invitation
// ---------------------------------------------------------------------------

export async function sendTeamInviteEmail(
  to: string,
  orgName: string,
  inviterName: string,
  inviteUrl: string
): Promise<void> {
  const html = baseTemplate(`
    ${heading(`You've been invited to join ${orgName}`)}
    ${paragraph(`<strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on ContractFlow — a professional contract and invoice management platform.`)}
    ${divider()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:24px;background-color:#fafafa;border-radius:8px;border:1px solid #e2e8f0;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;">You have been invited to</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${orgName}</p>
          <p style="margin:8px 0 0 0;font-size:13px;color:#64748b;">by ${inviterName}</p>
        </td>
      </tr>
    </table>
    ${paragraph(`Click the button below to accept your invitation and set up your account. This invitation link will expire in 7 days.`)}
    ${ctaButton("Accept Invitation", inviteUrl)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">If you were not expecting this invitation, you can safely ignore this email. You will not be added to the organisation unless you click the link above.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `${inviterName} has invited you to join ${orgName} on ContractFlow`,
    html,
  });
}

// ---------------------------------------------------------------------------
// 8. Milestone notification
// ---------------------------------------------------------------------------

export async function sendMilestoneNotificationEmail(
  to: string,
  contractTitle: string,
  milestoneName: string,
  amount: number,
  dueDate: string,
  orgName: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

  const html = baseTemplate(`
    ${heading(`Upcoming milestone: ${milestoneName}`)}
    ${paragraph(`This is a notification that a contract milestone is approaching. Please review the details below and take any necessary action.`)}
    ${divider()}
    ${infoTable([
      ["Organisation", orgName],
      ["Contract", contractTitle],
      ["Milestone", milestoneName],
      ["Amount", formattedAmount],
      ["Due date", dueDate],
    ])}
    ${paragraph(`Log in to your ContractFlow dashboard to manage this milestone, create an invoice, or update its status.`)}
    ${divider()}
    ${paragraph(`<small style="color:#94a3b8;">This is an automated milestone notification from ContractFlow.</small>`)}
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Milestone due ${dueDate}: "${milestoneName}" on "${contractTitle}"`,
    html,
  });
}
