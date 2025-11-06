# Environment Variables Review Checklist

Use this checklist to review your `.env.local` file and ensure all required variables are configured.

## ✅ Required Variables (Critical)

### Database
- [ ] `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Should be set and valid

### Authentication (Clerk)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
  - Format: `pk_test_...` or `pk_live_...`
  - Must start with `pk_`
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
  - Format: `sk_test_...` or `sk_live_...`
  - Must start with `sk_`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL (default: `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL (default: `/sign-up`)

### Contact & Support Forms
- [ ] `ARCJET_KEY` - Arcjet API key for rate limiting
  - Format: `arcj_public_...` or `arcj_private_...`
  - Get from: https://arcjet.com
- [ ] `RESEND_API_KEY` - Resend API key for email
  - Format: `re_...`
  - Get from: https://resend.com
- [ ] `RESEND_FROM_EMAIL` - Email address for sending emails
  - For development: `onboarding@resend.dev` (test domain)
  - For production: `noreply@yourdomain.com` (must be verified domain)
- [ ] `CONTACT_NOTIFICATION_EMAIL` - Email to receive contact form submissions
- [ ] `SUPPORT_EMAIL` - Email to receive support form submissions
- [ ] `PUBLIC_SUPPORT_USER_ID` - System user ID for support tickets
  - Must exist in `financbase.users` table
  - See instructions in `ENVIRONMENT_VARIABLES.md`

---

## 🔧 Infrastructure Variables (Recently Configured)

### PartyKit WebSocket (Cloudflare)
- [ ] `NEXT_PUBLIC_PARTYKIT_HOST` - PartyKit host URL
  - Format: `your-project.your-subdomain.partykit.dev` (Cloudflare)
  - Or: `localhost:1999` (local development)
  - **Status**: ✅ Configured for Cloudflare hosting
- [ ] `PARTYKIT_SECRET` - Optional, for authenticated API calls
- [ ] `PARTYKIT_ROOM_ID` - Optional, default room ID (default: `financbase-main`)

### Cloudflare R2 Storage
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
  - Found in Cloudflare Dashboard → Right sidebar
- [ ] `R2_ACCESS_KEY_ID` - R2 API access key
  - Get from: Cloudflare Dashboard → R2 → Manage R2 API Tokens
- [ ] `R2_SECRET_ACCESS_KEY` - R2 API secret key
  - Get from: Cloudflare Dashboard → R2 → Manage R2 API Tokens
- [ ] `R2_BUCKET` - R2 bucket name (default: `cms-admin-files`)
- [ ] `R2_ENDPOINT` - Optional, R2 endpoint URL
  - Format: `https://your-account-id.r2.cloudflarestorage.com`
  - Auto-generated if not set
- [ ] `R2_PUBLIC_DOMAIN` - Optional, CDN custom domain for public file URLs
  - Format: `https://cdn.yourdomain.com`
  - Only needed if using custom CDN domain

---

## 🎯 Optional but Recommended

### AI Services
- [ ] `OPENAI_API_KEY` - For Financbase GPT and AI features
  - Format: `sk-...`
  - Get from: https://platform.openai.com
- [ ] `ANTHROPIC_API_KEY` - Alternative AI provider (Claude)
  - Format: `sk-ant-...`
  - Get from: https://console.anthropic.com
- [ ] `GOOGLE_AI_API_KEY` - Alternative AI provider
  - Get from: https://makersuite.google.com

### Payment Processing
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
  - Format: `sk_test_...` or `sk_live_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
  - Format: `pk_test_...` or `pk_live_...`
- [ ] `PAYPAL_CLIENT_ID` - PayPal client ID
- [ ] `PAYPAL_CLIENT_SECRET` - PayPal client secret

### Monitoring & Observability
- [ ] `SENTRY_DSN` - Sentry error tracking DSN
  - Format: `https://...@...`
- [ ] `SENTRY_ORG` - Sentry organization
- [ ] `SENTRY_PROJECT` - Sentry project name
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token
- [ ] `DATADOG_API_KEY` - DataDog API key (optional)
- [ ] `DATADOG_SITE` - DataDog site (optional)

### Caching & Performance
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token

### Background Jobs
- [ ] `CRON_SECRET` - Secret for scheduled tasks
  - Generate with: `openssl rand -hex 32`

### Application URL
- [ ] `NEXT_PUBLIC_APP_URL` - Public application URL
  - Format: `https://yourdomain.com` or `http://localhost:3000`

---

## 📋 Quick Verification Commands

