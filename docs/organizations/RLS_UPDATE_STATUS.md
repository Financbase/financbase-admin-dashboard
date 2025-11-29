# RLS Policy Update Status

## Summary

**106 RLS policies** have been identified that need updating to use `app.current_org_id` instead of looking up organization_id from the users table.

## Migration Script

A migration script has been created at:
- `drizzle/migrations/0067_update_compliance_rls_policies.sql`

This script updates all compliance table policies to use the active organization from the session.

## Tables Affected

All policies in these tables need updating:

### Direct organization_id Policies
- `financbase_security_incidents`
- `financbase_ir_team_members`
- `financbase_ir_runbooks`
- `financbase_ir_communication_templates`
- `financbase_ir_drills`
- `financbase_siem_events`
- `financbase_siem_integrations`
- `financbase_alert_rules`
- `financbase_real_time_alerts`
- `financbase_immutable_audit_trail`
- `financbase_log_aggregation_config`
- `financbase_policy_documents`
- `financbase_policy_versions`
- `financbase_policy_assignments`
- `financbase_policy_approval_workflows`
- `financbase_security_training_programs`
- `financbase_training_assignments`
- `financbase_business_associates`
- `financbase_assets`
- `financbase_risks`
- `financbase_risk_treatment_plans`
- `financbase_phishing_simulation_results`

### Indirect Policies (via foreign keys)
- `financbase_incident_team_assignments` (via incident_id)
- `financbase_runbook_executions` (via incident_id)
- `financbase_training_assessments` (via assignment_id)
- `financbase_training_certificates` (via assignment_id)
- `financbase_baa_compliance_checklist` (via business_associate_id)

## Update Pattern

**Old Pattern:**
```sql
organization_id IN (
  SELECT organization_id FROM financbase.users 
  WHERE id = current_setting('app.current_user_id', true)::uuid
)
```

**New Pattern:**
```sql
organization_id = current_setting('app.current_org_id', true)::uuid
```

Or using the helper function:
```sql
organization_id = get_active_organization_id()
```

## Running the Update

### Option 1: Run Migration Script
```bash
psql $DATABASE_URL -f drizzle/migrations/0067_update_compliance_rls_policies.sql
```

### Option 2: Use Helper Script
```bash
node scripts/update-existing-rls-policies.js
```

### Option 3: Manual Update
For each table, update policies manually following the pattern in `docs/organizations/RLS_POLICY_UPDATE_GUIDE.md`

## Verification

After updating, verify policies are correct:

```sql
-- Check that no policies still use the old pattern
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE qual::text LIKE '%financbase.users%'
  AND qual::text LIKE '%app.current_user_id%';
```

Should return 0 rows.

## Next Steps

1. ✅ Migration script created
2. ⚠️  Run migration when ready (some tables may not exist yet)
3. ⚠️  Test organization switching
4. ⚠️  Verify data isolation
5. ⚠️  Update any other tables with organization_id that aren't in compliance tables

## Notes

- The migration script will skip tables that don't exist (safe to run)
- Policies for tables that don't exist yet will be created when those tables are created
- The helper function `get_active_organization_id()` is available for use in policies

