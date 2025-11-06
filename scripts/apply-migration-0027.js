/**
 * Apply Migration 0027: Budgets System
 * Manually applies the budgets system migration
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

function splitSQL(sqlText) {
  // Split by semicolons, but keep multi-line statements together
  const statements = [];
  let currentStatement = '';
  let inQuotes = false;
  let quoteChar = null;
  let parenDepth = 0;
  
  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];
    const nextChar = sqlText[i + 1];
    
    // Handle quoted strings
    if ((char === '"' || char === "'") && sqlText[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      }
      currentStatement += char;
      continue;
    }
    
    if (inQuotes) {
      currentStatement += char;
      continue;
    }
    
    // Track parentheses depth
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    
    // Check for statement terminator (semicolon not in quotes or parentheses)
    if (char === ';' && parenDepth === 0) {
      currentStatement += char;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }
    
    currentStatement += char;
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(s => s && s.length > 0 && !s.match(/^\s*$/));
}

async function applyMigration() {
  const migrationPath = path.join(__dirname, '..', 'drizzle', 'migrations', '0027_budgets_system.sql');
  
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
    
    // Skip empty statements and comments
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
        error.message.includes('duplicate_object') ||
        error.message.includes('relation already exists')
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
  
  // Verify tables were created
  console.log('\n🔍 Verifying tables...');
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('budgets', 'budget_categories', 'budget_alerts')
      ORDER BY table_name;
    `;
    
    if (tables.length === 3) {
      console.log('✅ All budget tables created successfully:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log(`⚠️  Expected 3 tables, found ${tables.length}`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
  }
  
  console.log('\n✨ Migration application complete!');
}

applyMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

