import { z } from "zod";

export const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  logo: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  emailFrom: z.string().email().optional().or(z.literal("")),
  customDomain: z.string().optional(),
});

export const clientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const contractSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client is required"),
  value: z.coerce.number().positive("Value must be positive"),
  currency: z.string().default("GBP"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  content: z.string().min(1, "Contract content is required"),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).optional(),
});

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.coerce.date().optional(),
  order: z.number().int().default(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  contractId: z.string().optional(),
  milestoneId: z.string().optional(),
  dueDate: z.coerce.date(),
  currency: z.string().default("GBP"),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      amount: z.number().positive(),
    })
  ),
  tax: z.coerce.number().min(0).default(0),
});

export const teamInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["TEAM_MEMBER", "BUSINESS_OWNER"]).default("TEAM_MEMBER"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const signatureSchema = z.object({
  contractId: z.string(),
  signerName: z.string().min(1, "Name is required"),
  signerEmail: z.string().email("Invalid email"),
  signatureData: z.string().min(1, "Signature is required"),
  signatureType: z.enum(["draw", "type"]),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type TeamInviteInput = z.infer<typeof teamInviteSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SignatureInput = z.infer<typeof signatureSchema>;
