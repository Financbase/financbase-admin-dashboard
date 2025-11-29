-- Script to Update RLS Policies to Use app.current_org_id
-- This updates existing policies that look up organization_id from users table
-- Run this after the multi-organization migration

-- Helper function to get active organization ID (already created in migration 0066)
CREATE OR REPLACE FUNCTION get_active_organization_id()
RETURNS UUID AS $$
  SELECT current_setting('app.current_org_id', true)::uuid;
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is member of organization
CREATE OR REPLACE FUNCTION is_user_member_of_org(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = is_user_member_of_org.user_id
    AND organization_id = is_user_member_of_org.org_id
  );
$$ LANGUAGE SQL STABLE;

-- Update pattern for policies:
-- OLD: organization_id IN (SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid)
-- NEW: organization_id = current_setting('app.current_org_id', true)::uuid

-- Example updates for compliance tables (from 0061_rls_policies_compliance.sql)
-- Update these policies to use the new pattern

-- Note: This is a template. You need to update policies for your specific tables.
-- Replace 'table_name' and 'schema_name' with actual table names.

-- Example pattern:
/*
DROP POLICY IF EXISTS "table_org_select" ON "schema"."table_name";
CREATE POLICY "table_org_select" ON "schema"."table_name"
  FOR SELECT USING (
    organization_id = get_active_organization_id()
  );

DROP POLICY IF EXISTS "table_org_insert" ON "schema"."table_name";
CREATE POLICY "table_org_insert" ON "schema"."table_name"
  FOR INSERT WITH CHECK (
    organization_id = get_active_organization_id()
  );

DROP POLICY IF EXISTS "table_org_update" ON "schema"."table_name";
CREATE POLICY "table_org_update" ON "schema"."table_name"
  FOR UPDATE USING (
    organization_id = get_active_organization_id()
  );

DROP POLICY IF EXISTS "table_org_delete" ON "schema"."table_name";
CREATE POLICY "table_org_delete" ON "schema"."table_name"
  FOR DELETE USING (
    organization_id = get_active_organization_id()
  );
*/

-- To find all policies that need updating, run:
-- SELECT schemaname, tablename, policyname, definition 
-- FROM pg_policies 
-- WHERE definition LIKE '%organization_id IN (SELECT organization_id FROM financbase.users%';

-- Then update each policy individually based on your schema

