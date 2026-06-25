-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (mirrors auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'starter', 'pro')),
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Engineers
CREATE TABLE public.engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_reg TEXT,
  color TEXT NOT NULL DEFAULT '#14b8a6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  notes TEXT,
  is_repeat BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES public.engineers(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  reference TEXT NOT NULL,
  job_type TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL DEFAULT '09:00',
  duration_hours NUMERIC NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled')),
  notes TEXT,
  completion_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotes
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  labour_cost INTEGER NOT NULL DEFAULT 0, -- pence
  materials_cost INTEGER NOT NULL DEFAULT 0, -- pence
  vat_amount INTEGER NOT NULL DEFAULT 0, -- pence
  total INTEGER NOT NULL DEFAULT 0, -- pence
  stripe_payment_link TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engineer_id UUID NOT NULL REFERENCES public.engineers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('gas_safe', 'niceic', 'electrical', 'other')),
  cert_number TEXT,
  expiry_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Logs
CREATE TABLE public.sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users own their data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Engineers belong to user" ON public.engineers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Customers belong to user" ON public.customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Jobs belong to user" ON public.jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Quotes via job" ON public.quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = quotes.job_id AND user_id = auth.uid())
);
CREATE POLICY "Invoices via quote" ON public.invoices FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.jobs j ON j.id = q.job_id
    WHERE q.id = invoices.quote_id AND j.user_id = auth.uid()
  )
);
CREATE POLICY "Certs via engineer" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.engineers WHERE id = certificates.engineer_id AND user_id = auth.uid())
);
CREATE POLICY "SMS logs via job" ON public.sms_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = sms_logs.job_id AND user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_jobs_user_date ON public.jobs(user_id, scheduled_date);
CREATE INDEX idx_jobs_engineer ON public.jobs(engineer_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_customers_postcode ON public.customers(postcode);
CREATE INDEX idx_certs_expiry ON public.certificates(expiry_date);

-- Auto-update repeat customer flag
CREATE OR REPLACE FUNCTION update_repeat_customer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.customers
  SET is_repeat = TRUE
  WHERE id = NEW.customer_id
    AND (SELECT COUNT(*) FROM public.jobs WHERE customer_id = NEW.customer_id) > 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_job_insert
  AFTER INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_repeat_customer();
