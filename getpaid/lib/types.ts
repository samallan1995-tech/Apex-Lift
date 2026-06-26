export type InvoiceStatus = 'Outstanding' | 'Paid' | 'Disputed';

export interface Invoice {
  id: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string; // ISO date string
  dueDate: string;   // ISO date string
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  companyName: string;
  address: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  sortCode?: string;
  paymentReference?: string;
  stripePaymentLink?: string;
  defaultBoeRate: number;
  defaultTone: 'professional' | 'firm' | 'formal';
  logoUrl?: string;
  licenseKey?: string;
  licenseEmail?: string;
  licenseTier?: 'solo' | 'business' | 'oneoff';
}

export interface MagicCode {
  email: string;
  code: string;
  expiresAt: number;
}

export interface ReminderSchedule {
  id: string;
  invoiceId: string;
  daysAfterDue: number;
  step: 1 | 2 | 3;
  lastSentAt?: string;
  enabled: boolean;
}
