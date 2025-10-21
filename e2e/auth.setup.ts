import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

// Test credentials - you should set these in your environment variables
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

setup('authenticate', async ({ page }) => {
	// Skip authentication setup if credentials are not provided
	if (!process.env.TEST_USER_EMAIL) {
		console.log('⚠️  Skipping E2E authentication - no TEST_USER_EMAIL provided');
		console.log('Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables to enable E2E tests');
		return;
	}

	// Go to sign-in page
	await page.goto('/sign-in');

	// Wait for Clerk sign-in form
	await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

	// Fill in credentials
	await page.fill('input[name="identifier"]', TEST_EMAIL);
	await page.click('button[type="submit"]');

	// Wait for password field
	await page.waitForSelector('input[name="password"]', { timeout: 10000 });
	await page.fill('input[name="password"]', TEST_PASSWORD);
	await page.click('button[type="submit"]');

	// Wait until the page receives the cookies
	await page.waitForURL('/dashboard', { timeout: 15000 });

	// Ensure user is authenticated
	await expect(page.locator('text=Financial Dashboard')).toBeVisible({ timeout: 10000 });

	// Save authentication state
	await page.context().storageState({ path: authFile });
});

