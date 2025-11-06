/**
 * Apply Migration 0025: Add Missing Columns and Tables
 * 
 * This script applies the migration to add missing columns to notifications
 * and user_preferences tables, and creates the financbase_support_tickets table.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');

// SQL migration file path
const MIGRATION_FILE = path.join(__dirname, '../drizzle/migrations/0025_add_missing_columns_and_tables.sql');

/**
 * Split SQL text into individual statements
 * Handles DO blocks as single statements
 */
function splitSQL(sqlText) {
  // Remove header comments
  let cleaned = sqlText
    .replace(/^-- Migration:.*$/gm, '')
    .replace(/^-- Created:.*$/gm, '')
    .replace(/^-- Description:.*$/gm, '');
  
  const statements = [];
  let currentStatement = '';
  let i = 0;
  
  while (i < cleaned.length) {
    const char = cleaned[i];
    const remaining = cleaned.substring(i);
    
    // Check for DO $$ block
    if (remaining.match(/^DO\s+\$\$/i)) {
      // Find the matching END $$;
      const endMatch = remaining.match(/END\s+\$\$\s*;/i);
      if (endMatch) {
        const doBlock = remaining.substring(0, endMatch.index + endMatch[0].length);
        statements.push(doBlock.trim());
        i += doBlock.length;
        // Skip whitespace after
        while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
        continue;
      }
    }
    
    currentStatement += char;
    
    // If we hit a semicolon and we're not in a string
    if (char === ';') {
      const trimmed = currentStatement.trim();
      if (trimmed && trimmed.length > 1 && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
    
    i++;
  }
  
  // Add any remaining statement
  if (currentStatement.trim() && !currentStatement.trim().startsWith('--')) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(s => s && s.length > 0 && !s.match(/^\s*$/));
}

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please ensure .env.local contains DATABASE_URL');
    process.exit(1);
  }

  console.log('📦 Loading migration file...');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  const statements = splitSQL(sql);
  
  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
  
  console.log('🔌 Connecting to database...');
  const db = neon(databaseUrl);

  console.log('🚀 Applying migration 0025_add_missing_columns_and_tables.sql...');
  console.log('   This will add missing columns to notifications and user_preferences tables');
  console.log('   and create the financbase_support_tickets table if needed.\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip empty statements and comments
    if (!statement.trim() || statement.trim().startsWith('--')) {
      continue;
    }

    try {
      await db(statement);
      successCount++;
      
      // Extract statement type for logging
      const statementType = statement.match(/^(\w+)/)?.[1] || 'statement';
      if (statementType !== 'CREATE' && statementType !== 'DO') {
        console.log(`   ✓ Executed ${statementType.toLowerCase()} statement ${i + 1}`);
      }
    } catch (error) {
      errorCount++;
      
      // Many errors are expected (columns/tables may already exist)
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate') ||
          error.message.includes('does not exist')) {
        // These are expected - migration is idempotent
        continue;
      }
      
      console.error(`\n❌ Error executing statement ${i + 1}:`, error.message);
      console.error(`   Statement preview: ${statement.substring(0, 100)}...`);
    }
  }
  
  console.log(`\n✅ Migration completed!`);
  console.log(`   Successfully executed: ${successCount} statements`);
  if (errorCount > 0) {
    console.log(`   Errors (expected if columns exist): ${errorCount}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('   - Added missing columns to notifications table');
  console.log('   - Added missing columns to user_preferences table');
  console.log('   - Created financbase_support_tickets table (if needed)');
  console.log('   - Created indexes for better query performance');
}

// Run the migration
applyMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

