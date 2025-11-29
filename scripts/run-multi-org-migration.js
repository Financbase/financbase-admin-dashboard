#!/usr/bin/env node

/**
 * Run Multi-Organization Migration
 * 
 * This script runs the multi-organization support migration using Node.js
 * which can properly load environment variables from .env.local
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MIGRATION_FILE = path.join(__dirname, '../drizzle/migrations/0065_multi_organization_support.sql');

console.log('🚀 Running Multi-Organization Support Migration');
console.log('================================================\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please ensure .env.local contains DATABASE_URL');
  process.exit(1);
}

// Check if migration file exists
if (!fs.existsSync(MIGRATION_FILE)) {
  console.error(`❌ Error: Migration file not found: ${MIGRATION_FILE}`);
  process.exit(1);
}

console.log(`📄 Migration file: ${MIGRATION_FILE}`);
console.log(`🔗 Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

// Check if psql is available
try {
  execSync('which psql', { stdio: 'ignore' });
} catch (error) {
  console.warn('⚠️  Warning: psql not found in PATH');
  console.warn('You may need to install PostgreSQL client tools or use a different method.');
  console.warn('\nAlternative: Use Drizzle Kit to push migrations:');
  console.warn('  pnpm drizzle-kit push\n');
  process.exit(1);
}

// Run the migration
console.log('🔄 Executing migration...\n');

try {
  execSync(`psql "${process.env.DATABASE_URL}" -f "${MIGRATION_FILE}"`, {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify the migration by checking your database');
  console.log('2. Update RLS policies (see docs/organizations/RLS_POLICY_UPDATE_GUIDE.md)');
  console.log('3. Test organization switching functionality');
} catch (error) {
  console.error('\n❌ Migration failed. Please check the error messages above.');
  process.exit(1);
}

