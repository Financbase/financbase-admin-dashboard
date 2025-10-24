#!/usr/bin/env tsx

/**
 * Environment Variable Test Script
 * Verifies that test credentials are properly loaded
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables like the auth setup does
const result = dotenv.config({ path: path.resolve(__dirname, '.env.local') });
console.log('Dotenv result:', result);

console.log('🔍 Environment Variable Test');
console.log('============================');
console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL);
console.log('TEST_USER_PASSWORD:', process.env.TEST_USER_PASSWORD ? '[HIDDEN]' : 'undefined');
console.log('TEST_MODE:', process.env.TEST_MODE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Check all TEST_ variables
Object.keys(process.env).filter(key => key.startsWith('TEST_')).forEach(key => {
  console.log(`${key}:`, key.includes('PASSWORD') ? '[HIDDEN]' : process.env[key]);
});

console.log('\n✅ Test completed');
