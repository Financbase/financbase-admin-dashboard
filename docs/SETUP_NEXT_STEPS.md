# Setup Next Steps Guide

This guide walks you through the final setup steps for RLS integration and query snapshot scheduling.

## 📋 Prerequisites

- Database is set up and accessible
- Clerk authentication is configured
- Application is deployed or running locally

## Step 1: Set CRON_SECRET Environment Variable

### For Local Development

1. **Create or update `.env.local` file:**

```bash
# Generate a secure secret
openssl rand -hex 32
```

2. **Add to `.env.local`:**

```env
# Query Snapshot Cron Secret
CRON_SECRET=your-generated-secret-here
```

**Example:**
```env
CRON_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### For Production (Vercel)

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add new variable:**
   - **Key:** `CRON_SECRET`
   - **Value:** Generate using: `openssl rand -hex 32`
   - **Environment:** Production, Preview, Development (all)

3. **Or use Vercel CLI:**
```bash
vercel env add CRON_SECRET production
# Paste your generated secret when prompted
```

### For Other Platforms

**Environment Variable:**
```bash
export CRON_SECRET=your-generated-secret-here
```

Add to your platform's environment variable configuration:
- **Railway:** Project Settings → Variables
- **Render:** Environment → Environment Variables
- **Heroku:** Settings → Config Vars
- **AWS/GCP/Azure:** Use their respective secret management services

## Step 2: Test RLS Policies

### Prerequisites

- Access to your PostgreSQL database
- At least one test user in `financbase.users` table
- User must have a valid `clerk_id`

### Testing Steps

#### Option A: Using psql

1. **Connect to your database:**
```bash
psql $DATABASE_URL
# Or directly:
psql postgresql://user:password@host:port/database
```

2. **Run the test script:**
```bash
\i scripts/test-rls-policies.sql
```

**Or manually:**

```sql
-- First, get a real Clerk ID from your users table
SELECT id, clerk_id, email FROM financbase.users LIMIT 1;

-- Replace 'your-clerk-id-here' with actual Clerk ID
SELECT perf.set_user_context(
  p_clerk_id := 'your-clerk-id-here',
  p_user_id := (SELECT id FROM financbase.users WHERE clerk_id = 'your-clerk-id-here' LIMIT 1),
  p_org_id := (SELECT organization_id FROM financbase.users WHERE clerk_id = 'your-clerk-id-here' LIMIT 1)
);

-- Test 1: Verify users RLS
SELECT 
  'RLS Test: Users' as test_name,
  COUNT(*) as visible_users
FROM financbase.users;

-- Test 2: Verify payment methods RLS
SELECT 
  'RLS Test: Payment Methods' as test_name,
  COUNT(*) as visible_methods
FROM public.payment_methods;

-- Verify context is set
SELECT 
  current_setting('app.current_clerk_id', true) as clerk_id,
  current_setting('app.current_user_id', true) as user_id,
  current_setting('app.current_org_id', true) as org_id;
```

#### Option B: Using Application API

1. **Test via authenticated API call:**
```bash
# Sign in first to get auth token
curl -X GET 'http://localhost:3000/api/invoices' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

2. **Verify in logs** that RLS context is being set correctly

#### Option C: Automated Test Script

Create a test file:

```typescript
// __tests__/rls-policies.test.ts
import { setRLSContextFromClerkId } from '@/lib/db/rls-context';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';

test('RLS policies filter data correctly', async () => {
  const testClerkId = 'test-clerk-id';
  
  // Set RLS context
  await setRLSContextFromClerkId(testClerkId);
  
  // Query users - should only see own/org members
  const visibleUsers = await db.select().from(users);
  
  // Verify all visible users are from same org or are the user themselves
  expect(visibleUsers.every(u => 
    u.clerk_id === testClerkId || 
    u.organization_id === testUserOrgId
  )).toBe(true);
});
```

### Expected Results

- ✅ Users can only see their own records or organization members
- ✅ Payment methods are isolated per user
- ✅ Refresh tokens are isolated per user
- ✅ API keys are isolated per contractor

### Troubleshooting

