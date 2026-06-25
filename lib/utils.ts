import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpiryStatus(expiryDate: string): 'red' | 'amber' | 'green' | 'unknown' {
  if (!expiryDate) return 'unknown'
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days < 0) return 'red'
  if (days < 7) return 'red'
  if (days < 30) return 'amber'
  return 'green'
}

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date())
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy')
}

export function getPropertyStatus(
  certificates: Array<{ expiry_date: string | null }>
): 'red' | 'amber' | 'green' {
  if (!certificates.length) return 'red'

  const statuses = certificates
    .filter((c) => c.expiry_date)
    .map((c) => getExpiryStatus(c.expiry_date!))

  if (statuses.includes('red')) return 'red'
  if (statuses.includes('amber')) return 'amber'
  return 'green'
}

export const STATUS_COLORS = {
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  unknown: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
  },
} as const

export const CERTIFICATE_TYPES = [
  { value: 'gas_safety', label: 'Gas Safety Certificate', renewalYears: 1 },
  { value: 'epc', label: 'Energy Performance Certificate (EPC)', renewalYears: 10 },
  { value: 'eicr', label: 'Electrical Installation Condition Report (EICR)', renewalYears: 5 },
  { value: 'pat', label: 'PAT Testing', renewalYears: 5 },
  { value: 'legionella', label: 'Legionella Risk Assessment', renewalYears: 2 },
  { value: 'fire_safety', label: 'Fire Safety Certificate', renewalYears: 1 },
  { value: 'hmo_licence', label: 'HMO Licence', renewalYears: 5 },
] as const

export type CertificateType = (typeof CERTIFICATE_TYPES)[number]['value']
