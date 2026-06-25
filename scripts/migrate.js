const { neon } = require('@neondatabase/serverless')

async function migrate() {
  const sql = neon(process.env.DATABASE_URL)

  console.log('Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      subscription_tier VARCHAR(50) DEFAULT 'trial',
      subscription_status VARCHAR(50) DEFAULT 'active',
      trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      address TEXT NOT NULL,
      postcode VARCHAR(20) NOT NULL,
      bedrooms INTEGER DEFAULT 1,
      tenant_name VARCHAR(255),
      tenant_email VARCHAR(255),
      tenant_portal_token VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
      property_type VARCHAR(50) DEFAULT 'house',
      is_hmo BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS certificates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      expiry_date DATE,
      issue_date DATE,
      image_url TEXT,
      file_name VARCHAR(255),
      notes TEXT,
      reminder_30_sent BOOLEAN DEFAULT false,
      reminder_7_sent BOOLEAN DEFAULT false,
      uploaded_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      photos_urls TEXT[] DEFAULT '{}',
      urgency VARCHAR(50) DEFAULT 'normal',
      status VARCHAR(50) DEFAULT 'open',
      is_damp_mould BOOLEAN DEFAULT false,
      assessment_due_at TIMESTAMPTZ,
      remediation_due_at TIMESTAMPTZ,
      assessed_at TIMESTAMPTZ,
      remediation_started_at TIMESTAMPTZ,
      resolved_at TIMESTAMPTZ,
      resolution_notes TEXT,
      resolution_photos TEXT[] DEFAULT '{}',
      tenant_name VARCHAR(255),
      tenant_email VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS ast_agreements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      landlord_name VARCHAR(255) NOT NULL,
      landlord_address TEXT NOT NULL,
      landlord_email VARCHAR(255) NOT NULL,
      tenant_name VARCHAR(255) NOT NULL,
      tenant_email VARCHAR(255),
      rent_amount NUMERIC(10, 2) NOT NULL,
      deposit_amount NUMERIC(10, 2) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      rent_due_day INTEGER DEFAULT 1,
      deposit_scheme VARCHAR(255),
      deposit_scheme_ref VARCHAR(255),
      pdf_url TEXT,
      generated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS compliance_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB DEFAULT '{}',
      status VARCHAR(50) DEFAULT 'info',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE certificates ADD CONSTRAINT IF NOT EXISTS certificates_property_type_unique UNIQUE (property_id, type)`.catch(() => {})

  await sql`CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_certificates_property_id ON certificates(property_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON certificates(expiry_date)`
  await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_requests(property_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_compliance_logs_property_id ON compliance_logs(property_id)`

  console.log('Migrations complete!')
}

migrate().catch(console.error)
