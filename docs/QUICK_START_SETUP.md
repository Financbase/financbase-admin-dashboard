# Quick Start: RLS & Snapshot Setup

Get up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
chmod +x scripts/quick-setup.sh
./scripts/quick-setup.sh
```

This will:
- ✅ Generate a secure `CRON_SECRET`
- ✅ Add it to `.env.local`
- ✅ Test database connection
- ✅ Provide next steps

### 2. Set Environment Variables (Production)

#### Vercel
```bash
vercel env add CRON_SECRET production
# Paste the generated secret when prompted
```

#### GitHub Actions
1. Go to: Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `CRON_SECRET`: Your generated secret
   - `APP_URL`: Your production URL (e.g., `https://your-app.vercel.app`)

### 3. Test RLS (Quick Test)

```bash
# Get a test user's Clerk ID
psql $DATABASE_URL -c "SELECT clerk_id FROM financbase.users LIMIT 1;"

# Set context and test
psql $DATABASE_URL << EOF
SELECT perf.set_user_context(
  p_clerk_id := 'YOUR_CLERK_ID_HERE',
  p_user_id := (SELECT id FROM financbase.users WHERE clerk_id = 'YOUR_CLERK_ID_HERE' LIMIT 1),
  p_org_id := (SELECT organization_id FROM financbase.users WHERE clerk_id = 'YOUR_CLERK_ID_HERE' LIMIT 1)
);

SELECT COUNT(*) as visible_users FROM financbase.users;
EOF
```

### 4. Test Snapshot Endpoint

```bash
# Get your CRON_SECRET from .env.local
source .env.local

# Test the endpoint
curl -X POST 'http://localhost:3000/api/monitoring/snapshot-queries?limit=10&min_ms=20' \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json"
```

### 5. Configure Scheduling

**Option A: Vercel Cron (Easiest)**
- `vercel.json` is already configured
- Just deploy: `vercel deploy --prod`
- Ensure `CRON_SECRET` is in Vercel environment variables

**Option B: GitHub Actions (Free)**
- `.github/workflows/snapshot-queries.yml` is already configured
- Add secrets: `CRON_SECRET` and `APP_URL`
- That's it! It will run daily at 2 AM UTC

## ✅ Verification

```bash
# Check snapshot data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM perf.query_stats_daily WHERE captured_at > now() - interval '1 day';"

# View recent snapshots
curl 'http://localhost:3000/api/monitoring/snapshot-queries?days=1'
```

## 📚 Full Documentation

For detailed instructions, see:
- **Complete Setup Guide:** `docs/SETUP_NEXT_STEPS.md`
- **RLS Integration:** `docs/rls-integration-guide.md`
- **Test Script:** `scripts/test-rls-policies.sql`

## 🆘 Troubleshooting

**CRON_SECRET not working?**
- Verify it's set in environment variables
- Check it matches between cron service and app
- Ensure header is `X-Cron-Secret` (case-sensitive)

**RLS not filtering?**
- Check RLS is enabled: `SELECT * FROM pg_tables WHERE rowsecurity = true;`
- Verify context is set: `SELECT current_setting('app.current_user_id', true);`
- Ensure `withRLS()` is used in API routes

**Snapshot not running?**
- Check cron service is active
- Verify endpoint is accessible
- Review application logs for errors

