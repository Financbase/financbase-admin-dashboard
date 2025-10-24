# Database Quick Reference

## 🚀 For LLM Agents - Quick Start

### 1. Check Current Status

```sql
SELECT current_database(), current_user, now();
```

### 2. Verify Security

```sql
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE rowsecurity = false;
```

### 3. Choose Branch

- **New features** → `dev-feature-1`, `dev-feature-2`, `dev-feature-3`
- **Security updates** → `database-audit-staging`
- **Emergency fixes** → `hotfix`
- **Integration testing** → `staging`
- **Production** → `main` (admin only)

## 📋 Workflow Quick Guide

### New Features

1. Use `dev-feature-*` branch
2. Test thoroughly
3. Merge to `staging`
4. Deploy to `main` after validation

### Security Updates

1. Use `database-audit-staging`
2. Validate security measures
3. Get approval
4. Deploy to `main`

### Emergency Fixes

1. Use `hotfix` branch
2. Test quickly but thoroughly
3. Deploy directly to `main`
4. Merge back to `staging`

## 🛡️ Security Rules

- ✅ All tables have RLS enabled
- ✅ User data isolation enforced
- ✅ Admin access required for system changes
- ❌ Never bypass security
- ❌ Never disable RLS without justification

## 📁 Documentation Files

- **`README.md`** - Overview and quick reference
- **`branch-management.md`** - Complete branch guidelines
- **`security-guidelines.md`** - Security implementation
- **`agent-instructions.md`** - Detailed agent instructions
- **`workflow-queries.sql`** - Ready-to-use SQL queries
- **`quick-reference.md`** - This file

## 🔧 Essential Commands

```sql
-- Check security status
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE rowsecurity = false;

-- Check workflow guidelines
SELECT * FROM public.branch_workflow_summary;

-- Check branch management
SELECT * FROM public.branch_management;

-- Emergency security check
SELECT schemaname, tablename, 'VULNERABLE' as status
FROM pg_tables 
WHERE schemaname IN ('public', 'financbase', 'neon_auth')
AND rowsecurity = false;
```

---

**Remember**: Always check security status before making changes!
