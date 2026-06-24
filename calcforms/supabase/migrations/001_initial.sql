-- Enable extensions
create extension if not exists "uuid-ossp";

-- Orgs
create table orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'solo' check (plan in ('solo','team','firm')),
  stripe_customer_id text,
  stripe_subscription_id text,
  white_label_domain text,
  brand_logo text,
  brand_color text,
  created_at timestamptz default now()
);

-- Org members
create table org_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Forms
create table forms (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  title text not null default 'Untitled Form',
  schema jsonb not null default '{"fields":[]}'::jsonb,
  formulas jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published')),
  public_slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Submissions
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  computed jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Templates
create table templates (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('accounting','legal','consulting')),
  title text not null,
  description text,
  schema jsonb not null default '{"fields":[]}'::jsonb,
  formulas jsonb not null default '[]'::jsonb,
  preview text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS policies
alter table orgs enable row level security;
alter table org_members enable row level security;
alter table forms enable row level security;
alter table submissions enable row level security;

-- Orgs: owner can do everything
create policy "org_owner" on orgs for all using (owner_id = auth.uid());

-- Org members: members can read their orgs
create policy "org_member_read" on orgs for select
  using (id in (select org_id from org_members where user_id = auth.uid()));

-- Forms: org members can manage
create policy "forms_org_access" on forms for all
  using (org_id in (
    select org_id from org_members where user_id = auth.uid()
    union select id from orgs where owner_id = auth.uid()
  ));

-- Public forms read (for /f/[slug])
create policy "forms_public_read" on forms for select
  using (status = 'published');

-- Submissions: org members can read, anyone can insert
create policy "submissions_insert" on submissions for insert with check (true);
create policy "submissions_org_read" on submissions for select
  using (form_id in (
    select id from forms where org_id in (
      select org_id from org_members where user_id = auth.uid()
      union select id from orgs where owner_id = auth.uid()
    )
  ));

-- Templates: public read
alter table templates enable row level security;
create policy "templates_public_read" on templates for select using (is_active = true);

-- Trigger: update forms.updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger forms_updated_at before update on forms
  for each row execute function update_updated_at();

-- Helper: get user's org (first match)
create or replace function get_user_org(uid uuid)
returns uuid as $$
  select id from orgs where owner_id = uid limit 1;
$$ language sql security definer;

-- Seed templates
insert into templates (category, title, description, schema, formulas) values
(
  'accounting',
  'Tax Return Fee Estimator',
  'Calculate accounting fees based on income brackets and complexity',
  '{"fields":[
    {"id":"f1","type":"heading","label":"Tax Return Fee Estimator"},
    {"id":"f2","type":"select","label":"Filing Type","required":true,"options":[{"label":"Self-Assessment (Basic)","value":"basic"},{"label":"Self-Assessment (Complex)","value":"complex"},{"label":"Partnership Return","value":"partnership"},{"label":"Corporation Tax","value":"ct"}]},
    {"id":"f3","type":"currency","label":"Gross Income (£)","required":true,"placeholder":"e.g. 85000","prefix":"£"},
    {"id":"f4","type":"number","label":"Number of income sources","required":true,"defaultValue":1,"min":1,"max":20},
    {"id":"f5","type":"select","label":"VAT registered?","options":[{"label":"No","value":"no"},{"label":"Yes","value":"yes"}]},
    {"id":"f6","type":"text","label":"Full Name","required":true},
    {"id":"f7","type":"text","label":"Email Address","required":true}
  ]}',
  '[
    {"name":"base_fee","fieldId":"calc_base","expression":"IF(f2==\"basic\",150,IF(f2==\"complex\",250,IF(f2==\"partnership\",400,600)))","label":"Base Fee","format":"currency"},
    {"name":"income_supplement","fieldId":"calc_income","expression":"IF(f3>100000,150,IF(f3>50000,75,0))","label":"Income Supplement","format":"currency"},
    {"name":"source_fee","fieldId":"calc_sources","expression":"(f4-1)*25","label":"Additional Sources Fee","format":"currency"},
    {"name":"vat_fee","fieldId":"calc_vat","expression":"IF(f5==\"yes\",200,0)","label":"VAT Registration Fee","format":"currency"},
    {"name":"subtotal","fieldId":"calc_subtotal","expression":"base_fee+income_supplement+source_fee+vat_fee","label":"Subtotal","format":"currency"},
    {"name":"vat_amount","fieldId":"calc_vat_amt","expression":"subtotal*0.2","label":"VAT (20%)","format":"currency"},
    {"name":"total","fieldId":"calc_total","expression":"subtotal+vat_amount","label":"Total Fee (inc. VAT)","format":"currency"}
  ]'
),
(
  'legal',
  'Conveyancing Quote Calculator',
  'Generate residential property conveyancing quotes instantly',
  '{"fields":[
    {"id":"f1","type":"heading","label":"Conveyancing Quote"},
    {"id":"f2","type":"select","label":"Transaction Type","required":true,"options":[{"label":"Purchase","value":"purchase"},{"label":"Sale","value":"sale"},{"label":"Remortgage","value":"remortgage"}]},
    {"id":"f3","type":"currency","label":"Property Value (£)","required":true,"placeholder":"e.g. 350000","prefix":"£"},
    {"id":"f4","type":"select","label":"Property Type","options":[{"label":"Freehold","value":"freehold"},{"label":"Leasehold","value":"leasehold"},{"label":"New Build","value":"newbuild"}]},
    {"id":"f5","type":"select","label":"Is this a cash purchase?","options":[{"label":"No (Mortgage)","value":"no"},{"label":"Yes (Cash)","value":"yes"}]},
    {"id":"f6","type":"select","label":"Help to Buy / Shared Ownership?","options":[{"label":"No","value":"no"},{"label":"Yes","value":"yes"}]},
    {"id":"f7","type":"text","label":"Your Name","required":true},
    {"id":"f8","type":"text","label":"Email","required":true}
  ]}',
  '[
    {"name":"legal_fee","fieldId":"calc_legal","expression":"IF(f3<200000,850,IF(f3<400000,1100,IF(f3<600000,1400,1800)))","label":"Legal Fee","format":"currency"},
    {"name":"leasehold_supplement","fieldId":"calc_lease","expression":"IF(f4==\"leasehold\",300,IF(f4==\"newbuild\",250,0))","label":"Property Type Supplement","format":"currency"},
    {"name":"mortgage_fee","fieldId":"calc_mortgage","expression":"IF(f5==\"no\",150,0)","label":"Mortgage Administration","format":"currency"},
    {"name":"htb_fee","fieldId":"calc_htb","expression":"IF(f6==\"yes\",400,0)","label":"Help to Buy Fee","format":"currency"},
    {"name":"sdlt_applicable","fieldId":"calc_sdlt_flag","expression":"IF(f2==\"purchase\",1,0)","label":"SDLT Applicable","format":"number"},
    {"name":"subtotal","fieldId":"calc_sub","expression":"legal_fee+leasehold_supplement+mortgage_fee+htb_fee","label":"Legal Fees Subtotal","format":"currency"},
    {"name":"disbursements","fieldId":"calc_disb","expression":"IF(f2==\"purchase\",350,IF(f2==\"remortgage\",150,200))","label":"Disbursements (est.)","format":"currency"},
    {"name":"vat","fieldId":"calc_vat","expression":"subtotal*0.2","label":"VAT (20%)","format":"currency"},
    {"name":"total","fieldId":"calc_total","expression":"subtotal+vat+disbursements","label":"Total Estimate","format":"currency"}
  ]'
),
(
  'consulting',
  'Project Proposal Fee Calculator',
  'Build instant consulting project proposals with tiered pricing',
  '{"fields":[
    {"id":"f1","type":"heading","label":"Project Fee Estimate"},
    {"id":"f2","type":"text","label":"Company Name","required":true},
    {"id":"f3","type":"select","label":"Project Type","required":true,"options":[{"label":"Strategy & Advisory","value":"strategy"},{"label":"Operations Improvement","value":"ops"},{"label":"Digital Transformation","value":"digital"},{"label":"Financial Modelling","value":"finance"}]},
    {"id":"f4","type":"number","label":"Estimated Duration (weeks)","required":true,"min":1,"max":52,"defaultValue":4},
    {"id":"f5","type":"number","label":"Number of Consultants Required","min":1,"max":20,"defaultValue":1},
    {"id":"f6","type":"select","label":"Engagement Intensity","options":[{"label":"Light (2 days/week)","value":"light"},{"label":"Standard (3 days/week)","value":"standard"},{"label":"Full-time (5 days/week)","value":"full"}]},
    {"id":"f7","type":"select","label":"Travel Required?","options":[{"label":"No","value":"no"},{"label":"Occasional","value":"occasional"},{"label":"Frequent","value":"frequent"}]},
    {"id":"f8","type":"text","label":"Contact Name","required":true},
    {"id":"f9","type":"text","label":"Email","required":true}
  ]}',
  '[
    {"name":"day_rate","fieldId":"calc_rate","expression":"IF(f3==\"strategy\",1800,IF(f3==\"digital\",1600,IF(f3==\"finance\",2000,1400)))","label":"Day Rate (£)","format":"currency"},
    {"name":"days_per_week","fieldId":"calc_days","expression":"IF(f6==\"light\",2,IF(f6==\"full\",5,3))","label":"Days/Week","format":"number"},
    {"name":"total_days","fieldId":"calc_total_days","expression":"f4*days_per_week*f5","label":"Total Consultant Days","format":"number"},
    {"name":"fee_base","fieldId":"calc_fee","expression":"total_days*day_rate","label":"Consulting Fee","format":"currency"},
    {"name":"travel_cost","fieldId":"calc_travel","expression":"IF(f7==\"occasional\",1500,IF(f7==\"frequent\",4500,0))","label":"Travel & Expenses","format":"currency"},
    {"name":"subtotal","fieldId":"calc_sub","expression":"fee_base+travel_cost","label":"Subtotal","format":"currency"},
    {"name":"vat","fieldId":"calc_vat","expression":"subtotal*0.2","label":"VAT (20%)","format":"currency"},
    {"name":"total","fieldId":"calc_total","expression":"subtotal+vat","label":"Total Project Fee","format":"currency"}
  ]'
);
