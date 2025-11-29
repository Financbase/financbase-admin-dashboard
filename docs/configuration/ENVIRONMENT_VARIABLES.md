# Environment Variables Configuration Guide

Complete reference for all environment variables required and optional for the Financbase platform.

## Required Environment Variables

### Database

```env
# PostgreSQL Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Database Driver (default: neon-http)
DATABASE_DRIVER=neon-http  # or neon-serverless, postgres
```

### Authentication (Clerk)

```env
# Clerk Authentication - Required for all authenticated features
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### CORS Configuration

```env
# Allowed Origins for CORS - Required for Direct File API routes
# Comma-separated list of allowed origins (no spaces)
ALLOWED_ORIGINS=https://financbase.com,https://app.financbase.com,https://staging.financbase.com
```

**Note:** This environment variable is required for the Direct File API proxy routes. In development, localhost origins are automatically allowed. In production, only origins listed in this variable will be permitted.

## Contact & Support Form Variables

### Required

```env
# Arcjet Security - Required for contact/support form rate limiting
ARCJET_KEY=arc_public_key_here
```

Get your key from: https://arcjet.com

### Required for Email Notifications

```env
# Resend API - Required for sending contact/support emails
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Contact Form Notifications
CONTACT_NOTIFICATION_EMAIL=hello@financbase.com

# Support Form Notifications
SUPPORT_EMAIL=support@financbase.com

# Public Support User ID - Required for creating public support tickets
# This should be a system user ID that exists in your users table
PUBLIC_SUPPORT_USER_ID=public-support-user-id
```

**Note:** The `PUBLIC_SUPPORT_USER_ID` should be a valid user ID from your `financbase.users` table. Create a system user specifically for handling public support submissions if one doesn't exist.

## Optional Environment Variables

### AI Services

```env
# OpenAI (for Financbase GPT and AI features)
OPENAI_API_KEY=sk-...

# Anthropic Claude (alternative AI provider)
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (alternative AI provider)
GOOGLE_AI_API_KEY=...
```

### Monitoring & Observability

```env
# Sentry Error Tracking
SENTRY_DSN=https://...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...

# DataDog (optional)
DATADOG_API_KEY=...
DATADOG_SITE=...
```

### Payment Processing

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Real-time Features (PartyKit)

```env
# PartyKit - Required for real-time collaboration, notifications, and WebSocket connections
# For Cloudflare-hosted deployments: your-project.your-subdomain.partykit.dev
# For local development: localhost:1999
NEXT_PUBLIC_PARTYKIT_HOST=your-project.your-subdomain.partykit.dev

# Optional: PartyKit secret for authenticated API calls
PARTYKIT_SECRET=your-partykit-secret-token

# Optional: Default room ID for WebSocket connections
PARTYKIT_ROOM_ID=financbase-main
```

**PartyKit Setup (Cloudflare):**
1. Deploy PartyKit server: `npx partykit deploy`
2. Get your PartyKit host URL from Cloudflare dashboard
3. Set `NEXT_PUBLIC_PARTYKIT_HOST` to your deployed PartyKit URL
4. The server file is located at `partykit/server.ts`
5. Party name: `financbase-partykit` (defined in `partykit.json`)

### Cloudflare R2 Storage

```env
# Cloudflare R2 Storage - Required for file uploads, audio recordings, and document storage
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=cms-admin-files
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com  # Optional, defaults to account-based URL
R2_PUBLIC_DOMAIN=https://cdn.financbase.com  # Optional, for public file URLs via CDN

# Cloudflare Workers WebSocket (optional, for real-time features)
NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL=wss://your-worker.workers.dev
NEXT_PUBLIC_WEBSOCKET_URL_DEV=ws://localhost:8787  # Development WebSocket URL
```

**Note:** 
- Get your Cloudflare Account ID from the Cloudflare dashboard
- Create R2 API tokens in Cloudflare Dashboard → R2 → Manage R2 API Tokens
- `R2_PUBLIC_DOMAIN` should be set to your CDN custom domain when configured
- WebSocket URL should point to your deployed Cloudflare Worker

### Caching & Performance

```env
# Upstash Redis (optional, for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Background Jobs

