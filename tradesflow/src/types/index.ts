export type UserRole = 'admin' | 'engineer'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'invoiced' | 'cancelled'
export type SubscriptionTier = 'trial' | 'starter' | 'pro'
export type CertType = 'gas_safe' | 'niceic' | 'electrical' | 'other'

export interface User {
  id: string
  email: string
  business_name: string
  subscription_tier: SubscriptionTier
  stripe_customer_id?: string
  trial_ends_at?: string
  created_at: string
}

export interface Engineer {
  id: string
  user_id: string
  name: string
  phone: string
  vehicle_reg?: string
  color: string
  created_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string
  address: string
  postcode: string
  notes?: string
  is_repeat: boolean
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  engineer_id: string
  customer_id: string
  reference: string
  job_type: string
  description?: string
  scheduled_date: string
  scheduled_time: string
  duration_hours: number
  status: JobStatus
  notes?: string
  completion_photo_url?: string
  created_at: string
  engineer?: Engineer
  customer?: Customer
}

export interface Quote {
  id: string
  job_id: string
  labour_cost: number
  materials_cost: number
  total: number
  vat_amount: number
  stripe_payment_link?: string
  pdf_url?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  created_at: string
  job?: Job
}

export interface Invoice {
  id: string
  quote_id: string
  paid_at?: string
  payment_method?: string
  stripe_payment_intent_id?: string
  created_at: string
  quote?: Quote
}

export interface Certificate {
  id: string
  engineer_id: string
  type: CertType
  cert_number?: string
  expiry_date: string
  image_url?: string
  created_at: string
  engineer?: Engineer
}

export interface SmsLog {
  id: string
  job_id: string
  customer_phone: string
  message: string
  twilio_sid?: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sent_at: string
}
