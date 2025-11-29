# Multi-Organization Quick Start

## 🚀 Quick Activation Steps

### Step 1: Run the Migration (Required)

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="your-database-url"

# Run the migration
./scripts/run-multi-org-migration.sh

# OR manually with psql
psql $DATABASE_URL -f drizzle/migrations/0065_multi_organization_support.sql
```

**What happens:**
- ✅ Updates `users.organization_id` to be nullable
- ✅ Adds new fields to `organizations` table
- ✅ Creates new tables (subscriptions, invitations, settings)
- ✅ Migrates existing data (creates default orgs for users)
- ✅ Creates indexes for performance

**Verification:**
```sql
-- Check users table
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'financbase' 
AND table_name = 'users' 
AND column_name = 'organization_id';
-- Should show: is_nullable = 'YES'

-- Check new tables exist
\dt organization_*
```

### Step 2: Update RLS Policies (Critical)

**Important:** Your existing RLS policies need to be updated to use `app.current_org_id` instead of looking up from the users table.

**Quick Update Pattern:**

For each table with `organization_id` column, update policies:

```sql
-- Example: Update invoices table policies
DROP POLICY IF EXISTS "invoices_org_select" ON "invoices";
CREATE POLICY "invoices_org_select" ON "invoices"
  FOR SELECT USING (
    organization_id = current_setting('app.current_org_id', true)::uuid
  );
```

**Helper Function Available:**
```sql
-- Use this in your policies
organization_id = get_active_organization_id()
```

**See full guide:** `docs/organizations/RLS_POLICY_UPDATE_GUIDE.md`

### Step 3: Test the Feature

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to organizations:**
   - Go to `/organizations`
   - You should see the organization switcher in the header

3. **Create a test organization:**
   - Click "Create Organization"
   - Fill in name and details
   - Submit

4. **Switch organizations:**
   - Click the organization switcher in header
   - Select different organization
   - Verify data changes

5. **Test member invitation:**
   - Go to organization settings
   - Members tab
   - Invite a test email
   - Check email for invitation link

## ✅ Verification Checklist

After migration and RLS updates:

- [ ] Migration completed without errors
- [ ] Organization switcher appears in header
- [ ] Can create new organization
- [ ] Can switch between organizations
- [ ] Data is isolated (can't see other org's data)
- [ ] RLS policies working correctly
- [ ] Invitations can be sent
- [ ] Invitations can be accepted

## 🐛 Troubleshooting

### Organization Switcher Not Showing
- Check browser console for errors
- Verify `OrganizationProvider` is in `app/providers.tsx`
- Check that user has at least one organization

### Can't See Data After Switching
- Verify RLS policies are updated
- Check `app.current_org_id` is being set (check database logs)
- Verify user is member of the organization

### Migration Fails
- Check database connection
- Verify permissions
- Check for existing conflicting data
- Review migration file for syntax errors

## 📚 Documentation

- **Setup Guide**: `docs/organizations/SETUP_GUIDE.md`
- **RLS Policy Guide**: `docs/organizations/RLS_POLICY_UPDATE_GUIDE.md`
- **API Documentation**: `docs/api/organizations.md`
- **Implementation Summary**: `docs/organizations/IMPLEMENTATION_SUMMARY.md`

## 🎯 Next Steps After Activation

1. Update all RLS policies for your tables
2. Test thoroughly in development
3. Migrate existing subscriptions to organization subscriptions
4. Train users on organization switching
5. Monitor for issues in production

## 💡 Tips

- Start with a test organization
- Use the unified view to see data across organizations
- Organization switcher remembers your choice (cookie)
- Each organization has separate billing/subscription
- Members can have different roles per organization

