# Vercel MCP Tool Deployment Guide

Guide for using Vercel MCP tools to deploy and manage the Financbase Admin Dashboard.

## Available Vercel MCP Tools

### 1. List Projects
```typescript
mcp_Vercel_list_projects({
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

**Purpose:** Check if `financbase-admin-dashboard` project exists on Vercel.

### 2. Get Project Details
```typescript
mcp_Vercel_get_project({
  projectId: "prj_...", // From list_projects
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

**Purpose:** Get project configuration, environment variables, and settings.

### 3. List Deployments
```typescript
mcp_Vercel_list_deployments({
  projectId: "prj_...",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

**Purpose:** View deployment history and status.

### 4. Deploy to Vercel
```typescript
mcp_Vercel_deploy_to_vercel({
  // Deploys current project
})
```

**Purpose:** Deploy the application directly via MCP.

### 5. Get Deployment Details
```typescript
mcp_Vercel_get_deployment({
  idOrUrl: "deployment-url-or-id",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

**Purpose:** Check deployment status, URL, and metadata.

### 6. Get Build Logs
```typescript
mcp_Vercel_get_deployment_build_logs({
  idOrUrl: "deployment-url-or-id",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk",
  limit: 100
})
```

**Purpose:** Debug build issues by viewing build logs.

## Current Vercel Account

- **Team ID:** `team_2yJW4xxLipUWlyI6tFeQSgFk`
- **Team Name:** "Jon's projects"
- **Team Slug:** `jons-projects-051015cb`
- **Project Name:** `financbase-admin-dashboard`

## Deployment Workflow Using MCP Tools

### Step 1: Check Project Status

```bash
# Using CLI (alternative)
./scripts/check-vercel-status.sh

# Or use MCP tool
mcp_Vercel_list_projects({ teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk" })
```

### Step 2: Get Project Configuration

If project exists, get its details:

```typescript
mcp_Vercel_get_project({
  projectId: "prj_...", // From step 1
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

This will show:
- Project settings
- Environment variables
- Build configuration
- Domain configuration

### Step 3: Deploy

```typescript
mcp_Vercel_deploy_to_vercel({})
```

Or use CLI:
```bash
./scripts/vercel-deploy.sh preview  # For preview
./scripts/vercel-deploy.sh production  # For production
```

### Step 4: Monitor Deployment

```typescript
// Get deployment status
mcp_Vercel_get_deployment({
  idOrUrl: "deployment-url",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})

// Check build logs if needed
mcp_Vercel_get_deployment_build_logs({
  idOrUrl: "deployment-url",
  teamId: "team_2yJW4xxLipUWlyI6tFeQSgFk"
})
```

### Step 5: Verify Deployment

```bash
# Run smoke tests
BASE_URL="https://your-deployment.vercel.app" ./scripts/smoke-tests.sh
```

## Environment Variables Setup

Before deploying, ensure all environment variables are set in Vercel:

### Required Variables

1. **Database:**
   - `DATABASE_URL` - PostgreSQL connection string

2. **Authentication:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Production key (`pk_live_...`)
   - `CLERK_SECRET_KEY` - Production key (`sk_live_...`)

3. **Email:**
   - `RESEND_API_KEY` - Resend API key
   - `RESEND_FROM_EMAIL` - Verified email
   - `CONTACT_NOTIFICATION_EMAIL` - Contact form email
   - `SUPPORT_EMAIL` - Support email

4. **Rate Limiting:**
   - `ARCJET_KEY` - Must start with `arc_` or `arcj_`

5. **Support:**
   - `PUBLIC_SUPPORT_USER_ID` - System user ID

6. **Optional:**
   - `SENTRY_DSN` - Error tracking

### Setting Variables

**Via Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add each variable
3. Select environment (Production, Preview, Development)

**Via CLI:**
```bash
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
# ... etc
```

## Troubleshooting MCP Tools

### Issue: Tool Parameter Errors

If MCP tools show parameter errors:
1. Verify team ID is correct: `team_2yJW4xxLipUWlyI6tFeQSgFk`
2. Check project ID format (starts with `prj_`)
3. Use CLI as alternative: `vercel projects ls`

### Issue: Authentication Required

If tools require authentication:
1. Use Vercel CLI: `vercel login`
2. Or authenticate via Vercel dashboard
3. MCP tools should use existing CLI authentication

## Alternative: Using Vercel CLI

If MCP tools are unavailable, use Vercel CLI:

```bash
# Check status
./scripts/check-vercel-status.sh

# Deploy
./scripts/vercel-deploy.sh preview
./scripts/vercel-deploy.sh production
```

## Next Steps

1. **Check Project Status:**
   - Use MCP tools or CLI to verify project exists
   - Check current deployment status

2. **Set Environment Variables:**
   - Add all required variables in Vercel dashboard
   - Verify production keys are used for production

3. **Deploy:**
   - Deploy to preview first
   - Test thoroughly
   - Deploy to production

4. **Monitor:**
   - Check deployment logs
   - Run smoke tests
   - Monitor error rates

## Related Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Production Environment Verification](./PRODUCTION_ENV_VERIFICATION.md)
- [Staging Deployment Guide](./STAGING_DEPLOYMENT_GUIDE.md)

