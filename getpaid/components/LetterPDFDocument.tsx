/**
 * react-pdf document for chaser letters.
 * Keep this file free of Next.js-specific imports — it runs in a pdf() worker.
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/lib/interest';
import type { InterestBreakdown } from '@/lib/interest';
import type { Invoice } from '@/lib/types';
import type { CompanySettings } from '@/lib/types';
import type { LetterStep } from '@/lib/letters';
import { LETTER_LABELS } from '@/lib/letters';

const BRAND_BLUE = '#0369a1';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 50,
    color: '#111',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND_BLUE,
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_BLUE,
  },
  senderInfo: {
    fontSize: 9,
    color: '#555',
    textAlign: 'right',
  },
  stepBadge: {
    backgroundColor: BRAND_BLUE,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  subject: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 16,
    color: BRAND_BLUE,
  },
  bodyText: {
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#333',
  },
  breakdownBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 4,
    padding: 12,
    marginVertical: 14,
  },
  breakdownTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 8,
    color: BRAND_BLUE,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0f2fe',
  },
  breakdownLabel: {
    color: '#555',
    flex: 1,
  },
  breakdownValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#111',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: BRAND_BLUE,
    padding: 6,
    borderRadius: 2,
    marginTop: 4,
  },
  totalLabel: {
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  totalValue: {
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
  },
  disclaimer: {
    fontSize: 7.5,
    color: '#888',
    marginTop: 24,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingTop: 8,
    lineHeight: 1.5,
  },
  sigBlock: {
    marginTop: 24,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 8,
    color: '#aaa',
  },
});

interface Props {
  invoice: Invoice;
  settings: CompanySettings;
  breakdown: InterestBreakdown;
  step: LetterStep;
  letterText: string;
}

export function LetterPDFDocument({ invoice, settings, breakdown, step, letterText }: Props) {
  const stepMeta = LETTER_LABELS[step];
  const today = formatDate(new Date());

  return (
    <Document
      title={`${invoice.invoiceNumber} — ${stepMeta.title}`}
      author={settings.companyName}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>GetPaid</Text>
            <Text style={{ fontSize: 9, color: '#555' }}>Late Payment Demand</Text>
          </View>
          <View>
            <Text style={styles.senderInfo}>{settings.companyName}</Text>
            {settings.address && (
              <Text style={styles.senderInfo}>{settings.address.replace(/\n/g, ', ')}</Text>
            )}
            {settings.contactName && <Text style={styles.senderInfo}>{settings.contactName}</Text>}
            <Text style={styles.senderInfo}>{settings.email}</Text>
            {settings.phone && <Text style={styles.senderInfo}>{settings.phone}</Text>}
          </View>
        </View>

        {/* Step badge */}
        <Text style={styles.stepBadge}>
          Step {step} of 3 — {stepMeta.title.toUpperCase()} ({stepMeta.tone})
        </Text>

        {/* Date + addressee */}
        <Text style={[styles.bodyText, { marginBottom: 14 }]}>{today}</Text>
        <Text style={styles.bodyText}>{invoice.clientName}</Text>
        {invoice.clientAddress && (
          <Text style={[styles.bodyText, { color: '#555' }]}>{invoice.clientAddress}</Text>
        )}

        {/* Subject */}
        <Text style={[styles.subject, { marginTop: 12 }]}>
          RE: Invoice {invoice.invoiceNumber} — {stepMeta.title}
        </Text>

        {/* Opening paragraph */}
        {step === 1 && (
          <Text style={styles.bodyText}>
            I hope this message finds you well. I am writing to draw your attention to the above invoice,
            which appears to have passed its payment due date. I appreciate that oversights can happen and
            am sure this is simply an administrative matter. Could you please arrange payment at your
            earliest convenience.
          </Text>
        )}
        {step === 2 && (
          <Text style={styles.bodyText}>
            I refer to my previous reminder regarding invoice {invoice.invoiceNumber} dated{' '}
            {formatDate(new Date(invoice.issueDate))}, which remains outstanding. I must ask you to treat
            this matter as urgent. Statutory interest continues to accrue on this debt under the Late Payment
            of Commercial Debts (Interest) Act 1998. Please arrange settlement in full within 7 days.
          </Text>
        )}
        {step === 3 && (
          <>
            <Text style={[styles.bodyText, { fontFamily: 'Helvetica-Bold', color: '#c00' }]}>
              FORMAL LETTER BEFORE ACTION — WITHOUT PREJUDICE SAVE AS TO COSTS
            </Text>
            <Text style={styles.bodyText}>
              I am writing formally to demand payment of the debt set out below. Despite previous
              correspondence, this invoice remains unpaid. If payment in full is not received by the deadline
              stated below, I intend to commence proceedings in the County Court without further notice.
            </Text>
          </>
        )}

        {/* Interest breakdown box */}
        <View style={styles.breakdownBox}>
          <Text style={styles.breakdownTitle}>Outstanding Debt Calculation</Text>

          {[
            ['Original Invoice Amount', formatCurrency(breakdown.originalDebt)],
            ['Payment Due Date', formatDate(breakdown.dueDate)],
            ['Calculated As Of', formatDate(breakdown.asOfDate)],
            ['Days Overdue', `${breakdown.daysOverdue} days`],
            [`Statutory Rate (8% + ${breakdown.boeBaseRate}% BoE)`, `${breakdown.annualRate.toFixed(2)}% p.a.`],
            ['Daily Interest', formatCurrency(breakdown.dailyInterestAmount)],
            ['Total Interest Accrued', formatCurrency(breakdown.totalInterest)],
            [`Fixed-Sum Compensation (s.5A)`, formatCurrency(breakdown.fixedCompensation)],
          ].map(([label, value]) => (
            <View key={label} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{label}</Text>
              <Text style={styles.breakdownValue}>{value}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL NOW OWED</Text>
            <Text style={styles.totalValue}>{formatCurrency(breakdown.totalOwed)}</Text>
          </View>
        </View>

        {/* Payment details */}
        {(settings.bankName || settings.accountNumber || settings.stripePaymentLink) && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Payment details:</Text>
            {settings.bankName && <Text style={styles.bodyText}>Bank: {settings.bankName}</Text>}
            {settings.accountName && <Text style={styles.bodyText}>Account name: {settings.accountName}</Text>}
            {settings.accountNumber && <Text style={styles.bodyText}>Account number: {settings.accountNumber}</Text>}
            {settings.sortCode && <Text style={styles.bodyText}>Sort code: {settings.sortCode}</Text>}
            {settings.stripePaymentLink && <Text style={styles.bodyText}>Online payment: {settings.stripePaymentLink}</Text>}
          </View>
        )}

        {/* Step-3 deadline */}
        {step === 3 && (
          <Text style={[styles.bodyText, { fontFamily: 'Helvetica-Bold', fontSize: 11, marginTop: 4 }]}>
            Payment deadline: {formatDate(new Date(Date.now() + 14 * 86400000))}
          </Text>
        )}

        {/* Sign-off */}
        <View style={styles.sigBlock}>
          <Text style={styles.bodyText}>Yours {step < 3 ? 'sincerely' : 'faithfully'},</Text>
          <Text style={{ marginTop: 20, fontFamily: 'Helvetica-Bold' }}>
            {settings.contactName ?? settings.companyName}
          </Text>
          <Text style={[styles.bodyText, { marginTop: 2 }]}>{settings.companyName}</Text>
          <Text style={[styles.bodyText, { color: '#555' }]}>{settings.email}</Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          DISCLAIMER: This document was generated from a template. Calculations are based on the Late
          Payment of Commercial Debts (Interest) Act 1998 and are for general guidance only — not legal
          advice. The Bank of England base rate used is {breakdown.boeBaseRate}%; verify the current rate
          at bankofengland.co.uk. Seek professional legal advice before commencing court proceedings.
        </Text>

        {/* Page number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
