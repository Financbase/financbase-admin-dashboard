#!/usr/bin/env node

/**
 * Update RLS Policies Script
 * 
 * This script helps identify and update RLS policies to use app.current_org_id
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const FIND_POLICIES_SQL = path.join(__dirname, 'find-rls-policies-to-update.sql');

console.log('🔍 Finding RLS Policies That Need Updating');
console.log('==========================================\n');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please ensure .env.local contains DATABASE_URL');
  process.exit(1);
}

// Check if psql is available
try {
  execSync('which psql', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: psql not found in PATH');
  console.error('Please install PostgreSQL client tools');
  process.exit(1);
}

console.log('📋 Querying database for policies that need updating...\n');

try {
  const result = execSync(
    `psql "${process.env.DATABASE_URL}" -f "${FIND_POLICIES_SQL}"`,
    { 
      encoding: 'utf-8',
      env: { ...process.env }
    }
  );
  
  console.log(result);
  
  if (result.includes('(0 rows)')) {
    console.log('\n✅ No policies found that need updating!');
    console.log('   Your RLS policies may already be updated or use a different pattern.');
  } else {
    console.log('\n⚠️  Found policies that need updating.');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the policies listed above');
    console.log('   2. Update each policy to use:');
    console.log('      organization_id = current_setting(\'app.current_org_id\', true)::uuid');
    console.log('   3. See docs/organizations/RLS_POLICY_UPDATE_GUIDE.md for details');
  }
} catch (error) {
  console.error('\n❌ Error querying database:', error.message);
  console.error('\nYou can manually run the SQL query from:');
  console.error(`   ${FIND_POLICIES_SQL}`);
  process.exit(1);
}

