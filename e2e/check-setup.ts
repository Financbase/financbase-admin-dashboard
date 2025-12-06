/**
 * Check if E2E testing environment is properly configured
 * Run: npx tsx e2e/check-setup.ts
 */

export {};

const requiredEnvVars = [
	'TEST_USER_EMAIL',
	'TEST_USER_PASSWORD',
];

const optionalEnvVars = [
	'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
	'CLERK_SECRET_KEY',
];

console.log('\n🔍 Checking E2E Test Configuration...\n');

let allConfigured = true;

// Check required variables
console.log('Required Environment Variables:');
requiredEnvVars.forEach(varName => {
	const value = process.env[varName];
	if (value) {
		console.log(`  ✅ ${varName}: ${value.slice(0, 3)}...${value.slice(-3)}`);
	} else {
		console.log(`  ❌ ${varName}: NOT SET`);
		allConfigured = false;
	}
});

// Check optional variables
console.log('\nOptional Environment Variables:');
optionalEnvVars.forEach(varName => {
	const value = process.env[varName];
	if (value) {
		console.log(`  ✅ ${varName}: ${value.slice(0, 10)}...`);
	} else {
		console.log(`  ⚠️  ${varName}: NOT SET`);
	}
});

// Check if dev server is accessible
console.log('\nServer Status:');
try {
	const response = await fetch('http://localhost:3010');
	if (response.ok) {
		console.log('  ✅ Dev server is running on port 3010');
	} else {
		console.log('  ⚠️  Dev server returned status:', response.status);
	}
} catch (error) {
	console.log('  ❌ Dev server is not accessible on port 3010');
	console.log('     Run: pnpm dev');
	allConfigured = false;
}

console.log('\n' + '='.repeat(50));

if (allConfigured) {
	console.log('✅ E2E testing is properly configured!');
	console.log('\nRun tests with: pnpm e2e');
} else {
	console.log('❌ E2E testing is not fully configured');
	console.log('\nTo fix:');
	console.log('1. Create .env.local file in project root');
	console.log('2. Add TEST_USER_EMAIL and TEST_USER_PASSWORD');
	console.log('3. Ensure dev server is running (pnpm dev)');
	console.log('\nSee e2e/README.md for detailed instructions');
}

console.log('='.repeat(50) + '\n');

process.exit(allConfigured ? 0 : 1);