### Check if variables are set (without showing values)
```bash
# Check required variables
echo "Checking required variables..."
[ -z "$DATABASE_URL" ] && echo "❌ DATABASE_URL missing" || echo "✅ DATABASE_URL set"
[ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] && echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing" || echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set"
[ -z "$CLERK_SECRET_KEY" ] && echo "❌ CLERK_SECRET_KEY missing" || echo "✅ CLERK_SECRET_KEY set"
[ -z "$RESEND_API_KEY" ] && echo "❌ RESEND_API_KEY missing" || echo "✅ RESEND_API_KEY set"
[ -z "$ARCJET_KEY" ] && echo "⚠️  ARCJET_KEY missing (optional but recommended)" || echo "✅ ARCJET_KEY set"

# Check infrastructure variables
[ -z "$NEXT_PUBLIC_PARTYKIT_HOST" ] && echo "⚠️  NEXT_PUBLIC_PARTYKIT_HOST missing (optional for now)" || echo "✅ NEXT_PUBLIC_PARTYKIT_HOST set"
[ -z "$R2_ACCESS_KEY_ID" ] && echo "⚠️  R2_ACCESS_KEY_ID missing (optional if not using file storage)" || echo "✅ R2_ACCESS_KEY_ID set"
[ -z "$R2_SECRET_ACCESS_KEY" ] && echo "⚠️  R2_SECRET_ACCESS_KEY missing (optional if not using file storage)" || echo "✅ R2_SECRET_ACCESS_KEY set"
[ -z "$CLOUDFLARE_ACCOUNT_ID" ] && echo "⚠️  CLOUDFLARE_ACCOUNT_ID missing (optional if not using R2)" || echo "✅ CLOUDFLARE_ACCOUNT_ID set"
```

### Validate format of key variables
```bash
# Check Clerk keys format
if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" =~ ^pk_ ]]; then
  echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format correct"
else
  echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format incorrect (should start with pk_)"
fi

if [[ "$CLERK_SECRET_KEY" =~ ^sk_ ]]; then
  echo "✅ CLERK_SECRET_KEY format correct"
else
  echo "❌ CLERK_SECRET_KEY format incorrect (should start with sk_)"
fi

# Check Resend key format
if [[ "$RESEND_API_KEY" =~ ^re_ ]]; then
  echo "✅ RESEND_API_KEY format correct"
else
  echo "❌ RESEND_API_KEY format incorrect (should start with re_)"
fi

# Check Arcjet key format
if [[ "$ARCJET_KEY" =~ ^arcj_ ]]; then
  echo "✅ ARCJET_KEY format correct"
else
  echo "⚠️  ARCJET_KEY format may be incorrect (should start with arcj_)"
fi
```

---

## 🔍 Common Issues & Solutions

### Issue: Database connection fails
**Check:**
- [ ] `DATABASE_URL` is correctly formatted
- [ ] Database server is accessible
- [ ] Credentials are correct
- [ ] Database exists

### Issue: Authentication not working
**Check:**
- [ ] Both Clerk keys are set (publishable and secret)
- [ ] Keys match environment (test vs live)
- [ ] Clerk application is configured correctly
- [ ] Sign-in/Sign-up URLs are correct

### Issue: Email sending fails
**Check:**
- [ ] `RESEND_API_KEY` is valid
- [ ] `RESEND_FROM_EMAIL` domain is verified (or using `onboarding@resend.dev`)
- [ ] Resend API key has proper permissions

### Issue: File uploads fail
**Check:**
- [ ] All R2 variables are set (`CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`)
- [ ] R2 bucket exists and is accessible
- [ ] R2 API tokens have read/write permissions
- [ ] `R2_BUCKET` name matches actual bucket name

### Issue: WebSocket connections fail
**Check:**
- [ ] `NEXT_PUBLIC_PARTYKIT_HOST` is set correctly
- [ ] PartyKit server is deployed (if using Cloudflare)
- [ ] URL format is correct (no `http://` or `https://` prefix)
- [ ] For local dev: PartyKit dev server is running (`npx partykit dev`)

---

## 📝 Notes for Your Review

Based on our recent work:

1. **PartyKit Configuration**: ✅ Ready for Cloudflare hosting
   - URL format updated to work with Cloudflare-hosted PartyKit
   - Supports both local (`localhost:1999`) and production (`your-project.partykit.dev`)

2. **R2 Storage Configuration**: ✅ Ready for file operations
   - All file services are configured to use R2
   - Fallback to local API if R2 not configured
   - Presigned URL generation implemented

3. **Required for Production**:
   - Database connection
   - Clerk authentication
   - Resend email service
   - Arcjet (recommended for security)

4. **Optional but Enhance Features**:
   - PartyKit (real-time features)
   - R2 Storage (file uploads)
   - AI services (GPT features)
   - Monitoring (Sentry, DataDog)

---

## 🚀 Next Steps After Review

1. **Verify all required variables are set**
2. **Test database connection**: `npm run db:push` or check connection
3. **Test authentication**: Try signing in/up
4. **Test email sending**: Submit contact form
5. **Test file uploads**: If R2 is configured, test file upload
6. **Test WebSocket**: If PartyKit is configured, test real-time features

---

## 📚 Additional Resources

- [Full Environment Variables Guide](./ENVIRONMENT_VARIABLES.md)
- [Infrastructure Setup Guide](./INFRASTRUCTURE_SETUP.md)
- [PartyKit Setup Instructions](./INFRASTRUCTURE_SETUP.md#partykit-websocket-setup-cloudflare)
- [R2 Storage Setup Instructions](./INFRASTRUCTURE_SETUP.md#cloudflare-r2-file-storage-setup)

---

**Last Updated**: After completing all infrastructure configuration items (19 & 20)

