# Database Branch Management Guidelines

## Overview

This document outlines the branch management strategy and workflow guidelines for the Neon database project. All development teams and LLM coding agents should follow these established patterns.

## Branch Structure

### Production Branches

- **`main`** - Primary production database (protected)
  - Purpose: Live production data
  - Access: Admin only for writes
  - Status: Protected, primary branch

### Staging Branches

- **`staging`** - Pre-production testing environment
  - Purpose: Integration testing before production
  - Access: Development team
  - Status: Active

- **`database-audit-staging`** - Security audit testing
  - Purpose: Security testing and validation
  - Access: Security team
  - Status: Active

### Development Branches

- **`dev-feature-1`** - Feature development branch 1
  - Purpose: Active development work
  - Access: Development team
  - Status: Active

- **`dev-feature-2`** - Feature development branch 2
  - Purpose: Active development work
  - Access: Development team
  - Status: Active

- **`dev-feature-3`** - Feature development branch 3
  - Purpose: Active development work
  - Access: Development team
  - Status: Active

### Emergency Branches

- **`hotfix`** - Emergency fixes and patches
  - Purpose: Urgent production fixes
  - Access: Senior developers only
  - Status: Active

## Workflow Guidelines

### 🚀 New Features Workflow

**Priority: High**

1. **Select Development Branch**
   - Use `dev-feature-1`, `dev-feature-2`, or `dev-feature-3`
   - Choose based on availability and feature scope

2. **Development Phase**
   - Implement feature with proper testing
   - Run comprehensive tests in development environment
   - Ensure all functionality works as expected

3. **Integration Testing**
   - Merge to `staging` branch for integration testing
   - Test integration with other features
   - Validate all functionality works together

4. **Production Deployment**
   - Deploy to `main` after validation
   - Monitor production deployment
   - Ensure no issues arise

**Best Practices:**

- Always test thoroughly in development
- Use staging for integration testing
- Never deploy untested code to production

### 🔒 Security Updates Workflow

**Priority: Critical**

1. **Security Testing**
   - Use `database-audit-staging` for security testing
   - Implement security measures (RLS policies, access controls)
   - Validate all security policies are working correctly

2. **Validation Phase**
   - Test security measures thoroughly
   - Ensure all security policies and RLS are working
   - Get security team approval

3. **Production Deployment**
   - Deploy to `main` after security approval
   - Monitor security implementation
   - Document security changes

**Best Practices:**

- Security is critical - always get approval before production deployment
- Test all security measures thoroughly
- Document all security changes

### 🚨 Emergency Fixes Workflow

**Priority: Critical**

1. **Emergency Response**
   - Use `hotfix` branch for urgent production issues
   - Implement fix quickly but thoroughly
   - Test fix to ensure it resolves the issue

2. **Rapid Deployment**
   - Deploy directly to `main` branch (bypass staging)
   - Monitor production to ensure fix works
   - Document the emergency fix

3. **Environment Sync**
   - Merge hotfix back to `staging` for consistency
   - Update other branches as needed
   - Keep all environments in sync

**Best Practices:**

- Emergency fixes require speed but still need testing
- Always merge back to staging to keep environments in sync
- Document all emergency changes

## Branch Usage Rules

### ✅ Allowed Operations

- **Development**: Use `dev-feature-*` branches for new features
- **Testing**: Use `staging` for integration testing
- **Security**: Use `database-audit-staging` for security work
- **Emergency**: Use `hotfix` for urgent fixes

### ❌ Prohibited Operations

- **Never** deploy untested code to `main`
- **Never** bypass security approval for security updates
- **Never** skip testing in emergency fixes
- **Never** leave branches out of sync

## Database Security

### Row Level Security (RLS)

- All tables have RLS enabled
- User-based access control implemented
- Admin-only access for system tables
- Organization-based isolation for multi-tenant data

### Access Control Policies

- **SELECT policies**: Users can only view their own data
- **INSERT policies**: Users can only create data for themselves
- **UPDATE policies**: Users can only modify their own data
- **DELETE policies**: Users can only delete their own data

## Monitoring and Maintenance

### Branch Monitoring

- Regular cleanup of unused branches
- Monitor branch usage and activity
- Maintain clear naming conventions

### Documentation Updates

- Keep workflow documentation current
- Update guidelines as processes evolve
- Maintain audit trail of changes

## For LLM Coding Agents

### When Working with Database Branches

1. **Always check current branch** before making changes
2. **Follow the established workflow** for your task type
3. **Use appropriate branch** based on the work being done
4. **Test thoroughly** before merging to production
5. **Document changes** in the workflow system

### Branch Selection Guide

- **New features** → `dev-feature-*` branches
- **Security updates** → `database-audit-staging`
- **Emergency fixes** → `hotfix`
- **Integration testing** → `staging`
- **Production deployment** → `main` (after validation)

### Security Considerations

- All database changes must respect RLS policies
- User data isolation must be maintained
- Security policies must be validated
- Admin access is required for system changes

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Maintained By**: Database Team
