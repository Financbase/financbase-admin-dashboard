# Vercel Deployment Guide

Complete guide for deploying the Financbase Admin Dashboard to Vercel using MCP tools or CLI.

## Prerequisites

1. ✅ Vercel account (Team: "Jon's projects" - `team_2yJW4xxLipUWlyI6tFeQSgFk`)
2. ✅ All environment variables configured
3. ✅ Pre-deployment verification passed
4. ✅ Code committed to Git repository

## Deployment Methods

### Method 1: Using Vercel MCP Tools (Recommended)

The Vercel MCP tools provide direct integration for deployment and monitoring.

#### Step 1: Check Existing Project

```typescript
// Use MCP tool to list projects
mcp_Vercel_list_projects({
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})

// Or search for project by name
// Project name: "financbase-admin-dashboard"
```

#### Step 2: Get Project Details (if exists)

```typescript
mcp_Vercel_get_project({
  projectId: "prj_...", // From step 1
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

#### Step 3: Deploy to Vercel

```typescript
mcp_Vercel_deploy_to_vercel({
  // Deploys current project to Vercel
})
```

#### Step 4: Monitor Deployment

```typescript
mcp_Vercel_get_deployment({
  idOrUrl: "deployment-url-or-id",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})

// Check build logs
mcp_Vercel_get_deployment_build_logs({
  idOrUrl: "deployment-url-or-id",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

### Method 2: Using Vercel CLI

#### Step 1: Authenticate

```bash
vercel login
```

#### Step 2: Link Project (if not already linked)

```bash
vercel link
# Select team: "Jon's projects"
# Project name: financbase-admin-dashboard
```

#### Step 3: Deploy to Preview

```bash
vercel
```

#### Step 4: Deploy to Production

```bash
vercel --prod
```

### Method 3: Using Git Integration (Automatic)

1. **Connect Repository:**
   - Go to Vercel Dashboard
   - Import Git repository
   - Select "Jon's projects" team
   - Project name: `financbase-admin-dashboard`

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Root Directory: `.`

3. **Set Environment Variables:**
   - Add all required environment variables
   - Set for Production, Preview, and Development environments

4. **Deploy:**
   - Push to `main` branch → Production deployment
   - Push to other branches → Preview deployment
   - Create PR → Preview deployment

## Environment Variables Configuration

### Required Variables for Production

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@financbase.com
CONTACT_NOTIFICATION_EMAIL=hello@financbase.com
SUPPORT_EMAIL=support@financbase.com

# Rate Limiting
ARCJET_KEY=arc_... or arcj_...

# Support
PUBLIC_SUPPORT_USER_ID=uuid-here

# Optional but Recommended
SENTRY_DSN=https://...
```

### Environment-Specific Variables

- **Production:** Use production keys (`pk_live_`, `sk_live_`)
- **Preview:** Can use test keys for testing
- **Development:** Local `.env.local` file

## Build Configuration

### Current Configuration

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/monitoring/snapshot-queries",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/subscription-grace-period",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**next.config.mjs:**
- Framework: Next.js
- Output: Standalone (for Docker, Vercel uses its own build)
- Image optimization: Enabled
- Security headers: Configured

### Build Settings in Vercel

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `pnpm install` (auto-detected)
- **Node.js Version:** 18.x or 20.x (recommended)

## Cron Jobs Configuration

### Vercel Cron (Requires Pro Plan)

The `vercel.json` file already configures cron jobs:

1. **Daily Query Snapshot** - Runs at 2 AM UTC
   - Path: `/api/monitoring/snapshot-queries`
   - Schedule: `0 2 * * *`

2. **Subscription Grace Period** - Runs at 3 AM UTC
   - Path: `/api/cron/subscription-grace-period`
   - Schedule: `0 3 * * *`

**Note:** Vercel Cron requires Pro plan ($20/user/month). For free tier, use external cron service (GitHub Actions, etc.).

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] Run pre-deployment verification: `pnpm verify:pre-deploy`
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Tests passing
- [ ] Build succeeds locally: `pnpm build`

### Deployment Steps

1. **Verify Configuration:**
   ```bash
   # Check build works
   pnpm build
   
   # Verify environment variables
   node scripts/verify-env-vars.js --production
   ```

2. **Deploy:**
   ```bash
   # Using CLI
   vercel --prod
   
   # Or push to main branch (if Git integration enabled)
   git push origin main
   ```

3. **Verify Deployment:**
   ```bash
   # Check deployment status
   vercel ls
   
   # Or use MCP tools
   mcp_Vercel_get_deployment({ idOrUrl: "deployment-url" })
   ```

4. **Run Smoke Tests:**
   ```bash
   BASE_URL=https://your-app.vercel.app ./scripts/smoke-tests.sh
   ```

## Post-Deployment Verification

### Health Checks

1. **Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **API Routes:**
   ```bash
   # Test critical endpoints
   curl https://your-app.vercel.app/api/v1/health
   ```

3. **Smoke Tests:**
   ```bash
   BASE_URL=https://your-app.vercel.app ./scripts/smoke-tests.sh
   ```

### Monitoring

1. **Vercel Dashboard:**
   - Check deployment logs
   - Monitor function execution
   - Review analytics

2. **Sentry (if configured):**
   - Monitor error rates
   - Check performance metrics

3. **Cron Jobs:**
   - Verify cron jobs are running
   - Check execution logs in Vercel dashboard

## Troubleshooting

### Issue: Build Fails

**Common Causes:**
- Missing environment variables
- Build timeout
- Dependency issues

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `pnpm build`
4. Check for TypeScript errors: `pnpm type-check`

### Issue: Environment Variables Not Available

**Solution:**
1. Verify variables are set in Vercel dashboard
2. Check environment scope (Production/Preview/Development)
3. Redeploy after adding variables

### Issue: Cron Jobs Not Running

**Solution:**
1. Verify Pro plan is active
2. Check `vercel.json` configuration
3. Verify cron endpoints are accessible
4. Check cron execution logs in Vercel dashboard

### Issue: API Routes Return 500 Errors

**Solution:**
1. Check function logs in Vercel dashboard
2. Verify database connection
3. Check environment variables
4. Review error tracking (Sentry)

## Integration with Cloudflare

### Hybrid Architecture

**Vercel (Primary):**
- Main Next.js application
- All API routes (407 routes)
- Server-side rendering
- Cron jobs

**Cloudflare (Supporting):**
- **Workers:** WebSocket support (`workers/websocket.ts`)
- **R2:** File storage (accessed via API from Vercel)
- **DNS/CDN:** Domain management (optional)

### WebSocket Configuration

The WebSocket worker is deployed separately:

```bash
# Deploy WebSocket worker
pnpm worker:deploy

# Or manually
wrangler deploy --env production
```

### R2 Access from Vercel

R2 is accessed via AWS S3-compatible API from Vercel API routes. No special configuration needed - environment variables are sufficient.

## Cost Considerations

### Vercel Pricing

- **Free Tier:** Limited function execution time, no cron
- **Pro Plan:** $20/user/month
  - Unlimited function execution
  - Cron jobs included
  - Better analytics
  - Team collaboration

### Cloudflare Pricing

- **Workers:** Free tier (100k requests/day)
- **R2:** Pay-as-you-go storage
- **Pages:** Free tier (unlimited sites)

## Best Practices

1. **Use Preview Deployments:**
   - Test changes before production
   - Automatic previews for PRs
   - Share preview URLs for review

2. **Monitor Deployments:**
   - Check build logs
   - Monitor function execution
   - Set up alerts for errors

3. **Environment Variables:**
   - Use different values for Production/Preview
   - Never commit secrets
   - Rotate keys regularly

4. **Database Migrations:**
   - Run migrations before deployment
   - Test migrations in preview environment
   - Have rollback plan

5. **Performance:**
   - Monitor function execution time
   - Optimize cold starts
   - Use edge functions where possible

## Related Documentation

- [Production Environment Verification](./PRODUCTION_ENV_VERIFICATION.md)
- [Staging Deployment Guide](./STAGING_DEPLOYMENT_GUIDE.md)
- [Deployment Workflow](../../DEPLOYMENT_WORKFLOW.md)
- [Environment Variables Guide](../configuration/ENVIRONMENT_VARIABLES.md)

