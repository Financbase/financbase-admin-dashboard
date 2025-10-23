-- Database Workflow Management Queries
-- For LLM Coding Agents and Development Teams

-- ==============================================
-- BRANCH MANAGEMENT QUERIES
-- ==============================================

-- Check current database and user context
SELECT 
  current_database() as database_name,
  current_user as current_user,
  now() as current_time,
  version() as postgres_version;

-- View all branch management information
SELECT 
  branch_name,
  branch_type,
  purpose,
  status,
  notes
FROM public.branch_management
ORDER BY 
  CASE branch_type 
    WHEN 'production' THEN 1
    WHEN 'staging' THEN 2
    WHEN 'development' THEN 3
    WHEN 'hotfix' THEN 4
    ELSE 5
  END,
  branch_name;

-- ==============================================
-- SECURITY STATUS QUERIES
-- ==============================================

-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ SECURED'
    ELSE '❌ VULNERABLE'
  END as security_status
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND tablename NOT LIKE 'pg_%'
ORDER BY security_status, schemaname, tablename;

-- Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
ORDER BY schemaname, tablename, policyname;

-- Check for tables without RLS (should be 0)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND rowsecurity = false
ORDER BY schemaname, tablename;

-- ==============================================
-- WORKFLOW GUIDELINES QUERIES
-- ==============================================

-- Get all workflow guidelines
SELECT 
  category,
  workflow_name,
  description,
  branch_usage,
  best_practices,
  priority
FROM public.branch_workflow_summary
ORDER BY 
  CASE category 
    WHEN 'Emergency' THEN 1
    WHEN 'Security' THEN 2
    WHEN 'Development' THEN 3
    ELSE 4
  END,
  workflow_name;

-- Get specific workflow steps
SELECT 
  workflow_type,
  title,
  steps
FROM public.branch_guidelines
WHERE priority = 'critical'
ORDER BY workflow_type;

-- ==============================================
-- PERFORMANCE MONITORING QUERIES
-- ==============================================

-- Check table sizes and activity
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
ORDER BY n_live_tup DESC
LIMIT 20;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
ORDER BY idx_scan DESC
LIMIT 20;

-- ==============================================
-- BACKUP AND MONITORING QUERIES
-- ==============================================

-- Check backup monitoring status
SELECT 
  backup_type,
  status,
  started_at,
  completed_at,
  size_bytes,
  error_message
FROM public.backup_monitoring
ORDER BY started_at DESC
LIMIT 10;

-- Check database size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  pg_size_pretty(pg_total_relation_size('public.branch_management')) as branch_management_size,
  pg_size_pretty(pg_total_relation_size('public.workflow_documentation')) as workflow_docs_size;

-- ==============================================
-- SECURITY AUDIT QUERIES
-- ==============================================

-- Check for missing indexes on frequently queried columns
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC
LIMIT 20;

-- Check unique constraints and indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND indexdef LIKE '%UNIQUE%'
ORDER BY schemaname, tablename;

-- ==============================================
-- WORKFLOW EXECUTION QUERIES
-- ==============================================

-- Check current workflow status
SELECT 
  'Current Branch Status' as check_type,
  COUNT(*) as total_branches,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_branches,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_branches
FROM public.branch_management;

-- Check security implementation status
SELECT 
  'Security Status' as check_type,
  COUNT(CASE WHEN rowsecurity = true THEN 1 END) as secured_tables,
  COUNT(CASE WHEN rowsecurity = false THEN 1 END) as vulnerable_tables
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND tablename NOT LIKE 'pg_%';

-- ==============================================
-- EMERGENCY PROCEDURES QUERIES
-- ==============================================

-- Quick security check for emergency situations
SELECT 
  'EMERGENCY SECURITY CHECK' as alert_type,
  schemaname,
  tablename,
  'VULNERABLE - RLS DISABLED' as status
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
ORDER BY schemaname, tablename;

-- Check for recent security events
SELECT 
  'Recent Security Events' as event_type,
  COUNT(*) as event_count,
  MAX(created_at) as last_event
FROM public.security_events
WHERE created_at > NOW() - INTERVAL '24 hours';

-- ==============================================
-- DEVELOPMENT WORKFLOW QUERIES
-- ==============================================

-- Get development branch recommendations
SELECT 
  'Development Branch Selection' as recommendation,
  branch_name,
  branch_type,
  purpose,
  CASE 
    WHEN branch_name LIKE 'dev-feature-%' THEN 'Available for development'
    WHEN branch_name = 'staging' THEN 'Use for integration testing'
    WHEN branch_name = 'database-audit-staging' THEN 'Use for security testing'
    ELSE 'Check purpose before use'
  END as usage_guidance
FROM public.branch_management
WHERE branch_type IN ('development', 'staging')
ORDER BY branch_name;

-- Check workflow documentation completeness
SELECT 
  'Documentation Status' as check_type,
  COUNT(*) as total_workflows,
  COUNT(CASE WHEN detailed_steps IS NOT NULL THEN 1 END) as documented_workflows,
  COUNT(CASE WHEN best_practices IS NOT NULL THEN 1 END) as best_practices_documented
FROM public.workflow_documentation;

-- ==============================================
-- NOTES FOR LLM AGENTS
-- ==============================================

/*
IMPORTANT NOTES FOR LLM CODING AGENTS:

1. ALWAYS check current branch before making changes:
   SELECT current_database(), current_user;

2. ALWAYS verify RLS status before table modifications:
   SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE rowsecurity = false;

3. FOLLOW the established workflow guidelines:
   - New features → dev-feature-* branches
   - Security updates → database-audit-staging
   - Emergency fixes → hotfix
   - Integration testing → staging
   - Production deployment → main (after validation)

4. RESPECT security policies:
   - All tables have RLS enabled
   - User data isolation is enforced
   - Admin access is required for system changes
   - Never bypass security for convenience

5. TEST thoroughly before deployment:
   - Development testing in dev branches
   - Integration testing in staging
   - Security testing in database-audit-staging
   - Emergency testing in hotfix

6. DOCUMENT changes:
   - Update workflow documentation
   - Record security changes
   - Maintain audit trail
   - Update branch management records

7. MONITOR performance:
   - Check query performance
   - Monitor index usage
   - Review table statistics
   - Optimize as needed

8. MAINTAIN security:
   - Regular security audits
   - Monitor access patterns
   - Review admin access
   - Update security policies

Remember: Security and data integrity are paramount. 
When in doubt, use the appropriate branch and follow the established guidelines.
*/
