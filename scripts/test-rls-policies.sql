-- RLS Policy Testing Script
-- This script tests that Row Level Security policies are working correctly
-- Run this after setting up RLS context in your application

-- ============================================
-- SETUP: Create test users and context
-- ============================================

-- Test 1: Set user context (simulating authenticated user)
-- Replace 'test-clerk-id' with actual Clerk user ID for testing
SELECT perf.set_user_context(
  p_clerk_id := 'test-clerk-id-123',
  p_user_id := (SELECT id FROM financbase.users WHERE clerk_id = 'test-clerk-id-123' LIMIT 1),
  p_org_id := (SELECT organization_id FROM financbase.users WHERE clerk_id = 'test-clerk-id-123' LIMIT 1)
);

-- ============================================
-- TEST 1: financbase.users RLS
-- ============================================

-- Should only see own record or organization members
SELECT 
  'RLS Test: Users can only see own/org' as test_name,
  COUNT(*) as visible_users,
  COUNT(*) FILTER (WHERE clerk_id = current_setting('app.current_clerk_id', true)) as own_records
FROM financbase.users;

-- Test: Try to see all users (should be filtered)
SELECT id, clerk_id, email, organization_id 
FROM financbase.users
LIMIT 10;

-- ============================================
-- TEST 2: public.payment_methods RLS
-- ============================================

-- Should only see own payment methods
SELECT 
  'RLS Test: Payment methods isolation' as test_name,
  COUNT(*) as visible_methods,
  COUNT(*) FILTER (WHERE user_id::text = current_setting('app.current_user_id', true)) as own_methods
FROM public.payment_methods;

-- ============================================
-- TEST 3: public.refresh_tokens RLS
-- ============================================

-- Should only see own refresh tokens
SELECT 
  'RLS Test: Refresh tokens isolation' as test_name,
  COUNT(*) as visible_tokens,
  COUNT(*) FILTER (WHERE user_id::text = current_setting('app.current_user_id', true)) as own_tokens
FROM public.refresh_tokens;

-- ============================================
-- TEST 4: public.api_keys RLS
-- ============================================

-- Should only see own contractor's API keys
SELECT 
  'RLS Test: API keys isolation' as test_name,
  COUNT(*) as visible_keys,
  COUNT(*) FILTER (WHERE contractor_id::text = current_setting('app.current_contractor_id', true)) as own_contractor_keys
FROM public.api_keys;

-- ============================================
-- VERIFY: Check current context
-- ============================================

SELECT 
  current_setting('app.current_clerk_id', true) as clerk_id,
  current_setting('app.current_user_id', true) as user_id,
  current_setting('app.current_org_id', true) as org_id,
  current_setting('app.current_contractor_id', true) as contractor_id;

-- ============================================
-- CLEANUP: Clear context (for testing)
-- ============================================

-- Uncomment to clear context:
-- SELECT perf.set_user_context();

