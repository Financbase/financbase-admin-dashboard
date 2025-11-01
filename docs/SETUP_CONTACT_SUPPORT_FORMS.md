# Contact & Support Forms Setup Guide

Complete setup guide for the contact and support form features.

## Overview

The platform now includes two secure public forms:

1. **Contact Form** (`/contact`) - General inquiries
2. **Support Form** (`/support`) - Support tickets with categorization

Both forms include:
- ✅ Rate limiting via Arcjet
- ✅ Bot detection and spam protection
- ✅ Input sanitization
- ✅ Email notifications
- ✅ Database storage
- ✅ Comprehensive validation

## Step 1: Database Migration

Run the migration to create the necessary tables:

```bash
# Generate migration (if needed)
pnpm db:generate

# Apply migration
pnpm db:push

# Or use drizzle-kit migrate
pnpm db:migrate
```

The migration `0011_marketing_analytics_contact_submissions.sql` creates:

- `financbase_contact_submissions` - Contact form submissions
- `financbase_marketing_events` - Marketing event tracking
- `financbase_marketing_stats` - Aggregated marketing statistics
- `financbase_user_feedback` - User feedback collection
- `marketing_analytics_cache` - Cached analytics data

## Step 2: Environment Variables

Add these variables to your `.env.local` (development) or hosting platform (production):

### Required

```env
# Arcjet Security (Required for rate limiting)
ARCJET_KEY=arc_public_key_here

# Resend Email Service (Required for notifications)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Email Recipients
CONTACT_NOTIFICATION_EMAIL=hello@financbase.com
SUPPORT_EMAIL=support@financbase.com

# Public Support User ID (Required)
# This must be a valid user ID from your financbase.users table
PUBLIC_SUPPORT_USER_ID=your-system-user-id-here
```

### Getting API Keys

1. **Arcjet Key:**
   - Sign up at https://arcjet.com
   - Create a new project
   - Copy your public key
   - Add to `ARCJET_KEY`

2. **Resend API Key:**
   - Sign up at https://resend.com
   - Navigate to API Keys
   - Create a new key
   - Copy and add to `RESEND_API_KEY`

3. **Public Support User ID:**
   - Create a system user in your database:
     ```sql
     INSERT INTO financbase.users (id, email, name, clerk_id)
     VALUES ('public-support-user', 'system@financbase.com', 'System User', 'system');
     ```
   - Or use an existing user ID
   - Add to `PUBLIC_SUPPORT_USER_ID`

## Step 3: Verify Email Domain

For production, verify your email domain in Resend:

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records as instructed
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` to use your verified domain

For development, use Resend's test domain:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Step 4: Test the Forms

### Test Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test contact form submission.",
    "website": ""
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you within 24 hours.",
  "submissionId": "uuid-here"
}
```

### Test Support Form

```bash
curl -X POST http://localhost:3000/api/support/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Support Request",
    "message": "This is a test support ticket.",
    "category": "general",
    "priority": "medium",
    "website": ""
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Thank you for contacting support! We will respond within 24 hours.",
  "ticketNumber": "PUB-1234567890-ABCD"
}
```

## Step 5: Verify Email Notifications

1. Submit test forms using the commands above
2. Check your email inboxes:
   - `CONTACT_NOTIFICATION_EMAIL` should receive contact form submissions
   - `SUPPORT_EMAIL` should receive support ticket submissions
3. Verify emails contain:
   - Form data (name, email, message)
   - Submission timestamp
   - IP address (for security tracking)

## Troubleshooting

### Forms Return 403 Errors

**Problem:** Arcjet is blocking requests

**Solution:**
1. Verify `ARCJET_KEY` is correct
2. Check Arcjet dashboard for blocked requests
3. Ensure key has proper permissions
4. For testing, you can use DRY_RUN mode in `lib/security/arcjet-service.ts`

### Emails Not Sending

**Problem:** No emails received after form submission

**Solution:**
1. Verify `RESEND_API_KEY` is correct
2. Check `RESEND_FROM_EMAIL` domain is verified (or use `onboarding@resend.dev`)
3. Check Resend dashboard for delivery status
4. Verify `CONTACT_NOTIFICATION_EMAIL` and `SUPPORT_EMAIL` are valid addresses
5. Check server logs for email errors

### Database Errors

**Problem:** Forms return 500 errors

**Solution:**
1. Verify migration `0011_marketing_analytics_contact_submissions.sql` is applied
2. Check database connection in `DATABASE_URL`
3. Verify `PUBLIC_SUPPORT_USER_ID` exists in `financbase.users` table
4. Check server logs for specific database errors

### Rate Limiting Issues

**Problem:** Forms are rate limited too aggressively

**Solution:**
1. Adjust rate limits in `lib/security/arcjet-service.ts`
2. Configure different limits for contact vs support endpoints
3. Check Arcjet dashboard for rate limit configuration

## Testing

Run the test suite:

```bash
# Run contact form tests
pnpm test __tests__/api/contact-form.test.ts

# Run support form tests
pnpm test __tests__/api/support-form.test.ts

# Run all API tests
pnpm test __tests__/api/
```

## Monitoring

### View Submissions

Contact submissions are stored in `financbase_contact_submissions`:

```sql
SELECT * FROM financbase.financbase_contact_submissions
ORDER BY created_at DESC
LIMIT 10;
```

Support tickets are stored in `financbase_support_tickets`:

```sql
SELECT * FROM financbase.financbase_support_tickets
WHERE ticket_number LIKE 'PUB-%'
ORDER BY created_at DESC
LIMIT 10;
```

### Analytics

Use the marketing analytics service to view form analytics:

```typescript
import { MarketingAnalyticsService } from '@/lib/services/marketing/marketing-analytics-service';

const service = new MarketingAnalyticsService();
const analytics = await service.getContactAnalytics();
```

## Security Features

### Rate Limiting
- 100 requests per 60 seconds (default)
- Configurable per endpoint in Arcjet

### Bot Detection
- Automatic bot detection via Arcjet
- Honeypot fields in forms

### Input Sanitization
- XSS prevention
- SQL injection protection
- Input length limits

### Spam Protection
- Honeypot fields
- Pattern detection
- URL count limits

## Next Steps

1. ✅ Run database migration
2. ✅ Set environment variables
3. ✅ Test form submissions
4. ✅ Verify email delivery
5. ✅ Monitor submissions in database
6. ✅ Configure custom email templates (optional)

## Additional Resources

- [Environment Variables Guide](./configuration/ENVIRONMENT_VARIABLES.md)
- [Resend Configuration](./configuration/RESEND_CONFIGURATION.md)
- [Arcjet Documentation](https://docs.arcjet.com)

