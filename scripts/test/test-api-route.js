// Test API route directly
require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

async function testAPI() {
  try {
    console.log('Testing API route logic...');
    
    const sqlClient = neon(process.env.DATABASE_URL);
    const db = drizzle(sqlClient);
    
    const userId = 'test-user';
    
    // Test the exact query from the API
    console.log('Testing count query...');
    const countResult = await db
      .select({ total: sql<number>`count(*)` })
      .from(sql`properties`)
      .where(sql`user_id = ${userId} AND is_active = true`);
    console.log('Count result:', countResult);
    
    // Test the properties query
    console.log('Testing properties query...');
    const propertiesResult = await db
      .select()
      .from(sql`properties`)
      .where(sql`user_id = ${userId} AND is_active = true`)
      .orderBy(sql`updated_at DESC`)
      .limit(50)
      .offset(0);
    console.log('Properties result:', propertiesResult);
    
    console.log('API test completed successfully');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
