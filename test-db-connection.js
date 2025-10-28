// Test database connection and query
require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const sqlClient = neon(process.env.DATABASE_URL);
    const db = drizzle(sqlClient);
    
    // Test simple query
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('Simple query result:', result);
    
    // Test properties table
    const propertiesResult = await db.execute(sql`SELECT COUNT(*) as count FROM properties`);
    console.log('Properties count:', propertiesResult);
    
    // Test with user_id filter
    const userPropertiesResult = await db.execute(sql`SELECT COUNT(*) as count FROM properties WHERE user_id = 'test-user'`);
    console.log('User properties count:', userPropertiesResult);
    
    console.log('Database test completed successfully');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();
