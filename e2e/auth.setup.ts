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

	try {
		// Go to dashboard first to trigger auth redirect
		await page.goto('/dashboard');

		// Wait for either dashboard content or sign-in redirect
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Check if we're on sign-in page
		const currentUrl = page.url();
		if (currentUrl.includes('/sign-in')) {
			console.log('🔐 Authentication required, signing in...');

			// Wait for Clerk sign-in form - try multiple selectors
			const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[name*="email" i]').first();
			await emailInput.waitFor({ timeout: 15000 });

			// Fill in email
			await emailInput.fill(TEST_EMAIL);

			// Click continue/submit - try multiple selectors
			const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
			await continueButton.click();

			// Wait for password field
			const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i], input[name*="password" i]').first();
			await passwordInput.waitFor({ timeout: 10000 });
			await passwordInput.fill(TEST_PASSWORD);

			// Submit password
			const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Continue"), button[type="submit"]').first();
			await signInButton.click();

			// Wait for redirect to dashboard
			await page.waitForURL('/dashboard', { timeout: 20000 });
		}

		// Ensure user is authenticated and dashboard loads
		await expect(page.locator('h1, h2, [data-testid="dashboard"]')).toContainText('Dashboard', { timeout: 10000 });

		// Save authentication state
		await page.context().storageState({ path: authFile });
		console.log('✅ Authentication successful, state saved');

	} catch (error) {
		console.error('❌ Authentication failed:', error);
		// Take a screenshot for debugging
		await page.screenshot({ path: 'auth-failure.png' });
		throw error;
	}
});

