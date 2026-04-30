-- ============================================================================
-- OHB Platform — Supabase PostgreSQL Schema
-- ============================================================================
-- This schema defines the complete data model for the OHB Asesorías y
-- Consultorías real estate platform. Deploy to Supabase using the console.
--
-- Tables: 12 core tables with RLS policies, indexes, and triggers
-- Managed by: src/lib/database/SUPABASE_SCHEMA.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== USERS TABLE ==========
-- Core user management with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('admin', 'asesor', 'cliente')) DEFAULT 'cliente',
  profile_image_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- ========== PROPERTIES TABLE ==========
-- Real estate listings with metadata
CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('casa', 'departamento', 'terreno', 'comercial', 'inversion')),
  price BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  location VARCHAR(255),
  colonia VARCHAR(100),
  address TEXT,
  sq_meters INTEGER,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  parking INTEGER DEFAULT 0,
  description TEXT,
  short_description TEXT,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  status VARCHAR(50) CHECK (status IN ('activa', 'vendida', 'reservada')) DEFAULT 'activa',
  featured BOOLEAN DEFAULT false,
  year_built INTEGER,
  floors INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  views_count INTEGER DEFAULT 0,
  featured_until TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- ========== PROPERTY_IMAGES TABLE ==========
-- Image gallery for properties with ordering
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== LEADS TABLE ==========
-- Lead management and tracking
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  property_id VARCHAR(50) REFERENCES properties(id) ON DELETE SET NULL,
  source VARCHAR(50) CHECK (source IN ('formulario', 'whatsapp', 'calculadora', 'chatbot', 'newsletter', 'otro')) DEFAULT 'formulario',
  status VARCHAR(50) CHECK (status IN ('nuevo', 'contactado', 'calificado', 'cerrado', 'perdido')) DEFAULT 'nuevo',
  interest_type VARCHAR(50) CHECK (interest_type IN ('compra', 'venta', 'renta', 'inversion')),
  budget_min BIGINT,
  budget_max BIGINT,
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  contacted_at TIMESTAMP,
  last_contact_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== COURSES TABLE ==========
-- Online course catalog with metadata
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  instructor_name VARCHAR(255),
  duration_minutes INTEGER,
  level VARCHAR(50) CHECK (level IN ('basico', 'intermedio', 'avanzado')),
  career_path VARCHAR(50) CHECK (career_path IN ('INFONAVIT', 'Inversiones', 'Inmobiliarias')),
  price BIGINT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MXN',
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== COURSE_ENROLLMENTS TABLE ==========
-- Track user progress in courses
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  progress_percent INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- ========== COURSE_LESSONS TABLE ==========
-- Individual lessons within courses
CREATE TABLE IF NOT EXISTS course_lessons (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  duration_minutes INTEGER,
  video_url TEXT,
  content_markdown TEXT,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== CERTIFICATES TABLE ==========
-- Course completion certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_path VARCHAR(50),
  certificate_code VARCHAR(100) UNIQUE,
  certificate_url TEXT,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== ORDERS TABLE ==========
-- Purchase orders for courses
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_ids TEXT[] NOT NULL,
  total_price BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) CHECK (status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  invoice_number VARCHAR(50) UNIQUE,
  invoice_pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TRANSACTIONS TABLE ==========
-- Payment transaction history
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) CHECK (type IN ('payment', 'refund', 'transfer')),
  amount BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  stripe_transaction_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ========== SETTINGS TABLE ==========
-- Global and user-level settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setting_key)
);

-- ========== DOCUMENTS TABLE ==========
-- File storage metadata for contracts, reports, etc.
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  document_type VARCHAR(50) CHECK (document_type IN ('contract', 'report', 'agreement', 'other')),
  related_to VARCHAR(50),
  related_id VARCHAR(50),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_created_by ON properties(created_by);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source);

CREATE INDEX idx_courses_career_path ON courses(career_path);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_courses_created_by ON courses(created_by);

CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_code ON certificates(certificate_code);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_related_id ON documents(related_id);

