#!/usr/bin/env node

/**
 * Playwright Test Runner with Environment Variables
 * Loads .env.local and runs Playwright tests
 * 
 * Security: Uses spawn instead of execSync to prevent command injection
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('🔧 Loading environment variables...');
console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL ? '[LOADED]' : 'undefined');
console.log('TEST_MODE:', process.env.TEST_MODE);

// Security: Allowed Playwright test arguments (whitelist approach)
const ALLOWED_ARGS = [
	'--ui',
	'--headed',
	'--project',
	'--grep',
	'--timeout',
	'--workers',
	'--reporter',
	'--output',
	'--update-snapshots',
	'--config',
	'--list',
	'--help',
	'--version',
];

// Get command line arguments (everything after the script name)
const rawArgs = process.argv.slice(2);

// Security: Validate and filter arguments to prevent command injection
const args = rawArgs.filter(arg => {
	// Allow arguments that start with allowed flags
	if (ALLOWED_ARGS.some(allowed => arg.startsWith(allowed))) {
		return true;
	}
	// Allow argument values (strings after flags)
	// Check if previous arg was an allowed flag
	const argIndex = rawArgs.indexOf(arg);
	if (argIndex > 0) {
		const prevArg = rawArgs[argIndex - 1];
		if (ALLOWED_ARGS.some(allowed => prevArg.startsWith(allowed))) {
			// Validate value doesn't contain shell metacharacters
			return !/[$`|;&<>]/.test(arg);
		}
	}
	// Block everything else
	console.warn(`⚠️  Blocked potentially unsafe argument: ${arg}`);
	return false;
});

// Run playwright with validated arguments
console.log('🚀 Running: npx @playwright/test', args.join(' '));

const child = spawn('npx', ['@playwright/test', ...args], {
	stdio: 'inherit',
	shell: false, // Disable shell to prevent command injection
});

child.on('error', (error) => {
	console.error('❌ Failed to start Playwright:', error.message);
	process.exit(1);
});

child.on('exit', (code) => {
	if (code !== 0) {
		console.error('❌ Playwright test failed');
		process.exit(code || 1);
	}
});
