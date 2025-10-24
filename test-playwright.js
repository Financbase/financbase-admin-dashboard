#!/usr/bin/env node

/**
 * Playwright Test Runner with Environment Variables
 * Loads .env.local and runs Playwright tests
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('🔧 Loading environment variables...');
console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL ? '[LOADED]' : 'undefined');
console.log('TEST_MODE:', process.env.TEST_MODE);

// Get command line arguments (everything after the script name)
const args = process.argv.slice(2);

// Run playwright with the provided arguments
const command = `npx @playwright/test ${args.join(' ')}`;
console.log('🚀 Running:', command);

try {
  execSync(command, { stdio: 'inherit' });
} catch {
  console.error('❌ Playwright test failed');
  process.exit(1);
}
