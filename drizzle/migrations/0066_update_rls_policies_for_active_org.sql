-- Migration: Update RLS Policies to Use app.current_org_id
-- Created: 2025-01-XX
-- Description: Update existing RLS policies to use app.current_org_id session variable
--              instead of looking up organization_id from users table

-- This migration updates RLS policies to use the active organization from session
-- rather than the user's primary organization_id. This enables multi-organization support.

-- Note: This is a template migration. You should review and update policies for your specific tables.
-- The pattern is to replace:
--   organization_id IN (SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid)
-- With:
--   organization_id = current_setting('app.current_org_id', true)::uuid

-- Example policy update pattern:
-- DROP POLICY IF EXISTS "table_org_select" ON "schema"."table";
-- CREATE POLICY "table_org_select" ON "schema"."table"
--   FOR SELECT USING (
--     organization_id = current_setting('app.current_org_id', true)::uuid
--   );

-- Helper function to check if user is member of organization
-- This is useful for policies that need to verify membership
CREATE OR REPLACE FUNCTION is_user_member_of_org(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = is_user_member_of_org.user_id
    AND organization_id = is_user_member_of_org.org_id
  );
$$ LANGUAGE SQL STABLE;

-- Update helper function to get active organization ID
CREATE OR REPLACE FUNCTION get_active_organization_id()
RETURNS UUID AS $$
  SELECT current_setting('app.current_org_id', true)::uuid;
$$ LANGUAGE SQL STABLE;

-- Example: Update a policy for a table with organization_id column
-- Replace 'your_table_name' and 'your_schema' with actual table names
-- 
-- DROP POLICY IF EXISTS "your_table_org_select" ON "your_schema"."your_table_name";
-- CREATE POLICY "your_table_org_select" ON "your_schema"."your_table_name"
--   FOR SELECT USING (
--     organization_id = get_active_organization_id()
--   );
--
-- DROP POLICY IF EXISTS "your_table_org_insert" ON "your_schema"."your_table_name";
-- CREATE POLICY "your_table_org_insert" ON "your_schema"."your_table_name"
--   FOR INSERT WITH CHECK (
--     organization_id = get_active_organization_id()
--   );
--
-- DROP POLICY IF EXISTS "your_table_org_update" ON "your_schema"."your_table_name";
-- CREATE POLICY "your_table_org_update" ON "your_schema"."your_table_name"
--   FOR UPDATE USING (
--     organization_id = get_active_organization_id()
--   );
--
-- DROP POLICY IF EXISTS "your_table_org_delete" ON "your_schema"."your_table_name";
-- CREATE POLICY "your_table_org_delete" ON "your_schema"."your_table_name"
--   FOR DELETE USING (
--     organization_id = get_active_organization_id()
--   );

-- Important Notes:
-- 1. Review all existing RLS policies that reference organization_id
-- 2. Update them to use get_active_organization_id() instead of looking up from users table
-- 3. Test thoroughly after updating policies
-- 4. Some tables may need membership verification instead of direct org_id matching
-- 5. Consider backward compatibility during migration period

-- Migration complete message
DO $$
BEGIN
  RAISE NOTICE 'RLS Policy Update Migration Template Applied';
  RAISE NOTICE 'Please review and update your specific table policies manually';
  RAISE NOTICE 'Use get_active_organization_id() function in your policies';
END $$;

