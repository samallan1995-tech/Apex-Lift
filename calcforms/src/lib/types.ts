import { ConditionalLogic } from './formula-engine'
export type { ConditionalLogic, ConditionalRule } from './formula-engine'

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'currency' | 'file' | 'formula' | 'heading' | 'paragraph'

export interface FieldOption {
  label: string
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  helpText?: string
  options?: FieldOption[]
  defaultValue?: string | number
  conditionalLogic?: ConditionalLogic
  formulaExpression?: string
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
}

export interface Formula {
  name: string
  fieldId: string
  expression: string
  label?: string
  format?: 'number' | 'currency' | 'percentage'
}

export interface FormTheme {
  primaryColor?: string
  fontFamily?: string
  borderRadius?: string
  backgroundColor?: string
  logo?: string
  buttonText?: string
  successMessage?: string
}

export interface FormSchema {
  fields: FormField[]
}

export type FormStatus = 'draft' | 'published'

export interface Form {
  id: string
  org_id: string
  title: string
  schema: FormSchema
  formulas: Formula[]
  theme: FormTheme
  status: FormStatus
  public_slug: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  form_id: string
  answers: Record<string, string | number | null>
  computed: Record<string, number | null>
  created_at: string
}

export interface Template {
  id: string
  category: 'accounting' | 'legal' | 'consulting'
  title: string
  description: string
  schema: FormSchema
  formulas: Formula[]
  preview?: string
}

export interface Org {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: 'solo' | 'team' | 'firm'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  white_label_domain?: string
  brand_logo?: string
  brand_color?: string
  created_at: string
}

export const PLANS = {
  solo: { name: 'Solo', price: 49, formLimit: 3, removeBranding: false, whiteLabel: false, teamSeats: 1 },
  team: { name: 'Team', price: 99, formLimit: Infinity, removeBranding: true, whiteLabel: false, teamSeats: 10 },
  firm: { name: 'Firm', price: 199, formLimit: Infinity, removeBranding: true, whiteLabel: true, teamSeats: Infinity },
} as const
