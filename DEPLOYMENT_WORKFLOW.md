# Deployment Workflow Guide

This guide outlines the complete deployment workflow for the Financbase Admin Dashboard.

## Pre-Deployment Verification

Before every deployment, run the comprehensive verification script:

```bash
# For staging
pnpm verify:pre-deploy

# For production (stricter checks)
pnpm verify:pre-deploy:production
```

Or use the script directly:

```bash
./scripts/pre-deployment-verify.sh staging
./scripts/pre-deployment-verify.sh production
```

### What It Checks

1. **TypeScript Compilation** - Ensures no type errors
2. **Code Linting** - Validates code style and quality
3. **Environment Variables** - Verifies all required variables are set
4. **Security Audit** - Runs comprehensive security checks
5. **Unit Tests** - Executes all unit tests
6. **Critical Path Tests** - Tests critical API endpoints
7. **Build Verification** - Ensures production build succeeds
8. **Database Migrations** - Tests migrations (if database URL is set)

### Exit Codes

- `0` - All checks passed, ready for deployment
- `1` - One or more checks failed, deployment blocked

## Staging Deployment

### Step 1: Pre-Deployment Verification

```bash
pnpm verify:pre-deploy
```

### Step 2: Deploy to Staging

```bash
./scripts/deploy-staging.sh
```

This script will:
- Run pre-deployment checks automatically
- Deploy to staging environment
- Run post-deployment verification
- Execute smoke tests
- Run performance tests

### Step 3: Verify Staging Deployment

After deployment, verify:
- Health endpoint: `https://staging.financbase.com/api/health`
- Critical user flows
- API endpoints
- Database connectivity

## Production Deployment

### Step 1: Pre-Deployment Verification (Strict)

```bash
pnpm verify:pre-deploy:production
```

This runs stricter checks including:
- Production environment variable validation
- Production key verification (no test keys)
- All security audits

### Step 2: Final Checks

```bash
# Verify environment variables
node scripts/verify-env-vars.js --production

# Run security audit
./scripts/security-audit.sh

# Run all tests
pnpm test:all
```

### Step 3: Deploy to Production

```bash
# Use your deployment platform's command
# Example for Vercel:
vercel --prod

# Example for custom deployment:
./scripts/deploy-production.sh
```

### Step 4: Post-Deployment Monitoring

```bash
# Monitor Sentry for errors
pnpm monitor:sentry

# Check performance
./scripts/performance-test.sh
```

## Monitoring Production

### Sentry Monitoring

Check for errors and alerts:

```bash
pnpm monitor:sentry
```

Or manually:
```bash
./scripts/monitor-sentry.sh
```

**Sentry Dashboard Links:**
- Issues: https://sentry.io/organizations/financbase/projects/financbase-admin-dashboard/issues/
- Performance: https://sentry.io/organizations/financbase/projects/financbase-admin-dashboard/performance/
- Alerts: https://sentry.io/organizations/financbase/projects/financbase-admin-dashboard/alerts/

### Performance Monitoring

Run performance tests:

```bash
# Against production
BASE_URL=https://financbase.com ./scripts/performance-test.sh

# Against staging
BASE_URL=https://staging.financbase.com ./scripts/performance-test.sh
```

### Health Checks

Monitor application health:

```bash
# Production health check
curl https://financbase.com/api/health

# Staging health check
curl https://staging.financbase.com/api/health
```

## Continuous Improvement

### Test Coverage

Continue improving test coverage:

```bash
# Run tests with coverage
pnpm test:coverage

# Run critical tests
pnpm test:critical

# Analyze coverage
pnpm test:coverage:analyze
```

### Security Updates

Regularly run security audits:

```bash
# Security audit
./scripts/security-audit.sh

# npm audit
npm audit

# Update dependencies
pnpm update
```

## CI/CD Integration

The CI/CD pipeline automatically runs verification on:
- Every push to `main` or `develop`
- Every pull request
- Weekly scheduled runs

### Manual Trigger

You can also trigger workflows manually from GitHub Actions.

## Troubleshooting

### Verification Fails

If pre-deployment verification fails:

1. Review the error messages
2. Fix the issues
3. Re-run verification
4. Check logs in `/tmp/check_output.log`

### Deployment Fails

If deployment fails:

1. Check deployment logs
2. Verify environment variables
3. Check database connectivity
4. Review recent changes
5. Rollback if necessary

### Post-Deployment Issues

If issues occur after deployment:

1. Check Sentry for errors: `pnpm monitor:sentry`
2. Review application logs
3. Check database status
4. Verify external service connectivity
5. Rollback if critical

## Quick Reference

```bash
# Pre-deployment verification
pnpm verify:pre-deploy              # Staging
pnpm verify:pre-deploy:production   # Production

# Deploy
./scripts/deploy-staging.sh         # Staging
# (Production deployment via platform)

# Monitor
pnpm monitor:sentry                 # Sentry errors
./scripts/performance-test.sh       # Performance

# Tests
pnpm test:critical                  # Critical paths
pnpm test:all                       # All tests
pnpm test:coverage                  # With coverage

# Security
./scripts/security-audit.sh         # Security audit
node scripts/verify-env-vars.js     # Environment vars
```

---

**Last Updated**: January 24, 2025
**Version**: 2.0.0

