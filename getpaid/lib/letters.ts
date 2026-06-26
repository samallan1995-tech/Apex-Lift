import { formatCurrency, formatDate, InterestBreakdown } from './interest';
import type { Invoice } from './types';
import type { CompanySettings } from './types';

export type LetterStep = 1 | 2 | 3;

interface LetterContext {
  invoice: Invoice;
  settings: CompanySettings;
  breakdown: InterestBreakdown;
  paymentDeadline?: Date;
}

function paymentSection(settings: CompanySettings): string {
  const lines: string[] = ['Please arrange payment to:'];
  if (settings.bankName) lines.push(`Bank: ${settings.bankName}`);
  if (settings.accountName) lines.push(`Account Name: ${settings.accountName}`);
  if (settings.accountNumber) lines.push(`Account Number: ${settings.accountNumber}`);
  if (settings.sortCode) lines.push(`Sort Code: ${settings.sortCode}`);
  if (settings.paymentReference) lines.push(`Reference: ${settings.paymentReference}`);
  if (settings.stripePaymentLink) lines.push(`Online Payment: ${settings.stripePaymentLink}`);
  return lines.join('\n');
}

function interestBreakdownSection(breakdown: InterestBreakdown): string {
  return `OUTSTANDING DEBT CALCULATION
─────────────────────────────────────────
Original Invoice Amount:    ${formatCurrency(breakdown.originalDebt)}
Payment Due Date:           ${formatDate(breakdown.dueDate)}
Calculated As Of:           ${formatDate(breakdown.asOfDate)}
Days Overdue:               ${breakdown.daysOverdue} days

Statutory Interest Rate:    ${breakdown.annualRate.toFixed(2)}% per annum
  (8% statutory + ${breakdown.boeBaseRate}% Bank of England base rate)
Daily Interest:             ${formatCurrency(breakdown.dailyInterestAmount)} / day
Total Interest Accrued:     ${formatCurrency(breakdown.totalInterest)}

Fixed-Sum Compensation:     ${formatCurrency(breakdown.fixedCompensation)}
  (under s.5A of the Late Payment of Commercial Debts (Interest) Act 1998)
─────────────────────────────────────────
TOTAL NOW OWED:             ${formatCurrency(breakdown.totalOwed)}
─────────────────────────────────────────`;
}

// ---------------------------------------------------------------------------
// Step 1 — Friendly Reminder
// ---------------------------------------------------------------------------

export function generateStep1(ctx: LetterContext): string {
  const { invoice, settings, breakdown } = ctx;
  const today = formatDate(new Date());

  return `${settings.companyName}
${settings.address}
${settings.contactName ? `Attn: ${settings.contactName}` : ''}
${settings.email}
${settings.phone ?? ''}

${today}

${invoice.clientName}
${invoice.clientAddress ?? ''}

RE: Invoice ${invoice.invoiceNumber} — Friendly Payment Reminder

Dear ${invoice.clientName},

I hope this message finds you well. I am writing to draw your attention to the above invoice, which appears to have passed its payment due date.

${interestBreakdownSection(breakdown)}

I appreciate that oversights can happen and am sure this is simply an administrative matter. Could you please arrange payment at your earliest convenience, or let me know if there is anything you need from me to process this — such as a copy of the invoice or a purchase order reference.

${paymentSection(settings)}

If you have already arranged payment, please disregard this notice and accept my apologies for any inconvenience.

Yours sincerely,

${settings.contactName ?? settings.companyName}
${settings.companyName}
${settings.email}
${settings.phone ?? ''}

---
Note: Under the Late Payment of Commercial Debts (Interest) Act 1998, statutory interest and compensation are accruing on the outstanding balance. Templates and calculations are for general guidance only — not legal advice.`;
}

// ---------------------------------------------------------------------------
// Step 2 — Firm Follow-Up
// ---------------------------------------------------------------------------

export function generateStep2(ctx: LetterContext): string {
  const { invoice, settings, breakdown } = ctx;
  const today = formatDate(new Date());

  return `${settings.companyName}
${settings.address}
${settings.contactName ? `Attn: ${settings.contactName}` : ''}
${settings.email}
${settings.phone ?? ''}

${today}

${invoice.clientName}
${invoice.clientAddress ?? ''}

RE: Invoice ${invoice.invoiceNumber} — Second Notice, Overdue Payment

Dear ${invoice.clientName},

I refer to my previous reminder regarding invoice ${invoice.invoiceNumber} dated ${formatDate(new Date(invoice.issueDate))}, which remains outstanding.

I must ask you to treat this matter as urgent. Statutory interest continues to accrue on this debt under the Late Payment of Commercial Debts (Interest) Act 1998.

${interestBreakdownSection(breakdown)}

Please arrange settlement in full within 7 days of the date of this letter.

${paymentSection(settings)}

If you are experiencing difficulty making payment, I am open to a discussion about a short-term payment arrangement. Please contact me immediately to resolve this.

If I do not receive payment or a satisfactory response within the time stated above, I will have no choice but to pursue this matter further, which may include the instruction of a debt recovery service or legal proceedings. This could result in additional costs being added to the sum owed, which you may be liable for.

Yours sincerely,

${settings.contactName ?? settings.companyName}
${settings.companyName}
${settings.email}
${settings.phone ?? ''}

---
Note: Templates and calculations are for general guidance only — not legal advice. Verify the current Bank of England base rate and seek professional advice before issuing a Letter Before Action.`;
}

