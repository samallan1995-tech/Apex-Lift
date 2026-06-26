/**
 * Late Payment of Commercial Debts (Interest) Act 1998 (as amended)
 * Applies to B2B commercial debts in the UK.
 *
 * NOTE: This is general guidance, not legal advice. Always verify the current
 * Bank of England base rate and seek professional advice before issuing a Letter
 * Before Action.
 */

export const DEFAULT_BOE_BASE_RATE = 4.25; // Update this when BoE changes rates

export interface InterestBreakdown {
  originalDebt: number;
  dueDate: Date;
  asOfDate: Date;
  daysOverdue: number;
  boeBaseRate: number;
  annualRate: number;
  dailyInterestAmount: number;
  totalInterest: number;
  fixedCompensation: number;
  totalOwed: number;
}

/**
 * Returns the fixed-sum compensation under s.5A of the Act.
 */
export function getFixedCompensation(debtAmount: number): number {
  if (debtAmount < 1000) return 40;
  if (debtAmount < 10000) return 70;
  return 100;
}

/**
 * Calculates statutory late payment interest and compensation.
 *
 * Interest accrues from the day AFTER the payment due date.
 * Daily rate = (debt × annualRate%) / 365
 */
export function calculateLatePaymentInterest(
  debtAmount: number,
  dueDate: Date,
  asOfDate: Date = new Date(),
  boeBaseRate: number = DEFAULT_BOE_BASE_RATE
): InterestBreakdown {
  // Normalise to midnight UTC to avoid DST drift
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const asOf = new Date(asOfDate);
  asOf.setHours(0, 0, 0, 0);

  // Interest starts the day AFTER the due date
  const startDate = new Date(due);
  startDate.setDate(startDate.getDate() + 1);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysOverdue = Math.max(
    0,
    Math.floor((asOf.getTime() - startDate.getTime()) / msPerDay) + 1
  );

  const annualRate = 8 + boeBaseRate; // 8% statutory + BoE base rate
  const dailyInterestAmount = (debtAmount * (annualRate / 100)) / 365;

  const totalInterest = parseFloat((dailyInterestAmount * daysOverdue).toFixed(2));
  const fixedCompensation = getFixedCompensation(debtAmount);
  const totalOwed = parseFloat(
    (debtAmount + totalInterest + fixedCompensation).toFixed(2)
  );

  return {
    originalDebt: parseFloat(debtAmount.toFixed(2)),
    dueDate: due,
    asOfDate: asOf,
    daysOverdue,
    boeBaseRate,
    annualRate,
    dailyInterestAmount: parseFloat(dailyInterestAmount.toFixed(4)),
    totalInterest,
    fixedCompensation,
    totalOwed,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
