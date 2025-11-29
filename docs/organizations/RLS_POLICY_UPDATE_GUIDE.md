# RLS Policy Update Guide for Multi-Organization Support

## Overview

This guide explains how to update existing Row Level Security (RLS) policies to work with the new multi-organization support system.

## Key Changes

### Before (Single Organization)
RLS policies used the user's primary `organization_id` from the `users` table:

```sql
CREATE POLICY "table_org_select" ON "schema"."table"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users 
      WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );
```

### After (Multi-Organization)
RLS policies should use the active organization from the session:

```sql
CREATE POLICY "table_org_select" ON "schema"."table"
  FOR SELECT USING (
    organization_id = current_setting('app.current_org_id', true)::uuid
  );
```

## Helper Functions

Two helper functions are available:

### `get_active_organization_id()`
Returns the active organization ID from the session:
```sql
SELECT get_active_organization_id();
```

### `is_user_member_of_org(user_id UUID, org_id UUID)`
Checks if a user is a member of an organization:
```sql
SELECT is_user_member_of_org(
  current_setting('app.current_user_id', true)::uuid,
  current_setting('app.current_org_id', true)::uuid
);
```

## Update Pattern

For each table with `organization_id` column, update policies:

1. **DROP existing policies:**
```sql
DROP POLICY IF EXISTS "table_org_select" ON "schema"."table";
DROP POLICY IF EXISTS "table_org_insert" ON "schema"."table";
DROP POLICY IF EXISTS "table_org_update" ON "schema"."table";
DROP POLICY IF EXISTS "table_org_delete" ON "schema"."table";
```

2. **CREATE new policies:**
```sql
CREATE POLICY "table_org_select" ON "schema"."table"
  FOR SELECT USING (
    organization_id = get_active_organization_id()
  );

CREATE POLICY "table_org_insert" ON "schema"."table"
  FOR INSERT WITH CHECK (
    organization_id = get_active_organization_id()
  );

CREATE POLICY "table_org_update" ON "schema"."table"
  FOR UPDATE USING (
    organization_id = get_active_organization_id()
  );

CREATE POLICY "table_org_delete" ON "schema"."table"
  FOR DELETE USING (
    organization_id = get_active_organization_id()
  );
```

## Tables to Update

Review and update RLS policies for all tables that have an `organization_id` column. Common tables include:

- `invoices`
- `expenses`
- `transactions`
- `clients`
- `projects`
- `reports`
- `budgets`
- All compliance tables
- All HR tables
- All financial tables

## Verification

After updating policies, verify:

1. Users can only see data from their active organization
2. Switching organizations changes the data visible
3. Data isolation is maintained across organizations
4. No data leakage between organizations

## Testing

Test the following scenarios:

1. User with single organization - should work as before
2. User with multiple organizations - can switch and see different data
3. User not member of organization - should not see data
4. Cross-organization queries - should be blocked by RLS

## Rollback

If you need to rollback, you can:

1. Restore previous policy definitions
2. The `get_active_organization_id()` function will return NULL if not set
3. Policies will fail gracefully (no data returned)

## Notes

- The `app.current_org_id` session variable is set automatically by `setRLSContext()`
- If not set, policies will return no rows (safe default)
- Always test in a development environment first
- Consider a gradual rollout for production

