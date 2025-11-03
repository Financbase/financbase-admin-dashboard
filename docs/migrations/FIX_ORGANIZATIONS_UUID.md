# Migration Guide: Fix Organizations UUID Schema Mismatch

## Problem

The `organizations.id` column in the database is `INTEGER`, but:
- The Drizzle migrations expect it to be `UUID`
- The `users.organizationId` column expects a `UUID` foreign key
- The code schema definition has been updated to use `UUID`

This causes type mismatches when creating users in the Clerk webhook.

## Solution

Convert `organizations.id` from `INTEGER` to `UUID` to align with the expected schema.

## Files Updated

1. **`lib/db/schemas/organizations.schema.ts`** - Updated to use `uuid` instead of `serial`
2. **`scripts/migrate-organizations-to-uuid.sql`** - SQL migration script
3. **`drizzle/migrations/001_fix_organizations_uuid.sql`** - Drizzle migration file

## Migration Steps

### Option 1: Using Drizzle (Recommended)

If you're using Drizzle migrations:

```bash
# Run the migration
pnpm drizzle-kit push
# OR
pnpm exec drizzle-kit migrate
```

### Option 2: Manual SQL Migration

If you need more control or are running migrations manually:

1. **Backup your database first:**
   ```bash
   pg_dump $DATABASE_URL > backup_before_uuid_migration.sql
   ```

2. **Run the migration script:**
   ```bash
   psql $DATABASE_URL -f scripts/migrate-organizations-to-uuid.sql
   ```

3. **Verify the migration:**
   ```sql
   -- Check that organizations.id is now UUID
   SELECT data_type 
   FROM information_schema.columns 
   WHERE table_name = 'organizations' 
   AND column_name = 'id';
   -- Should return: uuid
   
   -- Verify all organizations have UUIDs
   SELECT COUNT(*) FROM organizations;
   SELECT COUNT(*) FROM organization_members WHERE organization_id IS NOT NULL;
   ```

## Pre-Migration Checklist

- [ ] Database backup created
- [ ] Tested in development/staging environment
- [ ] Verified no critical data dependencies on integer IDs
- [ ] Checked all foreign key relationships
- [ ] Reviewed rollback plan

## Post-Migration Verification

After running the migration, verify:

1. **Schema verification:**
   ```sql
   SELECT data_type 
   FROM information_schema.columns 
   WHERE table_name = 'organizations' 
   AND column_name = 'id';
   -- Expected: uuid
   ```

2. **Data integrity:**
   ```sql
   -- All organizations should have UUIDs
   SELECT COUNT(*) as total_orgs,
          COUNT(*) FILTER (WHERE id IS NOT NULL) as orgs_with_id
   FROM organizations;
   
   -- All organization_members should have valid UUID foreign keys
   SELECT COUNT(*) as total_members,
          COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as members_with_org_id
   FROM organization_members;
   ```

3. **Foreign key relationships:**
   ```sql
   -- Check for orphaned organization_members
   SELECT COUNT(*) 
   FROM organization_members om
   LEFT JOIN organizations o ON om.organization_id = o.id
   WHERE o.id IS NULL;
   -- Should return: 0
   ```

## Rollback Plan

If you need to rollback:

1. **Restore from backup:**
   ```bash
   psql $DATABASE_URL < backup_before_uuid_migration.sql
   ```

2. **Revert schema definition:**
   - Change `lib/db/schemas/organizations.schema.ts` back to `serial`
   - Update `organizationMembers.organizationId` back to `serial`

## Testing

After migration, test:

1. **User Registration:** Sign up a new user via Clerk - should create user with valid UUID organizationId
2. **Database Queries:** Verify queries using organizationId work correctly
3. **Foreign Keys:** Test that organization_members relationships work

## Notes

- This migration is **destructive** - it changes the primary key type
- Existing integer IDs will be replaced with new UUIDs
- Foreign key relationships in `organization_members` will be updated automatically
- The migration includes safety checks and verification steps

## Support

If you encounter issues:

1. Check the migration logs
2. Verify database connectivity
3. Ensure you have proper permissions
4. Review the error messages in the migration script

