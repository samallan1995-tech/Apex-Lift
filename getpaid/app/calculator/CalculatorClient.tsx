'use client';

import { useState, useCallback } from 'react';
import {
  calculateLatePaymentInterest,
  formatCurrency,
  formatDate,
  DEFAULT_BOE_BASE_RATE,
} from '@/lib/interest';
import Link from 'next/link';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function CalculatorClient() {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [asOfDate, setAsOfDate] = useState(todayISO());
  const [boeRate, setBoeRate] = useState(String(DEFAULT_BOE_BASE_RATE));
  const [result, setResult] = useState<ReturnType<typeof calculateLatePaymentInterest> | null>(null);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    setError('');
    const debtAmount = parseFloat(amount);
    if (!amount || isNaN(debtAmount) || debtAmount <= 0) {
      setError('Please enter a valid invoice amount greater than £0.');
      return;
    }
    if (!dueDate) {
      setError('Please enter the payment due date.');
      return;
    }
    const due = new Date(dueDate);
    const asOf = asOfDate ? new Date(asOfDate) : new Date();
    if (asOf <= due) {
      setError('The "as of" date must be after the due date for interest to accrue.');
      return;
    }
    const rate = parseFloat(boeRate);
    if (isNaN(rate) || rate < 0 || rate > 20) {
      setError('Please enter a valid Bank of England base rate (0–20%).');
      return;
    }
    setResult(calculateLatePaymentInterest(debtAmount, due, asOf, rate));
  }, [amount, dueDate, asOfDate, boeRate]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calculate();
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="amount">
              Invoice Amount (£) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="input pl-7"
                placeholder="5000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="dueDate">
              Payment Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="dueDate"
              type="date"
              className="input"
              value={dueDate}
              max={todayISO()}
              onChange={(e) => setDueDate(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <div>
            <label className="label" htmlFor="asOfDate">
              Calculate Interest As Of
            </label>
            <input
              id="asOfDate"
              type="date"
              className="input"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <div>
            <label className="label" htmlFor="boeRate">
              Bank of England Base Rate (%) <span className="text-red-500">*</span>
            </label>
            <input
              id="boeRate"
              type="number"
              min="0"
              max="20"
              step="0.01"
              className="input"
              value={boeRate}
              onChange={(e) => setBoeRate(e.target.value)}
              onKeyDown={handleKey}
            />
            <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              ⚠ Check the current rate at{' '}
              <span className="font-medium">bankofengland.co.uk</span> — it changes. The statutory
              rate is always 8% + base rate.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-5">
          <button onClick={calculate} className="btn-primary w-full sm:w-auto px-8 py-2.5">
            Calculate →
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card border-brand-200 bg-brand-50/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Interest Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <Row label="Original Invoice Amount" value={formatCurrency(result.originalDebt)} />
                <Row label="Payment Due Date" value={formatDate(result.dueDate)} />
                <Row label="Interest Calculated As Of" value={formatDate(result.asOfDate)} />
                <Row
                  label="Days Overdue"
                  value={`${result.daysOverdue} day${result.daysOverdue !== 1 ? 's' : ''}`}
                />
                <Row
                  label="Statutory Interest Rate"
                  value={`${result.annualRate.toFixed(2)}% p.a. (8% + ${result.boeBaseRate}% BoE base rate)`}
                />
                <Row
                  label="Daily Interest"
                  value={`${formatCurrency(result.dailyInterestAmount)} / day`}
                />
                <Row
                  label="Total Interest Accrued"
                  value={formatCurrency(result.totalInterest)}
                  highlight
                />
                <Row
                  label={`Fixed-Sum Compensation (s.5A)`}
                  value={formatCurrency(result.fixedCompensation)}
                  highlight
                />
              </tbody>
              <tfoot>
                <tr className="bg-brand-600 text-white">
                  <td className="px-4 py-3 font-bold text-base rounded-bl-lg">TOTAL NOW OWED</td>
                  <td className="px-4 py-3 font-bold text-xl text-right rounded-br-lg">
                    {formatCurrency(result.totalOwed)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Interest accrues from the day after the due date ({formatDate(result.dueDate)}).
            Fixed compensation of {formatCurrency(result.fixedCompensation)} is a one-off statutory
            entitlement under s.5A of the Late Payment of Commercial Debts (Interest) Act 1998.
            Applies to B2B commercial debts only — consumer and some contract debts differ.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link href="/login" className="btn-primary">
              Generate a formal demand letter →
            </Link>
            <button
              onClick={() => {
                const text = [
                  `Late Payment Interest Breakdown`,
                  `Original Amount: ${formatCurrency(result.originalDebt)}`,
                  `Due Date: ${formatDate(result.dueDate)}`,
                  `Days Overdue: ${result.daysOverdue}`,
                  `Annual Rate: ${result.annualRate.toFixed(2)}%`,
                  `Daily Interest: ${formatCurrency(result.dailyInterestAmount)}`,
                  `Total Interest: ${formatCurrency(result.totalInterest)}`,
                  `Fixed Compensation: ${formatCurrency(result.fixedCompensation)}`,
                  `TOTAL OWED: ${formatCurrency(result.totalOwed)}`,
                ].join('\n');
                navigator.clipboard.writeText(text);
              }}
              className="btn-secondary"
            >
              Copy breakdown
            </button>
          </div>
        </div>
      )}

      {/* Mini disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        For general guidance only — not legal advice. Verify the current Bank of England base rate
        and seek professional advice before issuing a Letter Before Action.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-brand-50' : 'bg-white'}>
      <td className="px-4 py-3 text-gray-600">{label}</td>
      <td className={`px-4 py-3 text-right font-medium ${highlight ? 'text-brand-700' : 'text-gray-900'}`}>
        {value}
      </td>
    </tr>
  );
}
