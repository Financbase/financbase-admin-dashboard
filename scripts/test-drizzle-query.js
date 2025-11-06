#!/usr/bin/env node

/**
 * Test what SQL Drizzle generates for schema-qualified tables
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql, eq } = require('drizzle-orm');
const { users } = require('../lib/db/schemas/users.schema');
const { userFeedback } = require('../lib/db/schemas/marketing-analytics.schema');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const neonSql = neon(DATABASE_URL);
const db = drizzle(neonSql);

async function testQueries() {
  console.log('🧪 Testing Drizzle queries...\n');
  
  // Test 1: Direct SQL query
  console.log('Test 1: Direct SQL query to financbase.users');
  try {
    const result1 = await sql`SELECT COUNT(*) as count FROM financbase.users`;
    console.log(`✅ Direct SQL works: ${result1[0]?.count} rows\n`);
  } catch (error) {
    console.log(`❌ Direct SQL failed: ${error.message}\n`);
  }
  
  // Test 2: Drizzle query with users table
  console.log('Test 2: Drizzle query with users table');
  try {
    const result2 = await db.select({ count: sql`count(*)` }).from(users);
    console.log(`✅ Drizzle query works: ${result2[0]?.count} rows\n`);
  } catch (error) {
    console.log(`❌ Drizzle query failed: ${error.message}`);
    console.log(`   Error details:`, error);
    console.log('');
  }
  
  // Test 3: Direct SQL query to user_feedback
  console.log('Test 3: Direct SQL query to financbase.financbase_user_feedback');
  try {
    const result3 = await sql`SELECT COUNT(*) as count FROM financbase.financbase_user_feedback`;
    console.log(`✅ Direct SQL works: ${result3[0]?.count} rows\n`);
  } catch (error) {
    console.log(`❌ Direct SQL failed: ${error.message}\n`);
  }
  
  // Test 4: Drizzle query with userFeedback table
  console.log('Test 4: Drizzle query with userFeedback table');
  try {
    const result4 = await db.select({ count: sql`count(*)` }).from(userFeedback);
    console.log(`✅ Drizzle query works: ${result4[0]?.count} rows\n`);
  } catch (error) {
    console.log(`❌ Drizzle query failed: ${error.message}`);
    console.log(`   Error details:`, error);
    console.log('');
  }
  
  // Test 5: Check current search_path
  console.log('Test 5: Check current search_path');
  try {
    const searchPath = await sql`SHOW search_path`;
    console.log(`Current search_path: ${searchPath[0]?.search_path}\n`);
  } catch (error) {
    console.log(`❌ Could not check search_path: ${error.message}\n`);
  }
  
  // Test 6: Try setting search_path and querying
  console.log('Test 6: Set search_path and try querying without schema prefix');
  try {
    await sql`SET search_path TO financbase, public`;
    const result6 = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Query without schema prefix works: ${result6[0]?.count} rows\n`);
  } catch (error) {
    console.log(`❌ Query failed: ${error.message}\n`);
  }
}

testQueries().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

