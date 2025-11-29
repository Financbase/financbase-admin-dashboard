# Staging Deployment Guide

Complete guide for deploying to staging environment and running smoke tests.

## Prerequisites

1. ✅ All code changes committed
2. ✅ Pre-deployment verification passed
3. ✅ Environment variables configured in deployment platform
4. ✅ Database migrations tested

## Quick Start

```bash
# Run pre-deployment checks
pnpm verify:pre-deploy

# Deploy to staging
./scripts/deploy-staging.sh

# Or manually deploy and run smoke tests
BASE_URL=https://staging.financbase.com ./scripts/smoke-tests.sh
```

## Step-by-Step Deployment

### Step 1: Pre-Deployment Verification

Run comprehensive pre-deployment checks:

```bash
pnpm verify:pre-deploy
```

This will verify:
- TypeScript compilation
- Code linting
- Environment variables
- Security audit
- Unit tests
- Critical path tests
- Production build

### Step 2: Verify Environment Variables

Verify all required environment variables are set in your deployment platform:

```bash
# For staging (allows test keys)
node scripts/verify-env-vars.js

# For production (requires production keys)
node scripts/verify-env-vars.js --production
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Verified email address
- `ARCJET_KEY` - Arcjet key (must start with `arc_` or `arcj_`)
- `CONTACT_NOTIFICATION_EMAIL` - Contact form email
- `SUPPORT_EMAIL` - Support email
- `PUBLIC_SUPPORT_USER_ID` - System user ID

### Step 3: Deploy to Staging

#### Option A: Using Deployment Script (Recommended)

```bash
./scripts/deploy-staging.sh
```

The script will:
1. Run pre-deployment checks
2. Deploy to your platform (Vercel or Cloudflare Pages)
3. Run post-deployment verification
4. Execute smoke tests

#### Option B: Manual Deployment

**For Vercel:**
```bash
# Deploy to preview/staging
vercel --yes

# Or deploy to specific environment
vercel --env=staging --yes
```

**For Cloudflare Pages:**
```bash
# Build the application
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=financbase-admin-dashboard-staging
```

**For Docker:**
```bash
# Build Docker image
docker build -t financbase-admin-dashboard:staging .

# Push to registry
docker push financbase-admin-dashboard:staging

# Deploy to your container platform
# (kubectl, docker-compose, etc.)
```

### Step 4: Run Smoke Tests

After deployment, run smoke tests against the staging environment:

```bash
# Set your staging URL
export STAGING_URL=https://staging.financbase.com

# Run smoke tests
BASE_URL=$STAGING_URL ./scripts/smoke-tests.sh
```

**Smoke Tests Include:**
- Health endpoint check
- API health response validation
- Home page accessibility
- API routes accessibility
- Static assets loading
- Response time validation

### Step 5: Manual Verification

After smoke tests pass, manually verify:

1. **Health Endpoint**
   ```bash
   curl https://staging.financbase.com/api/health
   ```

2. **Authentication Flow**
   - Visit staging URL
   - Test sign-in/sign-up
   - Verify authentication works

3. **Critical Features**
   - Dashboard loads
   - API endpoints respond
   - Database connectivity
   - Email functionality (if configured)

4. **Error Tracking**
   - Check Sentry dashboard for errors
   - Verify error tracking is working

## Smoke Test Details

The smoke test script (`scripts/smoke-tests.sh`) performs:

1. **Health Check** - Verifies `/api/health` returns 200
2. **API Response** - Validates health endpoint response structure
3. **Home Page** - Checks if home page is accessible
4. **API Routes** - Verifies API routes are accessible
5. **Static Assets** - Checks static file serving
6. **Response Time** - Ensures response time < 2 seconds

**Expected Results:**
- All tests should pass
- Response times should be acceptable
- No critical errors in logs

## Troubleshooting

### Issue: Health Check Fails

**Possible Causes:**
- Application not fully deployed
- Environment variables not set
- Database connection issues

**Solution:**
1. Wait a few minutes for deployment to complete
2. Check deployment logs
3. Verify environment variables in deployment platform
4. Check database connectivity

### Issue: Smoke Tests Fail

**Possible Causes:**
- Application errors
- Network issues
- Configuration problems

**Solution:**
1. Check application logs
2. Verify environment variables
3. Test endpoints manually
4. Review error messages

### Issue: Environment Variables Not Set

**Solution:**
1. Go to your deployment platform dashboard
2. Navigate to Environment Variables settings
3. Add all required variables
4. Redeploy application

## Post-Deployment Checklist

After successful deployment:

- [ ] Health endpoint returns 200
- [ ] Smoke tests all pass
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database connectivity verified
- [ ] Error tracking active
- [ ] Performance acceptable
- [ ] No critical errors in logs

## Next Steps

After staging deployment is successful:

1. **User Acceptance Testing** - Have team test critical features
2. **Performance Monitoring** - Monitor response times and errors
3. **Production Deployment** - Once staging is verified, deploy to production
4. **Documentation** - Update deployment documentation if needed

## Additional Resources

- [Production Environment Verification](./PRODUCTION_ENV_VERIFICATION.md)
- [Deployment Workflow](../DEPLOYMENT_WORKFLOW.md)
- [Environment Variables Guide](../configuration/ENVIRONMENT_VARIABLES.md)