```env
# Cron Secret (for scheduled tasks)
CRON_SECRET=your-generated-secret-here
```

Generate with: `openssl rand -hex 32`

## Environment-Specific Configuration

### Development

Create `.env.local` in the project root:

```env
# Development Database
DATABASE_URL=postgresql://localhost:5432/financbase_dev

# Development Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Development Resend (use test domain)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev

# Development Arcjet
ARCJET_KEY=arcj_key_...  # Use test mode

# Contact/Support Emails
CONTACT_NOTIFICATION_EMAIL=dev@example.com
SUPPORT_EMAIL=dev-support@example.com
PUBLIC_SUPPORT_USER_ID=your-dev-user-id  # See instructions below
```

### Production

Set these in your hosting platform (Vercel, Railway, etc.):

```env
# Production Database (managed service recommended)
DATABASE_URL=postgresql://user:pass@prod-host:5432/financbase

# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production Resend (verified domain required)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Production Arcjet
ARCJET_KEY=arcj_key_...  # Use production key

# Contact/Support Emails
CONTACT_NOTIFICATION_EMAIL=hello@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
PUBLIC_SUPPORT_USER_ID=your-production-system-user-id  # See instructions below
```

## Verification Checklist

### Contact & Support Forms

- [ ] `ARCJET_KEY` is set and valid
- [ ] `RESEND_API_KEY` is set and valid
- [ ] `RESEND_FROM_EMAIL` uses a verified domain (or `onboarding@resend.dev` for testing)
- [ ] `CONTACT_NOTIFICATION_EMAIL` is set and monitored
- [ ] `SUPPORT_EMAIL` is set and monitored
- [ ] `PUBLIC_SUPPORT_USER_ID` exists in your database users table

### Testing Your Setup

