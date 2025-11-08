/**

* Environment Variables Verification
* Checklist for verifying all required environment variables are set
 */

/**

* Copyright (c) 2025 Financbase. All Rights Reserved.
*
* PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
* or use of this software, via any medium, is strictly prohibited.
*
* @see LICENSE file in the root directory for full license terms.
 */

# Environment Variables Verification Checklist

## Required Variables (Must be set in production)

### Database

* [ ] `DATABASE_URL` - PostgreSQL connection string
  * Format: `postgresql://user:password@host:port/database`
  * Verify: Connection test successful

### Authentication (Clerk)

* [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
  * Format: `pk_test_...` or `pk_live_...`
  * Verify: Key is valid and matches environment

* [ ] `CLERK_SECRET_KEY` - Clerk secret key
  * Format: `sk_test_...` or `sk_live_...`
  * Verify: Key is valid and matches environment
* [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL
* [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL

### Email Service (Resend)

* [ ] `RESEND_API_KEY` - Resend API key
  * Format: `re_...`
  * Verify: Key is valid and has sending permissions

* [ ] `RESEND_FROM_EMAIL` - Sender email address
  * Verify: Domain is verified in Resend dashboard

### Contact & Support Forms

* [ ] `ARCJET_KEY` - Arcjet API key for rate limiting
  * Format: `arcj_public_...` or `arcj_private_...`
  * Verify: Key is valid

* [ ] `CONTACT_NOTIFICATION_EMAIL` - Email for contact form submissions
* [ ] `SUPPORT_EMAIL` - Email for support form submissions
* [ ] `PUBLIC_SUPPORT_USER_ID` - System user ID for support tickets
  * **CRITICAL**: Must be a valid user ID from `financbase.users` table
  * Verify: User exists in database and has appropriate permissions

## Recommended Variables

### Monitoring & Error Tracking

* [ ] `SENTRY_DSN` - Sentry error tracking DSN
  * Format: `https://...@sentry.io/...`
  * Verify: Project is active and receiving errors

### Caching (Optional)

* [ ] `REDIS_URL` - Redis connection string (if using Redis)
  * Format: `redis://...` or `rediss://...`
  * Verify: Connection test successful

## Verification Steps

1. Run the verification script:

   ```bash
   bash scripts/verify-env.sh
   ```

2. Test database connection:

   ```bash
   npm run db:test
   ```

3. Test email service:
   * Send a test email through the contact form
   * Verify email is received

4. Verify `PUBLIC_SUPPORT_USER_ID`:

   ```sql
   SELECT id, email, first_name, last_name 
   FROM financbase.users 
   WHERE id = '<PUBLIC_SUPPORT_USER_ID>';
   ```

5. Test authentication:
   * Attempt to sign in
   * Verify Clerk keys are working

## Production Checklist

Before deploying to production, ensure:

* [ ] All required variables are set
* [ ] All keys are production keys (not test keys)
* [ ] `PUBLIC_SUPPORT_USER_ID` points to a valid production user
* [ ] Email domain is verified in Resend
* [ ] Database connection is to production database
* [ ] Sentry is configured for error tracking
* [ ] Rate limiting is configured appropriately

## Notes

* Never commit `.env.local` or `.env` files to version control
* Use environment variable management in your hosting platform (Vercel, Railway, etc.)
* Rotate keys periodically for security
* Monitor environment variable usage in production logs
