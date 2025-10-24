# LLM Agent Instructions for Database Operations

## 🎯 Purpose

This document provides specific instructions for LLM coding agents working with the Neon database project. Follow these guidelines to ensure consistent, secure, and efficient database operations.

## 🚨 Critical Rules for All Agents

### 1. ALWAYS Check Branch Status First

```sql
-- REQUIRED: Check current context before ANY database operations
SELECT 
  current_database() as database_name,
  current_user as current_user,
  now() as current_time;
```

### 2. ALWAYS Verify Security Status

```sql
-- REQUIRED: Check RLS status before table modifications
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
  AND rowsecurity = false
ORDER BY schemaname, tablename;
```

### 3. NEVER Bypass Security

- **All tables have RLS enabled** - respect this
- **User data isolation is enforced** - maintain this
- **Admin access is required** for system changes
- **Never disable RLS** for convenience

## 🔄 Workflow Selection Guide

### For New Features

```
1. Use: dev-feature-1, dev-feature-2, or dev-feature-3
2. Test: Thoroughly in development environment
3. Merge: To staging for integration testing
4. Deploy: To main after validation
```

### For Security Updates

```
1. Use: database-audit-staging branch
2. Test: All security measures thoroughly
3. Approve: Get security team approval
4. Deploy: To main after approval
```

### For Emergency Fixes

```
1. Use: hotfix branch
2. Test: Quickly but thoroughly
3. Deploy: Directly to main (bypass staging)
4. Sync: Merge back to staging for consistency
```

## 🛡️ Security Requirements

### Before Any Table Changes

1. **Check RLS Status**

   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname IN ('public', 'financbase', 'neon_auth')
   AND rowsecurity = false;
   ```

2. **Verify Existing Policies**

   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual 
   FROM pg_policies 
   WHERE schemaname IN ('public', 'financbase', 'neon_auth')
   ORDER BY schemaname, tablename;
   ```

3. **Implement Proper Policies**

   ```sql
   -- Example RLS Policy Implementation
   CREATE POLICY table_select_policy ON schema.table 
     FOR SELECT USING (user_id = auth.uid());
   
   CREATE POLICY table_insert_policy ON schema.table 
     FOR INSERT WITH CHECK (user_id = auth.uid());
   
   CREATE POLICY table_update_policy ON schema.table 
     FOR UPDATE USING (user_id = auth.uid());
   
   CREATE POLICY table_delete_policy ON schema.table 
     FOR DELETE USING (user_id = auth.uid());
   ```

## 📋 Pre-Deployment Checklist

### ✅ Security Checklist

- [ ] RLS enabled on all new tables
- [ ] Appropriate policies created
- [ ] User isolation maintained
- [ ] Admin access properly configured
- [ ] Security policies tested

### ✅ Workflow Checklist

- [ ] Appropriate branch selected
- [ ] Testing completed in development
- [ ] Integration testing done (if applicable)
- [ ] Security approval obtained (if applicable)
- [ ] Documentation updated

### ✅ Performance Checklist

- [ ] Indexes created for frequently queried columns
- [ ] Query performance tested
- [ ] Table statistics updated
- [ ] Monitoring implemented

## 🔍 Monitoring and Maintenance

### Regular Security Checks

```sql
-- Check for vulnerable tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
AND rowsecurity = false;

-- Check policy completeness
SELECT 
  t.schemaname,
  t.tablename,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname IN ('public', 'financbase', 'neon_auth')
GROUP BY t.schemaname, t.tablename
HAVING COUNT(p.policyname) < 4
ORDER BY t.schemaname, t.tablename;
```

### Performance Monitoring

```sql
-- Check table activity
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples
FROM pg_stat_user_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
ORDER BY n_live_tup DESC
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
ORDER BY idx_scan DESC
LIMIT 10;
```

## 🚨 Emergency Procedures

### Security Incident Response

1. **Immediate Assessment**

   ```sql
   -- Check for vulnerable tables
   SELECT schemaname, tablename, 'VULNERABLE' as status
   FROM pg_tables 
   WHERE schemaname IN ('public', 'financbase', 'neon_auth')
   AND rowsecurity = false;
   ```

2. **Containment**
   - Isolate affected systems
   - Revoke compromised access
   - Implement temporary restrictions

3. **Investigation**
   - Review access logs
   - Analyze security policies
   - Identify root cause

4. **Recovery**
   - Implement fixes
   - Restore proper access controls
   - Monitor for recurrence

### Database Issues

1. **Check Branch Status**

   ```sql
   SELECT current_database(), current_user, now();
   ```

2. **Verify Security**

   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname IN ('public', 'financbase', 'neon_auth')
   AND rowsecurity = false;
   ```

3. **Review Recent Changes**
   - Check recent commits
   - Review policy changes
   - Analyze access patterns

## 📚 Documentation Requirements

### When Making Changes

1. **Update Workflow Documentation**
   - Record the change in `workflow_documentation` table
   - Update branch management records
   - Document security implications

2. **Maintain Audit Trail**
   - Record all security changes
   - Document policy modifications
   - Track access control updates

3. **Update Guidelines**
   - Revise workflow procedures if needed
   - Update security guidelines
   - Maintain agent instructions

## 🎯 Best Practices Summary

### ✅ DO

- Always check branch status before operations
- Verify security status before table changes
- Use appropriate branches for different tasks
- Test thoroughly before deployment
- Document all significant changes
- Respect user data isolation
- Follow established workflows

### ❌ DON'T

- Never bypass security for convenience
- Never disable RLS without proper justification
- Never deploy untested code to production
- Never skip security approval for security updates
- Never leave branches out of sync
- Never ignore user data boundaries
- Never skip documentation updates

## 🔧 Quick Reference Commands

### Essential Queries

```sql
-- Check current context
SELECT current_database(), current_user, now();

-- Check security status
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE rowsecurity = false;

-- Check workflow guidelines
SELECT * FROM public.branch_workflow_summary;

-- Check branch management
SELECT * FROM public.branch_management;
```

### Emergency Commands

```sql
-- Quick security check
SELECT schemaname, tablename, 'VULNERABLE' as status
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
AND rowsecurity = false;

-- Check recent activity
SELECT * FROM public.backup_monitoring ORDER BY started_at DESC LIMIT 5;
```

---

**Remember**: Security and data integrity are paramount. When in doubt, use the appropriate branch and follow the established guidelines. Always prioritize security over convenience.

**Last Updated**: 2025-10-23
**Version**: 1.0
**For**: All LLM Coding Agents
