#!/usr/bin/env node

/**
 * Apply Migration 0023: Fix Missing Columns
 * 
 * This script applies the migration SQL file to add missing columns
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Split SQL into individual statements
 * Handles DO $$ blocks as single statements
 */
function splitSQL(sqlText) {
  // Remove header comments
  let cleaned = sqlText
    .replace(/^-- Migration:.*$/gm, '')
    .replace(/^-- Created:.*$/gm, '')
    .replace(/^-- Description:.*$/gm, '')
    .replace(/^--> statement-breakpoint$/gm, '');
  
  const statements = [];
  let currentStatement = '';
  let i = 0;
  
  while (i < cleaned.length) {
    const char = cleaned[i];
    const remaining = cleaned.substring(i);
    
    // Check for DO $$ block
    if (remaining.startsWith('DO $$')) {
      // Find the matching END $$;
      const endMatch = remaining.match(/END \$\$;/);
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
  const migrationPath = path.join(__dirname, '..', 'drizzle', 'migrations', '0023_fix_missing_columns.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  console.log('📄 Reading migration file...');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('✂️  Splitting SQL into statements...');
  const statements = splitSQL(migrationSQL);
  console.log(`📝 Found ${statements.length} statements to execute`);
  
  console.log('🔄 Applying migration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip empty statements
    if (!statement.trim() || statement.trim().startsWith('--')) {
      continue;
    }
    
    try {
      await sql(statement);
      successCount++;
      const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
      console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
    } catch (error) {
      // Some errors are expected (e.g., objects that already exist)
      if (
        error.message.includes('already exists') ||
        error.message.includes('duplicate') ||
        error.message.includes('does not exist') ||
        error.message.includes('duplicate_object')
      ) {
        successCount++;
        const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
        console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists - OK)`);
      } else {
        errorCount++;
        console.error(`  ❌ [${i + 1}/${statements.length}] Error:`, error.message);
        console.error(`     Statement: ${statement.substring(0, 100)}...`);
      }
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  
  // Verify columns were added
  console.log('\n🔍 Verifying columns...');
  try {
    const priorityCheck = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND column_name = 'priority'
    `;
    
    const sidebarCheck = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_preferences' 
      AND column_name = 'sidebar_collapsed'
    `;
    
    if (priorityCheck.length > 0) {
      console.log('✅ priority column exists in notifications table');
    } else {
      console.log('⚠️  priority column not found in notifications table');
    }
    
    if (sidebarCheck.length > 0) {
      console.log('✅ sidebar_collapsed column exists in user_preferences table');
    } else {
      console.log('⚠️  sidebar_collapsed column not found in user_preferences table');
    }
  } catch (error) {
    console.error('❌ Error verifying columns:', error.message);
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Migration completed with errors. Please review.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

applyMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

