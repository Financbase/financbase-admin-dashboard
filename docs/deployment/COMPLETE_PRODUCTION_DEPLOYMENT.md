# Complete Production Deployment Guide

This document provides a comprehensive guide for deploying the Financbase Admin Dashboard to production.

## Overview

This guide covers the complete production deployment process, including prerequisites, deployment steps, verification, and post-deployment tasks.

## Prerequisites

### Required Accounts and Services

- [ ] Vercel account with production access
- [ ] Neon database (production instance)
- [ ] Clerk account with production application
- [ ] Resend account for email delivery
- [ ] Sentry account for error tracking
- [ ] All environment variables configured

### Pre-Deployment Checklist

- [ ] All code reviewed and approved
- [ ] All tests passing (unit, integration, E2E)
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Security audit completed
- [ ] Performance testing completed

## Deployment Steps

### Step 1: Database Setup

1. **Create Production Database**

   ```bash
   # Create Neon production branch
   # Configure connection string
   # Set up database backups
   ```

2. **Run Migrations**

   ```bash
   # Test migrations on staging first
   pnpm run db:migrate
   
   # Verify schema is correct
   pnpm run db:studio
   ```

3. **Verify Database Connection**

   ```bash
   # Test connection
   curl https://api.financbase.com/api/v1/health
   ```

### Step 2: Environment Configuration

1. **Configure Vercel Environment Variables**

   ```bash
   # Required variables:
   DATABASE_URL=postgresql://...
   CLERK_SECRET_KEY=sk_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   RESEND_API_KEY=re_...
   SENTRY_DSN=https://...
   ```

2. **Verify Environment Variables**
   - Check all variables are set in Vercel dashboard
   - Verify no sensitive data in code
   - Test environment variable access

### Step 3: Build Verification

1. **Test Build Locally**

   ```bash
   pnpm run build
   pnpm run start
   ```

2. **Verify Build Output**
   - Check for build errors
   - Verify bundle size
   - Test all pages load correctly

### Step 4: Deploy to Production

1. **Deploy via Vercel**

   ```bash
   # Connect repository to Vercel
   # Configure build settings
   # Deploy to production
   ```

2. **Monitor Deployment**
   - Watch deployment logs
   - Check for build errors
   - Verify deployment completes

### Step 5: Post-Deployment Verification

1. **Health Checks**

   ```bash
   # Check health endpoint
   curl https://api.financbase.com/api/v1/health
   
   # Verify all services are healthy
   ```

2. **Functionality Tests**
   - Test authentication flow
   - Test API endpoints
   - Test critical user flows
   - Verify email delivery

3. **Performance Checks**
   - Check page load times
   - Verify API response times
   - Monitor error rates

## Verification Steps

### Application Health

- [ ] Health endpoint returns 200
- [ ] Database connection works
- [ ] Authentication works
- [ ] API endpoints respond correctly

### Functionality

- [ ] User can sign up
- [ ] User can sign in
- [ ] Dashboard loads correctly
- [ ] API endpoints work
- [ ] Email delivery works

### Security

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Authentication required for protected routes
- [ ] Rate limiting active

## Rollback Procedure

If issues are detected after deployment:

1. **Identify Issue**
   - Check error logs
   - Review Sentry alerts
   - Check application metrics

2. **Rollback Deployment**

   ```bash
   # In Vercel dashboard:
   # 1. Go to Deployments
   # 2. Find previous working deployment
   # 3. Click "Promote to Production"
   ```

3. **Verify Rollback**
   - Check application is working
   - Verify database is not affected
   - Monitor for stability

## Post-Deployment Tasks

### Immediate (Within 1 Hour)

- [ ] Monitor error rates
- [ ] Check application logs
- [ ] Verify all critical features
- [ ] Test user workflows

### Short-term (Within 24 Hours)

- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Review security logs

### Ongoing

- [ ] Monitor error rates daily
- [ ] Review performance weekly
- [ ] Update documentation
- [ ] Plan next deployment

## Monitoring and Alerts

### Key Metrics to Monitor

- Error rate (target: < 0.1%)
- Response time (target: < 200ms for 95th percentile)
- Uptime (target: > 99.9%)
- Database connection pool usage
- API rate limit usage

### Alert Configuration

Set up alerts for:

- High error rates (> 1%)
- Slow response times (> 1 second)
- Database connection failures
- High rate limit usage (> 90%)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Review build logs
   - Verify dependencies

2. **Database Connection Issues**
   - Verify DATABASE_URL
   - Check database is running
   - Review connection pool settings

3. **Authentication Issues**
   - Verify Clerk configuration
   - Check API keys
   - Review authentication flow

## Related Documentation

- [Deployment Readiness Checklist](./DEPLOYMENT_READINESS_CHECKLIST.md)
- [Schema Migration Guide](./SCHEMA_MIGRATION_GUIDE.md)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Testing Complete](./TESTING_COMPLETE.md)

## Support

For deployment issues:

- **DevOps Team**: <devops@financbase.com>
- **On-Call Engineer**: [Contact Info]
- **Documentation**: [Deployment Guide](./README.md)