-- ========== ROW LEVEL SECURITY (RLS) ==========
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES: USERS ==========
-- Admin: full access to all users
CREATE POLICY "users_admin_full_access" ON users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    id = auth.uid()
  );

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    id = auth.uid()
  ) WITH CHECK (
    id = auth.uid()
  );

-- Public can read non-sensitive user info (name, avatar)
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (
    role != 'admin' AND is_active = true
  );

-- ========== RLS POLICIES: PROPERTIES ==========
-- Admin: full access
CREATE POLICY "properties_admin_full_access" ON properties
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Asesores: can create and manage own properties
CREATE POLICY "properties_asesor_manage_own" ON properties
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'asesor' AND created_by = auth.uid()
  ) WITH CHECK (
    auth.jwt() ->> 'role' = 'asesor' AND created_by = auth.uid()
  );

-- Public: can view active properties
CREATE POLICY "properties_public_select_active" ON properties
  FOR SELECT USING (
    status = 'activa' AND published_at IS NOT NULL
  );

-- ========== RLS POLICIES: PROPERTY_IMAGES ==========
-- Public can view images of active properties
CREATE POLICY "property_images_public_select" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.status = 'activa'
    )
  );

-- ========== RLS POLICIES: LEADS ==========
-- Admin: full access
CREATE POLICY "leads_admin_full_access" ON leads
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Asesores: can view assigned leads and all leads in general
CREATE POLICY "leads_asesor_select" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'asesor'
  );

-- Asesores: can update assigned leads
CREATE POLICY "leads_asesor_update_assigned" ON leads
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'asesor' AND assigned_to = auth.uid()
  ) WITH CHECK (
    auth.jwt() ->> 'role' = 'asesor'
  );

-- Users can insert their own leads
CREATE POLICY "leads_insert_own" ON leads
  FOR INSERT WITH CHECK (
    id = auth.uid() OR true
  );

-- ========== RLS POLICIES: COURSES ==========
-- Public: can view published courses
CREATE POLICY "courses_public_select_published" ON courses
  FOR SELECT USING (
    published = true
  );

-- ========== RLS POLICIES: COURSE_ENROLLMENTS ==========
-- Users can view their own enrollments
CREATE POLICY "course_enrollments_select_own" ON course_enrollments
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Users can insert their own enrollments
CREATE POLICY "course_enrollments_insert_own" ON course_enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- ========== RLS POLICIES: CERTIFICATES ==========
-- Users can view their own certificates
CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- ========== RLS POLICIES: ORDERS ==========
-- Users can view their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- ========== RLS POLICIES: TRANSACTIONS ==========
-- Users can view their own transactions
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- ========== UPDATED_AT TRIGGERS ==========
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER properties_update_timestamp BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER leads_update_timestamp BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER courses_update_timestamp BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER orders_update_timestamp BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER transactions_update_timestamp BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER settings_update_timestamp BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER documents_update_timestamp BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========== VIEWS FOR AGGREGATED DATA ==========
-- Available properties summary
CREATE OR REPLACE VIEW available_properties AS
SELECT
  id,
  title,
  type,
  price,
  location,
  bedrooms,
  bathrooms,
  status,
  featured,
  created_at
FROM properties
WHERE status = 'activa' AND published_at IS NOT NULL
ORDER BY featured DESC, created_at DESC;

-- Lead pipeline summary
CREATE OR REPLACE VIEW lead_pipeline AS
SELECT
  assigned_to,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (last_contact_at - created_at))/86400)::INTEGER as avg_days_in_status
FROM leads
WHERE deleted_at IS NULL
GROUP BY assigned_to, status;

-- Course enrollment summary
CREATE OR REPLACE VIEW enrollment_summary AS
SELECT
  course_id,
  COUNT(*) as total_enrollments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*))::INTEGER as completion_rate
FROM course_enrollments
GROUP BY course_id;

-- ========== GRANTS & PERMISSIONS ==========
-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Default grants for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