1. **Test Contact Form:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "message": "Test message",
       "website": ""
     }'
   ```

2. **Test Support Form:**
   ```bash
   curl -X POST http://localhost:3000/api/support/public \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test Subject",
       "message": "Test message",
       "category": "general",
       "priority": "medium",
       "website": ""
     }'
   ```

3. **Verify Emails:** Check your `CONTACT_NOTIFICATION_EMAIL` and `SUPPORT_EMAIL` inboxes for test submissions.

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different keys for development and production**
3. **Rotate API keys regularly**
4. **Use secrets management for production** (Vercel, AWS Secrets Manager, etc.)
5. **Verify all email domains before production use**
6. **Use strong, randomly generated secrets** (e.g., `CRON_SECRET`)

## Troubleshooting

### Contact/Support Forms Not Working

1. **Check Arcjet Key:**
   - Verify key is valid
   - Check rate limiting logs
   - Ensure key has proper permissions

2. **Check Resend Configuration:**
   - Verify `RESEND_API_KEY` is correct
   - Ensure `RESEND_FROM_EMAIL` domain is verified (or use `onboarding@resend.dev` for testing)
   - Check Resend dashboard for delivery status

3. **Check Database:**
   - Verify migration `0011_marketing_analytics_contact_submissions.sql` is applied
   - Check that `PUBLIC_SUPPORT_USER_ID` exists in users table

4. **Check Logs:**
   - Review server logs for errors
   - Check email service logs in Resend dashboard
   - Review Arcjet dashboard for blocked requests

## Obtaining Real Environment Variable Values

### PUBLIC_SUPPORT_USER_ID

**Purpose:** User ID of the system user that handles public support form submissions and creates support tickets in the database.

**How to Obtain:**

#### Option 1: Create a New System User (Recommended)

1. **Via Database Query:**
   ```sql
   -- Create a system user for support tickets
   INSERT INTO financbase.users (
     clerk_id,
     email,
     first_name,
     last_name,
     role,
     is_active,
     organization_id
   ) VALUES (
     'system-support',  -- Or use a real Clerk user ID
     'support@yourdomain.com',
     'Support',
     'System',
     'admin',
     true,
     'your-org-id'::uuid  -- Replace with your organization UUID
   ) RETURNING id;
   ```

2. **Via Clerk Dashboard (if using Clerk user):**
   - Create a new user in Clerk Dashboard
   - Copy the user ID (starts with `user_`)
   - Ensure this user exists in your `financbase.users` table with matching `clerk_id`

3. **Get the User ID:**
   ```sql
   -- Find the user ID by email or clerk_id
   SELECT id FROM financbase.users 
   WHERE email = 'support@yourdomain.com' 
   OR clerk_id = 'system-support';
   ```

4. **Set in .env.local:**
   ```env
   PUBLIC_SUPPORT_USER_ID=<the-uuid-returned-from-query>
   ```

#### Option 2: Use Existing User

If you want to use an existing user:
```sql
-- Find any active admin or support user
SELECT id, email, role FROM financbase.users 
WHERE is_active = true 
AND (role = 'admin' OR email LIKE '%support%')
LIMIT 1;
```

**Note:** Currently, the support forms use `contactSubmissions` table, so `PUBLIC_SUPPORT_USER_ID` is optional. It's only needed if you plan to create support tickets in the `supportTickets` table.

**Validation:**
```sql
-- Verify the user ID exists
SELECT id, email, role, is_active 
FROM financbase.users 
WHERE id = 'your-user-id-here'::uuid;
```

### ARCJET_KEY

**Purpose:** Arcjet API key for rate limiting and bot protection on public forms.

**How to Obtain:**

1. **Sign up for Arcjet:**
   - Visit https://arcjet.com
   - Create an account (free tier available)
   - Navigate to your dashboard

2. **Get Your API Key:**
   - Go to Settings → API Keys
   - Copy your public API key (starts with `arcj_public_...`)
   - For development, use the test mode key
   - For production, use the production key

3. **Set in .env.local:**
   ```env
   ARCJET_KEY=arcj_public_your-key-here
   ```

**Note:** Forms will work without `ARCJET_KEY`, but rate limiting and bot protection won't be active. This is acceptable for development but recommended for production.

**Test Mode vs Production:**
- **Development:** Use test mode key (allows unlimited requests for testing)
- **Production:** Use production key (enforces rate limits)

### Quick Setup Commands

#### For PUBLIC_SUPPORT_USER_ID

**If you need to create a system user:**
```bash
# Connect to your database
psql $DATABASE_URL

# Create the user (replace values as needed)
INSERT INTO financbase.users (
  clerk_id, email, first_name, last_name, role, is_active, organization_id
) VALUES (
  'system-support-' || gen_random_uuid()::text,
  'support@yourdomain.com',
  'Support',
  'System',
  'admin',
  true,
  (SELECT id FROM financbase.organizations LIMIT 1)
) RETURNING id;

# Copy the returned UUID and add to .env.local
echo "PUBLIC_SUPPORT_USER_ID=<uuid-from-above>" >> .env.local
```

**If using Clerk:**
1. Create user in Clerk Dashboard
2. The user will be synced to `financbase.users` via webhook
3. Query for the ID:
   ```sql
   SELECT id FROM financbase.users WHERE clerk_id = 'user_xxx';
   ```

#### For ARCJET_KEY

```bash
# Add to .env.local
echo "ARCJET_KEY=arcj_public_your-key-here" >> .env.local
```

## Additional Resources

- [Arcjet Documentation](https://docs.arcjet.com)
- [Resend Configuration Guide](./RESEND_CONFIGURATION.md)
- [Clerk Configuration Guide](./CLERK_CONFIGURATION.md)
- [Database Migration Guide](../deployment/SCHEMA_MIGRATION_GUIDE.md)

