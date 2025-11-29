# Multi-Organization Setup Guide

## Overview

This guide walks you through setting up and using the multi-organization feature in Financbase.

## Prerequisites

- Database access (PostgreSQL/Neon)
- Admin access to run migrations
- Clerk authentication configured

## Step 1: Run the Migration

Execute the migration script to update your database schema:

```bash
# Option 1: Using the provided script
./scripts/run-multi-org-migration.sh

# Option 2: Using psql directly
psql $DATABASE_URL -f drizzle/migrations/0065_multi_organization_support.sql

# Option 3: Using Drizzle (if configured)
pnpm drizzle-kit push
```

**What the migration does:**
- Makes `users.organization_id` nullable
- Adds new fields to `organizations` table
- Creates `organization_subscriptions`, `organization_invitations`, and `organization_settings` tables
- Migrates existing data (creates default organizations for existing users)
- Creates indexes for performance

## Step 2: Verify Migration

Check that the migration completed successfully:

```sql
-- Verify users table
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'organization_id';
-- Should show: is_nullable = 'YES'

-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'organization_subscriptions',
  'organization_invitations', 
  'organization_settings'
);
```

## Step 3: Update RLS Policies (Important!)

Update your RLS policies to use `app.current_org_id` instead of looking up from users table.

See `docs/organizations/RLS_POLICY_UPDATE_GUIDE.md` for detailed instructions.

**Quick example:**
```sql
-- Old policy
CREATE POLICY "table_select" ON "table"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users 
      WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- New policy
CREATE POLICY "table_select" ON "table"
  FOR SELECT USING (
    organization_id = current_setting('app.current_org_id', true)::uuid
  );
```

## Step 4: Verify Integration

The following components are already integrated:

✅ **OrganizationProvider** - Added to `app/providers.tsx`
✅ **OrganizationSwitcher** - Added to `components/layout/enhanced-top-nav.tsx`
✅ **RLS Context** - Updated to use active organization
✅ **API Routes** - All organization endpoints created

## Step 5: Test the Feature

1. **Create a new organization:**
   - Navigate to `/organizations`
   - Click "Create Organization"
   - Fill in details and submit

2. **Switch organizations:**
   - Click the organization switcher in the header
   - Select a different organization
   - Verify data changes based on active organization

3. **Invite members:**
   - Go to organization settings
   - Navigate to Members tab
   - Click "Invite Member"
   - Enter email and select role
   - Verify invitation email is sent

4. **Accept invitation:**
   - Open invitation link from email
   - Sign in if needed
   - Accept invitation
   - Verify you're added to the organization

## Usage Examples

### Switch Organization Programmatically

```typescript
import { useOrganization } from '@/contexts/organization-context';

function MyComponent() {
  const { switchOrganization, organizations } = useOrganization();
  
  const handleSwitch = async () => {
    await switchOrganization(organizations[1].id);
  };
  
  return <button onClick={handleSwitch}>Switch</button>;
}
```

### Check Active Organization

```typescript
import { useActiveOrganization } from '@/contexts/organization-context';

function MyComponent() {
  const activeOrg = useActiveOrganization();
  
  return <div>Current: {activeOrg?.name}</div>;
}
```

### Use Unified Data View

```tsx
import { UnifiedDataView } from '@/components/organizations/unified-data-view';

function MyPage() {
  return (
    <UnifiedDataView title="Transactions">
      <TransactionsList />
    </UnifiedDataView>
  );
}
```

## Troubleshooting

### Issue: Organization switcher not showing
**Solution:** Verify `OrganizationProvider` is in `app/providers.tsx` and wraps your app.

### Issue: Can't see data after switching
**Solution:** 
1. Check RLS policies are updated to use `app.current_org_id`
2. Verify `setRLSContext()` is being called in API routes
3. Check browser console for errors

### Issue: Migration fails
**Solution:**
1. Check database connection
2. Verify you have necessary permissions
3. Review migration file for syntax errors
4. Check for existing conflicting data

### Issue: Invitations not working
**Solution:**
1. Verify email service (Resend) is configured
2. Check `RESEND_FROM_EMAIL` environment variable
3. Verify invitation tokens are being generated
4. Check database for invitation records

## Next Steps

1. Update RLS policies for all tables (see RLS_POLICY_UPDATE_GUIDE.md)
2. Test thoroughly in development
3. Migrate existing user subscriptions to organization subscriptions
4. Train users on organization switching
5. Monitor for any issues in production

## Support

For issues or questions:
- Check API documentation: `docs/api/organizations.md`
- Review RLS policy guide: `docs/organizations/RLS_POLICY_UPDATE_GUIDE.md`
- Check migration file: `drizzle/migrations/0065_multi_organization_support.sql`

