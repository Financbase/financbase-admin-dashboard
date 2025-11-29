# Production Environment Variables Verification Guide

This guide helps you verify all production environment variables are correctly set before deployment.

## Quick Verification

Run the verification script:

```bash
# For production environment
node scripts/verify-env-vars.js --production
```

## Required Production Environment Variables

### 1. Database
- **`DATABASE_URL`**
  - Format: `postgresql://user:password@host:port/database`
  - Must start with `postgresql://` or `postgres://`
  - **Action**: Verify connection string is for production database

### 2. Authentication (Clerk)
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
  - Format: `pk_live_...` (production) or `pk_test_...` (staging)
  - Must start with `pk_`
  - **Action**: Ensure using production key (`pk_live_`) for production

- **`CLERK_SECRET_KEY`**
  - Format: `sk_live_...` (production) or `sk_test_...` (staging)
  - Must start with `sk_`
  - **Action**: Ensure using production key (`sk_live_`) for production

### 3. Email Service (Resend)
- **`RESEND_API_KEY`**
  - Format: `re_...`
  - Must start with `re_`
  - **Action**: Verify API key is active and has production domain verified

- **`RESEND_FROM_EMAIL`**
  - Format: Valid email address
  - **Action**: Must be from verified domain in Resend dashboard

### 4. Rate Limiting (Arcjet)
- **`ARCJET_KEY`**
  - Format: `arc_...` or `arcj_...`
  - Must start with `arc_` or `arcj_`
  - **Action**: Get from https://arcjet.com - use production key

### 5. Support & Contact
- **`CONTACT_NOTIFICATION_EMAIL`**
  - Format: Valid email address
  - **Action**: Email where contact form submissions are sent

- **`SUPPORT_EMAIL`**
  - Format: Valid email address
  - **Action**: Email where support form submissions are sent

- **`PUBLIC_SUPPORT_USER_ID`**
  - Format: UUID string
  - **Action**: Must be a valid user ID from your `financbase.users` table

### 6. Error Tracking (Recommended)
- **`SENTRY_DSN`**
  - Format: `https://...@...sentry.io/...`
  - Must start with `https://`
  - **Action**: Get from Sentry dashboard, recommended for production

## Verification Checklist

### Pre-Deployment
- [ ] All required variables are set
- [ ] All variables use production keys (not test keys)
- [ ] Database URL points to production database
- [ ] Clerk keys are production keys (`pk_live_`, `sk_live_`)
- [ ] Resend domain is verified
- [ ] ARCJET_KEY is valid and active
- [ ] Email addresses are valid and monitored
- [ ] PUBLIC_SUPPORT_USER_ID exists in database

### Platform-Specific (Vercel)
- [ ] All environment variables are set in Vercel dashboard
- [ ] Environment variables are set for correct environment (Production)
- [ ] No sensitive data in code or logs
- [ ] Secrets are marked as "Encrypted" in Vercel

### Platform-Specific (Cloudflare Pages)
- [ ] All environment variables are set in Cloudflare dashboard
- [ ] Environment variables are set for production environment
- [ ] Wrangler secrets are configured if using Workers

## Verification Commands

### 1. Verify Environment Variables Format
```bash
node scripts/verify-env-vars.js --production
```

### 2. Test Database Connection
```bash
# Test connection (requires DATABASE_URL to be set)
psql $DATABASE_URL -c "SELECT version();"
```

### 3. Verify Clerk Keys
```bash
# Check if using production keys
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | grep -q "pk_live_" && echo "✅ Production key" || echo "❌ Not production key"
echo $CLERK_SECRET_KEY | grep -q "sk_live_" && echo "✅ Production key" || echo "❌ Not production key"
```

### 4. Verify Resend Configuration
```bash
# Test Resend API (requires RESEND_API_KEY)
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

### 5. Verify Arcjet Key
```bash
# Check ARCJET_KEY format
if [[ "$ARCJET_KEY" =~ ^(arc_|arcj_) ]]; then
  echo "✅ ARCJET_KEY format correct"
else
  echo "❌ ARCJET_KEY format incorrect (should start with arc_ or arcj_)"
fi
```

## Common Issues

### Issue: ARCJET_KEY format invalid
**Solution**: 
- Get key from https://arcjet.com
- Ensure it starts with `arc_` or `arcj_`
- Example: `ARCJET_KEY=arcj_public_...`

### Issue: Using test keys in production
**Solution**:
- Replace `pk_test_` with `pk_live_` for Clerk publishable key
- Replace `sk_test_` with `sk_live_` for Clerk secret key

### Issue: Database connection fails
**Solution**:
- Verify DATABASE_URL format
- Check database is accessible from deployment platform
- Verify credentials are correct

### Issue: Email sending fails
**Solution**:
- Verify RESEND_API_KEY is valid
- Check RESEND_FROM_EMAIL is from verified domain
- Verify domain is verified in Resend dashboard

## Production Deployment Checklist

Before deploying to production:

1. ✅ Run environment variable verification
2. ✅ Verify all keys are production keys
3. ✅ Test database connection
4. ✅ Verify email service configuration
5. ✅ Check error tracking is configured
6. ✅ Verify all secrets are encrypted in deployment platform
7. ✅ Run pre-deployment verification: `pnpm verify:pre-deploy:production`
8. ✅ Deploy to staging first and verify
9. ✅ Run smoke tests on staging
10. ✅ Deploy to production

## Getting Help

If you encounter issues:
1. Check the error message from verification script
2. Review the [Environment Variables Guide](../configuration/ENVIRONMENT_VARIABLES.md)
3. Verify keys in respective service dashboards (Clerk, Resend, Arcjet, Sentry)
4. Check deployment platform documentation for environment variable setup