// ---------------------------------------------------------------------------
// Step 3 — Formal Letter Before Action
// ---------------------------------------------------------------------------

export function generateStep3(ctx: LetterContext): string {
  const { invoice, settings, breakdown, paymentDeadline } = ctx;
  const today = formatDate(new Date());
  const deadline = paymentDeadline
    ? formatDate(paymentDeadline)
    : formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // default 14 days

  return `${settings.companyName}
${settings.address}
${settings.contactName ? `Attn: ${settings.contactName}` : ''}
${settings.email}
${settings.phone ?? ''}

${today}

SENT BY [EMAIL / FIRST CLASS POST / RECORDED DELIVERY]

${invoice.clientName}
${invoice.clientAddress ?? '[Client Address]'}

RE: FORMAL LETTER BEFORE ACTION — Invoice ${invoice.invoiceNumber}

Dear Sir or Madam,

I am writing to you as a formal letter before action in respect of the debt described below, which remains unpaid despite previous correspondence.

CREDITOR:  ${settings.companyName}, ${settings.address}
DEBTOR:    ${invoice.clientName}${invoice.clientAddress ? `, ${invoice.clientAddress}` : ''}

DEBT DETAILS:
  Invoice Number:   ${invoice.invoiceNumber}
  Invoice Date:     ${formatDate(new Date(invoice.issueDate))}
  Payment Due:      ${formatDate(breakdown.dueDate)}

${interestBreakdownSection(breakdown)}

STATUTORY AUTHORITY:
The interest and compensation figures above are calculated in accordance with the Late Payment of Commercial Debts (Interest) Act 1998 (as amended). Statutory interest accrues at a rate of 8% above the Bank of England base rate (currently ${breakdown.boeBaseRate}%), giving a combined rate of ${breakdown.annualRate.toFixed(2)}% per annum.

The fixed-sum compensation of ${formatCurrency(breakdown.fixedCompensation)} is payable as a statutory right under s.5A of the Act and is not subject to negotiation.

PAYMENT DEMAND:
I hereby formally demand payment of the total sum of ${formatCurrency(breakdown.totalOwed)} in full by no later than:

  *** ${deadline} ***

${paymentSection(settings)}

WHAT WILL HAPPEN IF YOU DO NOT PAY:
If I do not receive payment in full by the date above, I intend to commence legal proceedings in the County Court (or, where appropriate, the High Court) without further notice. You may be liable for court fees, legal costs, and any further interest that accrues.

Alternatively, I may refer this matter to a debt collection agency or seek a county court judgment (CCJ) against you, which may affect your credit rating and ability to obtain finance.

I invite you to contact me immediately to resolve this matter and avoid the above consequences.

Yours faithfully,

${settings.contactName ?? settings.companyName}
${settings.companyName}
${settings.email}
${settings.phone ?? ''}

---
DISCLAIMER: This letter is generated from a template. Templates and calculations are for general guidance, not legal advice. Verify the current Bank of England base rate (${breakdown.boeBaseRate}% used here) and seek professional legal advice before commencing court proceedings.`;
}

export function generateLetter(step: LetterStep, ctx: LetterContext): string {
  switch (step) {
    case 1: return generateStep1(ctx);
    case 2: return generateStep2(ctx);
    case 3: return generateStep3(ctx);
  }
}

export const LETTER_LABELS: Record<LetterStep, { title: string; description: string; tone: string }> = {
  1: {
    title: 'Friendly Reminder',
    description: 'Polite first notice — assumes good faith, requests payment.',
    tone: 'Polite',
  },
  2: {
    title: 'Firm Follow-Up',
    description: 'Firmer second notice — states consequences if unpaid within 7 days.',
    tone: 'Firm',
  },
  3: {
    title: 'Letter Before Action',
    description: 'Formal LBA — includes full statutory interest breakdown and court warning.',
    tone: 'Formal',
  },
};
