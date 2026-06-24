'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatCurrency } from '@/lib/utils';
import { TipTapEditor } from './tiptap-editor';
import { MilestoneBuilder, type Milestone } from './milestone-builder';
import { createContract, updateContract } from '@/app/actions/contracts';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Users,
  Layout,
  Milestone as MilestoneIcon,
} from 'lucide-react';

// ------------ Schemas ------------

const step1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  value: z.coerce.number().positive('Contract value must be positive'),
  currency: z.string().default('GBP'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).optional(),
  notes: z.string().optional(),
});

const fullSchema = step1Schema.extend({
  content: z.string().min(1, 'Contract content is required'),
});

type FormValues = z.infer<typeof fullSchema>;

// ------------ Client / Template types ------------

interface ClientOption {
  id: string;
  companyName: string;
  contactName: string;
}

interface TemplateOption {
  id: string;
  name: string;
  content: string;
  category: string;
}

// ------------ Contract variables ------------

const CONTRACT_VARIABLES: { label: string; key: string }[] = [
  { label: 'Client Name', key: 'client_name' },
  { label: 'Contract Value', key: 'contract_value' },
  { label: 'Start Date', key: 'start_date' },
  { label: 'End Date', key: 'end_date' },
  { label: 'Company Name', key: 'company_name' },
];

// ------------ Default templates ------------

const DEFAULT_TEMPLATES: TemplateOption[] = [
  {
    id: 'freelance-basic',
    name: 'Freelance Services Agreement',
    category: 'Freelance',
    content: `<h1>Freelance Services Agreement</h1>
<p>This agreement is entered into between <strong>{{company_name}}</strong> ("Service Provider") and <strong>{{client_name}}</strong> ("Client") on {{start_date}}.</p>
<h2>1. Services</h2>
<p>The Service Provider agrees to provide the following services as outlined in the project brief and any attached documentation.</p>
<h2>2. Payment</h2>
<p>The Client agrees to pay a total fee of {{contract_value}} for the services outlined. Payment terms are as specified in the milestones section.</p>
<h2>3. Timeline</h2>
<p>Work will commence on {{start_date}} and is expected to be completed by {{end_date}}, subject to timely provision of required assets and feedback from the Client.</p>
<h2>4. Intellectual Property</h2>
<p>Upon receipt of full payment, all intellectual property rights for work created under this agreement will be transferred to the Client.</p>
<h2>5. Confidentiality</h2>
<p>Both parties agree to keep all project details and proprietary information confidential during and after the term of this agreement.</p>
<h2>6. Termination</h2>
<p>Either party may terminate this agreement with 14 days written notice. Work completed to the point of termination will be invoiced accordingly.</p>`,
  },
  {
    id: 'retainer',
    name: 'Monthly Retainer Agreement',
    category: 'Retainer',
    content: `<h1>Monthly Retainer Agreement</h1>
<p>This retainer agreement is made between <strong>{{company_name}}</strong> ("Agency") and <strong>{{client_name}}</strong> ("Client") commencing {{start_date}}.</p>
<h2>1. Retainer Services</h2>
<p>The Agency will provide ongoing services as agreed, with a monthly retainer of {{contract_value}}.</p>
<h2>2. Payment Terms</h2>
<p>The retainer fee is due on the 1st of each month. Late payments will incur a 5% monthly penalty.</p>
<h2>3. Scope of Work</h2>
<p>Services are limited to those specified in the agreed scope. Additional work outside the scope will be quoted separately.</p>
<h2>4. Communication</h2>
<p>Regular updates will be provided monthly. The Client may request status updates at any time.</p>
<h2>5. Termination</h2>
<p>Either party may terminate this agreement with 30 days written notice.</p>`,
  },
  {
    id: 'web-project',
    name: 'Web Development Project Contract',
    category: 'Development',
    content: `<h1>Web Development Project Contract</h1>
<p>This contract is between <strong>{{company_name}}</strong> ("Developer") and <strong>{{client_name}}</strong> ("Client").</p>
<h2>1. Project Scope</h2>
<p>The Developer will design and develop a website as detailed in the project specification document. Total project value: {{contract_value}}.</p>
<h2>2. Project Timeline</h2>
<p>The project will start on {{start_date}} and be delivered by {{end_date}}.</p>
<h2>3. Payment Schedule</h2>
<p>50% deposit is required upon signing. The remaining 50% is due upon final delivery.</p>
<h2>4. Revisions</h2>
<p>This contract includes up to 3 rounds of revisions. Additional revisions will be billed at the standard hourly rate.</p>
<h2>5. Hosting & Maintenance</h2>
<p>Hosting and ongoing maintenance are not included unless separately agreed upon.</p>
<h2>6. Acceptance</h2>
<p>The Client has 7 days to review and accept delivered work. Silence after 7 days constitutes acceptance.</p>`,
  },
];

// ------------ Step indicator ------------

const STEPS = [
  { label: 'Basic Info', icon: Users },
  { label: 'Content', icon: FileText },
  { label: 'Milestones', icon: MilestoneIcon },
  { label: 'Review', icon: Layout },
];

// ------------ Props ------------

interface ContractBuilderProps {
  clients: ClientOption[];
  templates?: TemplateOption[];
  initialData?: Partial<FormValues & { id: string; milestones: Milestone[] }>;
}

// ------------ Component ------------