**Issue:** Users can see all data
- **Solution:** Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true;`
- **Check:** Policies exist: `SELECT * FROM pg_policies WHERE tablename = 'users';`

**Issue:** Context not setting
- **Solution:** Check database function exists: `SELECT proname FROM pg_proc WHERE proname = 'set_user_context';`
- **Verify:** User exists in database: `SELECT * FROM financbase.users WHERE clerk_id = 'your-clerk-id';`

## Step 3: Configure Snapshot Scheduling

### Option A: Vercel Cron (Recommended for Vercel)

1. **Create `vercel.json` in project root:**

```json
{
  "crons": [
    {
      "path": "/api/monitoring/snapshot-queries",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Note:** Vercel Cron requires Vercel Pro plan ($20/month)

2. **Add headers configuration** (if needed):

The API route already handles the `X-Cron-Secret` header. Make sure `CRON_SECRET` is set in Vercel environment variables.

3. **Deploy to Vercel:**
```bash
vercel deploy --prod
```

### Option B: External Cron Service (Recommended for Free Tier)

#### GitHub Actions

1. **Create `.github/workflows/snapshot-queries.yml`:**

```yaml
name: Daily Query Snapshot

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Snapshot
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/monitoring/snapshot-queries?limit=50&min_ms=20" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

2. **Add secrets in GitHub:**
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add `APP_URL`: Your production URL (e.g., `https://your-app.vercel.app`)
   - Add `CRON_SECRET`: Your generated secret

#### EasyCron or Cron-job.org

1. **Sign up** at [easycron.com](https://www.easycron.com) or [cron-job.org](https://cron-job.org)

2. **Create new cron job:**
   - **URL:** `https://your-app.vercel.app/api/monitoring/snapshot-queries?limit=50&min_ms=20`
   - **Method:** POST
   - **Headers:**
     ```
     X-Cron-Secret: your-cron-secret-here
     Content-Type: application/json
     ```
   - **Schedule:** Daily at 2:00 AM UTC
   - **Timeout:** 60 seconds

### Option C: Application Scheduler (Node.js)

**Note:** This only works in non-serverless environments

1. **Install node-cron:**
```bash
npm install node-cron
```

2. **Update app initialization:**

```typescript
// app/layout.tsx or instrumentation.ts
import { scheduleQuerySnapshots } from '@/lib/cron/snapshot-scheduler';

// In server component or initialization code
if (typeof window === 'undefined') {
  scheduleQuerySnapshots();
}
```

3. **Or use the setup script:**
```bash
chmod +x scripts/setup-cron-snapshot.sh
./scripts/setup-cron-snapshot.sh
```

### Testing the Snapshot Endpoint

**Manual Test:**

```bash
# Test locally
curl -X POST 'http://localhost:3000/api/monitoring/snapshot-queries?limit=50&min_ms=20' \
  -H 'X-Cron-Secret: your-secret-here' \
  -H 'Content-Type: application/json'

# Test production
curl -X POST 'https://your-app.vercel.app/api/monitoring/snapshot-queries?limit=50&min_ms=20' \
  -H 'X-Cron-Secret: your-secret-here' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Query snapshot captured successfully",
  "stats": {
    "total_snapshots": 50,
    "latest_snapshot": "2024-01-15T02:00:00.000Z",
    "unique_queries": 45
  },
  "timestamp": "2024-01-15T02:00:15.123Z"
}
```

**Check Snapshot Data:**

```sql
SELECT 
  captured_at,
  query,
  calls,
  mean_exec_ms
FROM perf.query_stats_daily
ORDER BY captured_at DESC
LIMIT 10;
```

## Verification Checklist

- [ ] `CRON_SECRET` is set in all environments
- [ ] RLS policies are tested and working
- [ ] Snapshot endpoint is accessible and secured
- [ ] Cron job is scheduled (Vercel Cron, GitHub Actions, or external service)
- [ ] Test snapshot manually to verify it works
- [ ] Check snapshot data appears in `perf.query_stats_daily` table

## Monitoring

### Check Snapshot Status

```bash
# View recent snapshots
curl 'https://your-app.vercel.app/api/monitoring/snapshot-queries?days=7'
```

### Database Query

```sql
-- View snapshot statistics
SELECT 
  DATE(captured_at) as date,
  COUNT(*) as snapshots,
  COUNT(DISTINCT query) as unique_queries,
  AVG(mean_exec_ms) as avg_exec_time_ms
FROM perf.query_stats_daily
WHERE captured_at > now() - interval '7 days'
GROUP BY DATE(captured_at)
ORDER BY date DESC;
```

## Troubleshooting

### Snapshot Not Running

1. **Check CRON_SECRET:**
   - Verify it's set in environment variables
   - Ensure it matches between cron service and application

2. **Check endpoint:**
   - Verify endpoint is accessible
   - Check authentication/authorization
   - Review application logs

3. **Check cron service:**
   - Verify cron job is active
   - Check cron service logs
   - Ensure schedule is correct (UTC timezone)

### RLS Not Working

1. **Verify context setting:**
   - Check `withRLS()` is being used in API routes
   - Verify user exists in `financbase.users`
   - Check Clerk ID matches

2. **Database checks:**
   - RLS enabled: `SELECT * FROM pg_tables WHERE rowsecurity = true;`
   - Policies exist: `SELECT * FROM pg_policies;`
   - Function exists: `SELECT proname FROM pg_proc WHERE proname = 'set_user_context';`

## Support

For issues or questions:
- Review `docs/rls-integration-guide.md`
- Check `scripts/test-rls-policies.sql` for test queries
- Review application logs for errors

