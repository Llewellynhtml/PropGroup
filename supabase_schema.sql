-- ##################################################################################
-- SUPABASE SCHEMA FOR PROPPOST
-- Run this in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- ##################################################################################

-- 1. CLEANUP EXISITING POLICIES (Safety first)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- Drop all policies on properties
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'properties' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON properties', pol.policyname); 
    END LOOP;
END $$;

-- 2. TABLES ENFORCEMENT
CREATE TABLE IF NOT EXISTS properties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now()
);

-- ENSURE ALL COLUMNS EXIST WITH CORRECT TYPES
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS beds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS baths integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parking integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS size numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by_id uuid,
  ADD COLUMN IF NOT EXISTS created_by_role text,
  ADD COLUMN IF NOT EXISTS agency_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid;

-- 3. RLS POLICIES FOR PROPERTIES
-- Ultra-permissive for troubleshooting to ensure we can actually use the app
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_authenticated_all" ON properties;
CREATE POLICY "properties_authenticated_all" ON properties
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "properties_public_read" ON properties;
CREATE POLICY "properties_public_read" ON properties
    FOR SELECT TO public
    USING (true);

-- 4. AGENTS & AGENCIES TABLES & POLICIES
CREATE TABLE IF NOT EXISTS agents (
    id uuid PRIMARY KEY, -- Maps to auth.users.id
    created_at timestamptz DEFAULT now(),
    full_name text,
    email text,
    agency_id uuid
);

CREATE TABLE IF NOT EXISTS agencies (
    id uuid PRIMARY KEY, -- Maps to auth.users.id
    created_at timestamptz DEFAULT now(),
    agency_name text,
    email text,
    join_code text UNIQUE
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_public_read" ON agents;
CREATE POLICY "agents_public_read" ON agents FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "agents_insert" ON agents;
CREATE POLICY "agents_insert" ON agents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "agents_update" ON agents;
CREATE POLICY "agents_update" ON agents FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "agencies_read" ON agencies;
CREATE POLICY "agencies_read" ON agencies FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "agencies_insert" ON agencies;
CREATE POLICY "agencies_insert" ON agencies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "agencies_update" ON agencies;
CREATE POLICY "agencies_update" ON agencies FOR UPDATE TO authenticated USING (true);

-- 5. AMENITIES TABLE
CREATE TABLE IF NOT EXISTS amenities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    icon text
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "amenities_read" ON amenities;
CREATE POLICY "amenities_read" ON amenities FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "amenities_all_auth" ON amenities;
CREATE POLICY "amenities_all_auth" ON amenities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules 
  ADD COLUMN IF NOT EXISTS property_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS property_title text,
  ADD COLUMN IF NOT EXISTS agent_name text,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS template_format text,
  ADD COLUMN IF NOT EXISTS template_design text,
  ADD COLUMN IF NOT EXISTS style_overrides jsonb DEFAULT '{}';

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "schedules_authenticated_all" ON schedules;
CREATE POLICY "schedules_authenticated_all" ON schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. BRANDING TABLE
CREATE TABLE IF NOT EXISTS branding (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id uuid,
    company_name text,
    primary_color text,
    secondary_color text
);

ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "branding_read" ON branding;
CREATE POLICY "branding_read" ON branding FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "branding_all_auth" ON branding;
CREATE POLICY "branding_all_auth" ON branding FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    contact_name text,
    contact_email text,
    contact_phone text,
    status text DEFAULT 'New',
    property_id uuid,
    agent_id uuid,
    source text
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_all_auth" ON leads;
CREATE POLICY "leads_all_auth" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "leads_public_insert" ON leads;
CREATE POLICY "leads_public_insert" ON leads FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "leads_public_select" ON leads;
CREATE POLICY "leads_public_select" ON leads FOR SELECT TO public USING (true);
