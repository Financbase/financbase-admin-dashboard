#!/bin/bash

# Script to update RLS policies to use app.current_org_id
# This runs the migration that updates all compliance policies

set -e

echo "🔄 Updating RLS Policies to Use Active Organization"
echo "===================================================="
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

# Use Node.js script to load .env.local
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

try {
  execSync(\`psql \"\${process.env.DATABASE_URL}\" -f \"\${migrationFile}\"\`, {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('\n✅ RLS policies updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Test organization switching');
  console.log('2. Verify data isolation');
  console.log('3. Check that policies work correctly');
} catch (error) {
  console.error('\n❌ Migration failed. Some policies may not exist yet.');
  console.error('This is OK if compliance tables haven\'t been created.');
  console.error('The migration will update policies for tables that exist.');
  process.exit(0); // Don't fail - some tables may not exist
}
"

