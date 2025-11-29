#!/bin/bash

# Script to update RLS policies using Neon MCP or direct SQL
# This script can be used to run the RLS policy update migration

set -e

echo "🔄 Updating RLS Policies via Neon"
echo "===================================="
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this script"
    exit 1
fi

MIGRATION_FILE="drizzle/migrations/0067_update_compliance_rls_policies.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Use Node.js to load .env.local and run via psql
node -e "
require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, '../$MIGRATION_FILE');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔄 Executing RLS policy update migration...\n');
console.log('📊 This will update 106 RLS policies to use app.current_org_id\n');

try {
  // Read and execute the migration file
  const sql = fs.readFileSync(migrationFile, 'utf8');
  
  // Execute via psql
  execSync(\`psql \"\${process.env.DATABASE_URL}\" -c \"\${sql.replace(/\$/g, '\\$')}\"\`, {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ RLS policies updated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Verify policies were updated correctly');
  console.log('2. Test organization switching');
  console.log('3. Verify data isolation');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\n💡 Note: Some tables may not exist yet - this is OK.');
  console.error('   The migration will update policies for tables that exist.');
  process.exit(1);
}
"

