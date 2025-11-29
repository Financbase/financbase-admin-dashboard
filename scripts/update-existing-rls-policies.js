#!/usr/bin/env node

/**
 * Update Existing RLS Policies to Use app.current_org_id
 * 
 * This script finds all existing RLS policies that need updating and updates them
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔄 Updating RLS Policies to Use Active Organization');
console.log('====================================================\n');

// First, find all policies that need updating
const findPoliciesSQL = `
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE 
  (
    qual::text LIKE '%organization_id%' 
    AND qual::text LIKE '%financbase.users%'
    AND qual::text LIKE '%current_setting%app.current_user_id%'
  )
  OR
  (
    with_check::text LIKE '%organization_id%' 
    AND with_check::text LIKE '%financbase.users%'
    AND with_check::text LIKE '%current_setting%app.current_user_id%'
  )
ORDER BY schemaname, tablename, policyname;
`;

try {
  // Get list of policies to update
  const result = execSync(
    `psql "${process.env.DATABASE_URL}" -t -c "${findPoliciesSQL.replace(/\n/g, ' ')}"`,
    { encoding: 'utf-8', env: { ...process.env } }
  );

  const policies = result.trim().split('\n').filter(line => line.trim());
  
  if (policies.length === 0) {
    console.log('✅ No policies found that need updating!');
    console.log('   All RLS policies are already using app.current_org_id or tables don\'t exist yet.');
    process.exit(0);
  }

  console.log(`📋 Found ${policies.length} policies to update\n`);

  // Generate update SQL for each policy
  const updates = [];
  const processed = new Set();

  for (const policy of policies) {
    const [schema, table, policyName, cmd] = policy.split('|').map(s => s.trim());
    const key = `${schema}.${table}.${policyName}`;
    
    if (processed.has(key)) continue;
    processed.add(key);

    // Generate DROP and CREATE statements
    const dropSQL = `DROP POLICY IF EXISTS "${policyName}" ON "${schema}"."${table}";`;
    
    // Determine the USING/WITH CHECK clause based on the pattern
    // For direct organization_id checks, use simple equality
    // For indirect checks (via foreign keys), keep the subquery but update it
    let usingClause = `organization_id = current_setting('app.current_org_id', true)::uuid`;
    
    // Check if it's an indirect policy (via foreign key)
    if (policy.includes('incident_id') || policy.includes('assignment_id') || policy.includes('business_associate_id')) {
      // Keep the subquery structure but update the organization check
      // This is more complex - we'll need to handle these separately
      usingClause = `organization_id = current_setting('app.current_org_id', true)::uuid`;
    }

    const createSQL = `CREATE POLICY "${policyName}" ON "${schema}"."${table}"
  FOR ${cmd} ${cmd === 'SELECT' || cmd === 'UPDATE' || cmd === 'DELETE' ? `USING (${usingClause})` : ''} ${cmd === 'INSERT' ? `WITH CHECK (${usingClause})` : ''};`;

    updates.push(dropSQL);
    updates.push(createSQL);
  }

  console.log('📝 Generated update statements for all policies\n');
  console.log('⚠️  Note: This is a simplified update.');
  console.log('   For complex policies (with foreign key relationships),');
  console.log('   you may need to update them manually.\n');
  console.log('💡 See docs/organizations/RLS_POLICY_UPDATE_GUIDE.md for details\n');

  // For now, just show what would be updated
  console.log('📋 Summary of policies to update:');
  processed.forEach(key => {
    const [schema, table, policyName] = key.split('.');
    console.log(`   - ${schema}.${table}.${policyName}`);
  });

  console.log('\n✅ To apply these updates, run the migration:');
  console.log('   drizzle/migrations/0067_update_compliance_rls_policies.sql');
  console.log('\n   Or update policies manually for tables that exist.');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

