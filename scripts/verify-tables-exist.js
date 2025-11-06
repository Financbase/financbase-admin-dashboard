#!/usr/bin/env node

/**
 * Verify that financbase.users and financbase.financbase_user_feedback tables exist
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifyTables() {
  console.log('🔍 Verifying tables exist...\n');
  
  try {
    // Check if financbase schema exists
    const schemaCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'financbase'
      ) as exists;
    `;
    
    console.log(`Schema 'financbase' exists: ${schemaCheck[0]?.exists ? '✅ Yes' : '❌ No'}\n`);
    
    if (!schemaCheck[0]?.exists) {
      console.log('❌ financbase schema does not exist!');
      return;
    }
    
    // Check financbase.users table
    const usersCheck = await sql`
      SELECT 
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'financbase' 
          AND table_name = 'users'
        ) as exists,
        COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_schema = 'financbase' 
      AND table_name = 'users';
    `;
    
    const usersExists = usersCheck[0]?.exists;
    const usersColumns = usersCheck[0]?.column_count || 0;
    
    console.log(`Table 'financbase.users':`);
    console.log(`  Exists: ${usersExists ? '✅ Yes' : '❌ No'}`);
    console.log(`  Columns: ${usersColumns}`);
    
    if (usersExists) {
      // List columns
      const usersColumnsList = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'financbase' 
        AND table_name = 'users'
        ORDER BY ordinal_position;
      `;
      console.log(`  Column list:`);
      usersColumnsList.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
    }
    
    console.log('');
    
    // Check financbase.financbase_user_feedback table
    const feedbackCheck = await sql`
      SELECT 
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'financbase' 
          AND table_name = 'financbase_user_feedback'
        ) as exists,
        COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_schema = 'financbase' 
      AND table_name = 'financbase_user_feedback';
    `;
    
    const feedbackExists = feedbackCheck[0]?.exists;
    const feedbackColumns = feedbackCheck[0]?.column_count || 0;
    
    console.log(`Table 'financbase.financbase_user_feedback':`);
    console.log(`  Exists: ${feedbackExists ? '✅ Yes' : '❌ No'}`);
    console.log(`  Columns: ${feedbackColumns}`);
    
    if (feedbackExists) {
      // List columns
      const feedbackColumnsList = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'financbase' 
        AND table_name = 'financbase_user_feedback'
        ORDER BY ordinal_position;
      `;
      console.log(`  Column list:`);
      feedbackColumnsList.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
    }
    
    console.log('');
    
    // Test direct query access
    console.log('🧪 Testing direct queries...\n');
    
    if (usersExists) {
      try {
        const userCount = await sql`SELECT COUNT(*) as count FROM financbase.users`;
        console.log(`✅ Can query financbase.users: ${userCount[0]?.count || 0} rows`);
      } catch (error) {
        console.log(`❌ Cannot query financbase.users: ${error.message}`);
      }
    }
    
    if (feedbackExists) {
      try {
        const feedbackCount = await sql`SELECT COUNT(*) as count FROM financbase.financbase_user_feedback`;
        console.log(`✅ Can query financbase.financbase_user_feedback: ${feedbackCount[0]?.count || 0} rows`);
      } catch (error) {
        console.log(`❌ Cannot query financbase.financbase_user_feedback: ${error.message}`);
      }
    }
    
    // Check permissions
    console.log('\n🔐 Checking permissions...\n');
    
    try {
      const permissions = await sql`
        SELECT 
          grantee, 
          privilege_type
        FROM information_schema.role_table_grants 
        WHERE table_schema = 'financbase' 
        AND table_name IN ('users', 'financbase_user_feedback')
        ORDER BY table_name, grantee;
      `;
      
      if (permissions.length > 0) {
        console.log('Table permissions:');
        permissions.forEach(perm => {
          console.log(`  ${perm.grantee}: ${perm.privilege_type}`);
        });
      } else {
        console.log('⚠️  No explicit permissions found (using default public schema permissions)');
      }
    } catch (error) {
      console.log(`⚠️  Could not check permissions: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    process.exit(1);
  }
}

verifyTables().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

