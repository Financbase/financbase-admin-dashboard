# Authentication Failures

**Severity**: Critical (P0)  
**Last Updated**: 2024-01-XX  
**Related**: [Database Connection Issues](./database-connection.md)

## Symptoms

- Users cannot sign in
- API endpoints return 401 Unauthorized errors
- "Invalid session" or "Authentication required" messages
- Users are redirected to sign-in page repeatedly
- Clerk webhook failures in logs

## Common Error Messages

```
401 Unauthorized
Authentication required
Invalid session token
Clerk authentication failed
Webhook signature verification failed
```

## Root Causes

1. **Missing or Invalid Clerk Keys**: Environment variables not set or incorrect
2. **Clerk Service Outage**: Clerk service is down or experiencing issues
3. **Webhook Configuration**: Webhook endpoint not configured or misconfigured
4. **Session Expiration**: Sessions expired or invalid
5. **CORS Issues**: Cross-origin requests blocked
6. **Middleware Configuration**: Auth middleware not properly configured

## Resolution Steps

### Step 1: Verify Clerk Environment Variables

```bash
# Check Clerk keys are set
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Should output keys starting with:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_... or pk_live_...
# CLERK_SECRET_KEY: sk_test_... or sk_live_...
```

If not set:
```bash
# Load from .env.local
source .env.local

# Or set manually
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
export CLERK_SECRET_KEY="sk_test_..."
```

### Step 2: Verify Clerk Keys in Dashboard

1. **Access Clerk Dashboard**: https://dashboard.clerk.com
2. **Select Your Application**
3. **Go to API Keys** section
4. **Verify Keys Match**:
   - Publishable Key should match `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key should match `CLERK_SECRET_KEY`
5. **Check Environment**:
   - Development: Use `pk_test_` and `sk_test_`
   - Production: Use `pk_live_` and `sk_live_`

### Step 3: Test Clerk Connection

```bash
# Test Clerk API connection (requires curl and jq)
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  | jq

# Should return list of users or empty array
```

**If this fails**, check:
- Key is correct
- Key has proper permissions
- Network connectivity

### Step 4: Check Clerk Service Status

1. **Check Status Page**: https://status.clerk.com
2. **Check for Outages**: Look for active incidents
3. **Verify Region**: Ensure correct region is configured

### Step 5: Verify Middleware Configuration

Check `middleware.ts`:

```typescript
// Should include auth middleware
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api/health"],
});
```

**Common Issues**:
- Routes incorrectly marked as public
- Middleware not applied to all routes
- Conflicting middleware configuration

### Step 6: Check Webhook Configuration

If using Clerk webhooks:

1. **Verify Webhook Endpoint**: Should be `https://yourdomain.com/api/webhooks/clerk`
2. **Check Webhook Secret**: Verify `WEBHOOK_SECRET` in environment
3. **Test Webhook**:
   ```bash
   # Check webhook logs
   tail -f logs/webhook.log

   # Or check Clerk dashboard for webhook delivery status
   ```

4. **Verify Webhook Signature**:
   ```typescript
   // Should verify webhook signature in webhook handler
   import { Webhook } from 'svix';
   
   const wh = new Webhook(process.env.WEBHOOK_SECRET);
   const payload = wh.verify(body, headers);
   ```

### Step 7: Check Session Management

```bash
# Check if sessions are being created
# Look for Clerk session cookies in browser DevTools
# Application -> Cookies -> Check for __session cookie
```

**If sessions not created**:
- Check Clerk frontend integration
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check browser console for errors

### Step 8: Verify API Route Authentication

Check API routes are properly protected:

```typescript
// Good: Properly protected
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

### Step 9: Check CORS Configuration

If authentication works locally but fails from frontend:

1. **Verify CORS Headers**:
   ```typescript
   // In API route
   return NextResponse.json(data, {
     headers: {
       'Access-Control-Allow-Origin': '*', // Or specific domain
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
     },
   });
   ```

2. **Check Next.js Config**:
   ```javascript
   // next.config.mjs
   // Should allow Clerk domains in CSP
   ```

### Step 10: Check Application Logs

```bash
# Search for authentication errors
grep -i "auth\|clerk\|unauthorized\|401" logs/app.log

# Check for webhook errors
grep -i "webhook" logs/app.log
```

## Verification

After resolving the issue:

1. **Test Sign In Flow**:
   - Visit `/sign-in`
   - Complete authentication
   - Verify redirect to dashboard

2. **Test API Access**:
   ```bash
   # Get session token (from browser DevTools or API)
   curl -X GET "http://localhost:3000/api/users" \
     -H "Authorization: Bearer <session-token>"
   ```

3. **Check User Data**:
   - Verify user is created in database
   - Check Clerk dashboard for user

## Prevention

1. **Monitor Authentication**:
   - Set up alerts for authentication failures
   - Track authentication success rate
   - Monitor session expiration rates

2. **Regular Key Rotation**:
   - Rotate Clerk keys annually
   - Use secrets management for production
   - Never commit keys to version control

3. **Webhook Monitoring**:
   - Monitor webhook delivery success rate
   - Set up alerts for webhook failures
   - Test webhook endpoints regularly

4. **Error Tracking**:
   - Use Sentry or similar for error tracking
   - Monitor authentication-related errors
   - Set up alerts for spikes in auth failures

5. **Documentation**:
   - Keep authentication setup documentation updated
   - Document common issues and solutions
   - Maintain runbook for auth troubleshooting

## Related Documentation

- [Clerk Configuration](../configuration/CLERK_CONFIGURATION.md)
- [Environment Variables](../configuration/ENVIRONMENT_VARIABLES.md)
- [API Authentication](../api/README.md)
- [Security Guide](../../SECURITY.md)

## Escalation

If issue persists:

1. **Check Clerk Status**: https://status.clerk.com
2. **Review Clerk Dashboard**: Check for configuration issues
3. **Contact Clerk Support**: support@clerk.com
4. **Check Application Logs**: Full error logs with timestamps
5. **Escalate to Team Lead**: Include all troubleshooting steps taken
