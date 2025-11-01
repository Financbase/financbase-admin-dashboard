# Row Level Security (RLS) Integration Guide

This guide explains how RLS policies are integrated into the application and how to use them.

## Overview

Row Level Security (RLS) has been enabled on sensitive tables to ensure users can only access their own data:

- ✅ `financbase.users` - Users can only see own record or organization members
- ✅ `public.payment_methods` - Users can only see their own payment methods
- ✅ `public.refresh_tokens` - Users can only see their own refresh tokens
- ✅ `public.api_keys` - Users can only see their contractor's API keys

## How It Works

1. **User Context**: When a user authenticates via Clerk, their context is set in PostgreSQL session variables
2. **RLS Policies**: PostgreSQL automatically filters queries based on these session variables
3. **Transparent**: Your application code doesn't need to manually filter by user_id - RLS handles it

## Integration Steps

### 1. Use `withRLS()` Helper in API Routes

The easiest way to ensure RLS context is set correctly:

```typescript
import { withRLS } from '@/lib/api/with-rls';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return withRLS(async (clerkUserId) => {
    // RLS context is automatically set here
    // All queries will automatically filter to user's data
    
    const users = await db.select().from(financbase.users);
    // RLS automatically filters to current user's org members
    
    return NextResponse.json({ users });
  });
}
```

### 2. Manual Context Setting (Advanced)

If you need more control, set context manually:

```typescript
import { setRLSContextFromClerkId } from '@/lib/db/rls-context';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Set RLS context
  await setRLSContextFromClerkId(userId);
  
  // Now queries will use RLS
  const users = await db.select().from(financbase.users);
  
  return NextResponse.json({ users });
}
```

### 3. Middleware Integration

The middleware (`middleware.ts`) automatically sets basic RLS context for protected routes. However, it's recommended to use `withRLS()` in individual API routes for better control and error handling.

## Testing RLS Policies

### Manual SQL Testing

Run the test script to verify RLS is working:

```bash
# Connect to database
psql $DATABASE_URL

# Run test script
\i scripts/test-rls-policies.sql
```

### Application Testing

1. **Test as User A**: Sign in as one user and verify you can only see your own data
2. **Test as User B**: Sign in as another user and verify you can't see User A's data
3. **Test Organization**: Sign in as users from same organization and verify you can see each other

### Example Test Case

```typescript
// In your test file
import { setRLSContextFromClerkId } from '@/lib/db/rls-context';

test('RLS prevents users from seeing other users data', async () => {
  // Set context for User A
  await setRLSContextFromClerkId('clerk_user_a');
  
  const usersA = await db.select().from(financbase.users);
  // Should only see User A's own record or org members
  
  // Set context for User B
  await setRLSContextFromClerkId('clerk_user_b');
  
  const usersB = await db.select().from(financbase.users);
  // Should NOT include User A's data (unless same org)
});
```

## Migration Guide

### Existing API Routes

To add RLS to existing routes, wrap your handlers with `withRLS()`:

**Before:**
```typescript
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const data = await db.select().from(someTable);
  return NextResponse.json({ data });
}
```

**After:**
```typescript
import { withRLS } from '@/lib/api/with-rls';

export async function GET(req: NextRequest) {
  return withRLS(async (clerkUserId) => {
    // RLS context automatically set
    const data = await db.select().from(someTable);
    return NextResponse.json({ data });
  });
}
```

### Routes Already Updated

- ✅ `app/api/invoices/route.ts` - Uses `withRLS()` for GET and POST

## Troubleshooting

### Issue: Users can see all data (RLS not working)

**Solutions:**
1. Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true;`
2. Check context is set: Query `current_setting('app.current_user_id', true)`
3. Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'users';`
4. Ensure `withRLS()` is called before database queries

### Issue: "permission denied for table" errors

**Solutions:**
1. Verify user has SELECT permission on the table
2. Check RLS policies allow the operation
3. Service role (`neondb_owner`) can bypass RLS - ensure your connection uses the correct role

### Issue: Context not persisting across queries

**Note:** In serverless environments (Vercel), each request gets a new database connection. RLS context must be set per-request using `withRLS()` in each API route handler.

## Best Practices

1. **Always use `withRLS()`** in API routes that query sensitive tables
2. **Don't bypass RLS** unless absolutely necessary (admin operations)
3. **Test RLS policies** regularly to ensure they're working
4. **Monitor for access denied errors** that might indicate policy issues
5. **Document custom policies** when adding new RLS-protected tables

## Adding RLS to New Tables

1. Enable RLS: `ALTER TABLE schema.table ENABLE ROW LEVEL SECURITY;`
2. Create policies: See existing policies in database for examples
3. Update `withRLS()` if needed for new context variables
4. Test thoroughly with multiple users

## References

- PostgreSQL RLS Documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Function: `perf.set_user_context()` - Database function for setting context
- Utility: `lib/db/rls-context.ts` - TypeScript utilities
- Helper: `lib/api/with-rls.ts` - API route wrapper