export function ContractBuilder({ clients, templates = [], initialData }: ContractBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>(initialData?.milestones ?? []);
  const [serverError, setServerError] = useState<string | null>(null);

  const allTemplates = [...DEFAULT_TEMPLATES, ...templates];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      clientId: initialData?.clientId ?? '',
      value: initialData?.value ?? 0,
      currency: initialData?.currency ?? 'GBP',
      startDate: initialData?.startDate ?? '',
      endDate: initialData?.endDate ?? '',
      isRecurring: initialData?.isRecurring ?? false,
      recurringType: initialData?.recurringType,
      notes: initialData?.notes ?? '',
      content: initialData?.content ?? '',
    },
  });

  const watchedValues = watch();
  const isRecurring = watch('isRecurring');
  const content = watch('content');
  const contractValue = watch('value') || 0;
  const currency = watch('currency') || 'GBP';

  async function goNext() {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 0) {
      fieldsToValidate = ['title', 'clientId', 'value'];
    } else if (step === 1) {
      fieldsToValidate = ['content'];
    }
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function loadTemplate(templateId: string) {
    const tpl = allTemplates.find((t) => t.id === templateId);
    if (tpl) {
      setValue('content', tpl.content, { shouldValidate: true });
    }
  }

  function insertVariable(key: string) {
    const current = watch('content') || '';
    // Insert at end of content (simple approach - appends variable)
    setValue('content', current + ` {{${key}}}`, { shouldValidate: true });
  }

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateContract(initialData.id, data, milestones);
        } else {
          await createContract(data, milestones);
        }
        router.push('/contracts');
        router.refresh();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  });

  const selectedClient = clients.find((c) => c.id === watchedValues.clientId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step header */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = i < step;
          const isCurrent = i === step;
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20',
                  !isCurrent && !isCompleted && 'text-muted-foreground cursor-default'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Icon size={14} />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={onSubmit}>
        {/* ---- Step 0: Basic Info ---- */}
        {step === 0 && (
          <div className="space-y-5 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Contract Details</h2>

            <div className="space-y-1.5">
              <Label htmlFor="title">
                Contract Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g. Website Redesign Project"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientId">
                Client <span className="text-destructive">*</span>
              </Label>
              <select
                id="clientId"
                {...register('clientId')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} — {c.contactName}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="value">
                  Contract Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('value')}
                  placeholder="0.00"
                />
                {errors.value && (
                  <p className="text-sm text-destructive">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  {...register('currency')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="isRecurring"
                  type="checkbox"
                  {...register('isRecurring')}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isRecurring" className="cursor-pointer">
                  Recurring contract
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-1.5 pl-6">
                  <Label htmlFor="recurringType">Billing Frequency</Label>
                  <select
                    id="recurringType"
                    {...register('recurringType')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select frequency...</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Internal Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                placeholder="Internal notes (not shown to client)"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        {/* ---- Step 1: Content Editor ---- */}
        {step === 1 && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold">Contract Content</h2>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Load template:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      loadTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Choose template...</option>
                  {allTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variable toolbar */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center">Insert variable:</span>
              {CONTRACT_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="inline-flex items-center px-2 py-1 rounded border border-border bg-muted/40 text-xs hover:bg-accent hover:text-accent-foreground transition-colors font-mono"
                >
                  {`{{${v.key}}}`}
                </button>
              ))}
            </div>

            <TipTapEditor
              value={content}
              onChange={(val) => setValue('content', val, { shouldValidate: true })}
              placeholder="Write your contract here or load a template above..."
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
        )}

        {/* ---- Step 2: Milestones ---- */}
        {step === 2 && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <h2 className="text-lg font-semibold">Payment Milestones</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Break the contract value into milestones. Contract value:{' '}
                <strong>{formatCurrency(contractValue, currency)}</strong>
              </p>
            </div>
            <MilestoneBuilder
              milestones={milestones}
              onChange={setMilestones}
              contractValue={contractValue}
              currency={currency}
            />
          </div>
        )}

        {/* ---- Step 3: Review ---- */}
        {step === 3 && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Review & Save</h2>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Title</dt>
                <dd className="font-medium">{watchedValues.title || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Client</dt>
                <dd className="font-medium">
                  {selectedClient ? selectedClient.companyName : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium">
                  {watchedValues.value
                    ? formatCurrency(watchedValues.value, watchedValues.currency)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Recurring</dt>
                <dd className="font-medium">
                  {watchedValues.isRecurring ? watchedValues.recurringType || 'Yes' : 'No'}
                </dd>
              </div>
              {watchedValues.startDate && (
                <div>
                  <dt className="text-muted-foreground">Start Date</dt>
                  <dd className="font-medium">{watchedValues.startDate}</dd>
                </div>
              )}
              {watchedValues.endDate && (
                <div>
                  <dt className="text-muted-foreground">End Date</dt>
                  <dd className="font-medium">{watchedValues.endDate}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Milestones</dt>
                <dd className="font-medium">{milestones.length} milestone(s)</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Content</dt>
                <dd className="font-medium">
                  {content && content.length > 10 ? `${content.length} chars` : 'Not set'}
                </dd>
              </div>
            </dl>

            {milestones.length > 0 && (
              <div className="border border-border rounded-md overflow-hidden mt-2">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Milestone</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Due Date</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m, i) => (
                      <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="px-3 py-2">{m.title || `Milestone ${i + 1}`}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.dueDate || '—'}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(m.amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border bg-muted/30">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 font-semibold">Total</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrency(
                          milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0),
                          currency
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {serverError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {serverError}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft size={15} />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="gap-2">
              Continue
              <ChevronRight size={15} />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending} className="gap-2 min-w-[120px]">
              {isPending ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : initialData?.id ? (
                'Save Changes'
              ) : (
                'Create Contract'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
