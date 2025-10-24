import { db } from './lib/db/index';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.execute('SELECT 1 as test');
    console.log('Connection successful:', result);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

testConnection().then(success => {
  console.log('Test result:', success);
  process.exit(success ? 0 : 1);
});
