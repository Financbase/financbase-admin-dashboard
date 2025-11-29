-- Find all RLS policies that need updating
-- This query finds policies that use the old pattern of looking up organization_id from users table

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE 
  -- Find policies that reference organization_id and users table lookup
  (
    qual::text LIKE '%organization_id%' 
    AND qual::text LIKE '%financbase.users%'
    AND qual::text LIKE '%current_setting%app.current_user_id%'
  )
  OR
  (
    with_check::text LIKE '%organization_id%' 
    AND with_check::text LIKE '%financbase.users%'
    AND with_check::text LIKE '%current_setting%app.current_user_id%'
  )
ORDER BY schemaname, tablename, policyname;

-- This will show you all policies that need to be updated
-- Copy the results and update each policy to use:
-- organization_id = current_setting('app.current_org_id', true)::uuid
-- instead of:
-- organization_id IN (SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid)

