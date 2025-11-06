#!/usr/bin/env node

/**
 * Script to apply HR & People Management migrations
 * This script executes all HR-related migration files in order
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL environment variable is required');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

// Migration files in order
const migrations = [
	'0028_hr_contractors.sql',
	'0029_payroll_system.sql',
	'0030_leave_management.sql',
	'0031_attendance_system.sql',
	'0032_hr_database_functions.sql',
	'0033_enhance_employees_time_tracking.sql',
];

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
  let inQuotes = false;
  let quoteChar = null;
  let parenDepth = 0;
  let dollarTag = null;
  
  while (i < cleaned.length) {
    const char = cleaned[i];
    const remaining = cleaned.substring(i);
    
    // Check for dollar-quoted strings ($$...$$)
    if (!inQuotes && remaining.match(/^\$\$[^$]*/)) {
      const dollarMatch = remaining.match(/^(\$\$[a-zA-Z_]*\$\$)/);
      if (dollarMatch) {
        dollarTag = dollarMatch[1];
        i += dollarTag.length;
        currentStatement += dollarTag;
        inQuotes = true;
        continue;
      }
    }
    
    if (inQuotes && dollarTag && remaining.startsWith(dollarTag)) {
      currentStatement += dollarTag;
      i += dollarTag.length;
      dollarTag = null;
      inQuotes = false;
      continue;
    }
    
    // Check for CREATE FUNCTION or CREATE OR REPLACE FUNCTION
    if (!inQuotes && remaining.match(/^CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i)) {
      // Find the function body - it ends with $$ LANGUAGE plpgsql;
      const funcMatch = remaining.match(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION[\s\S]*?(\$\$[\s\S]*?\$\$)\s+LANGUAGE\s+plpgsql;/i);
      if (funcMatch) {
        statements.push(funcMatch[0].trim());
        i += funcMatch[0].length;
        currentStatement = '';
        continue;
      }
    }
    
    // Check for DO $$ block
    if (!inQuotes && remaining.startsWith('DO $$')) {
      const endMatch = remaining.match(/END \$\$;/);
      if (endMatch) {
        const doBlock = remaining.substring(0, endMatch.index + endMatch[0].length);
        statements.push(doBlock.trim());
        i += doBlock.length;
        currentStatement = '';
        continue;
      }
    }
    
    // Track parentheses
    if (!inQuotes) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    
    // Track quotes
    if (!dollarTag && (char === '"' || char === "'")) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && cleaned[i-1] !== '\\') {
        inQuotes = false;
        quoteChar = null;
      }
    }
    
    currentStatement += char;
    
    // Statement terminator (semicolon when not in quotes and not in function body)
    if (!inQuotes && char === ';' && parenDepth === 0) {
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
    
    i++;
  }
  
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(s => s && s.length > 0 && !s.match(/^\s*$/));
}

async function applyMigration() {
  console.log('🚀 Starting HR & People Management migrations...\n');

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const migrationFile of migrations) {
    const migrationPath = path.join(__dirname, '..', 'drizzle', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      continue;
    }
    
    try {
      console.log(`📄 Reading ${migrationFile}...`);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('✂️  Splitting SQL into statements...');
      const statements = splitSQL(migrationSQL);
      console.log(`📝 Found ${statements.length} statements to execute\n`);
      
      console.log('🔄 Applying migration...\n');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        // Skip empty statements and comments
        if (!statement.trim() || statement.trim().startsWith('--')) {
          continue;
        }
        
        try {
          await sql(statement);
          successCount++;
          totalSuccess++;
          const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
          console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
        } catch (error) {
          // Some errors are expected (e.g., objects that already exist)
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('does not exist') ||
            error.message.includes('duplicate_object') ||
            error.message.includes('relation already exists')
          ) {
            successCount++;
            totalSuccess++;
            const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
            console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists - OK)`);
          } else {
            errorCount++;
            totalErrors++;
            console.error(`  ❌ [${i + 1}/${statements.length}] Error:`, error.message);
            console.error(`     Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
      
      console.log(`\n📊 ${migrationFile} Summary:`);
      console.log(`  ✅ Successful: ${successCount}`);
      console.log(`  ❌ Errors: ${errorCount}\n`);
      
    } catch (error) {
      console.error(`  ❌ Failed to apply ${migrationFile}:`, error.message);
      totalErrors++;
    }
  }
  
  console.log('\n📊 Overall Migration Summary:');
  console.log(`  ✅ Total Successful: ${totalSuccess}`);
  console.log(`  ❌ Total Errors: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('\n✅ All HR migrations applied successfully!');
  } else {
    console.log('\n⚠️  Some migrations had errors. Please review the output above.');
  }
}

applyMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

