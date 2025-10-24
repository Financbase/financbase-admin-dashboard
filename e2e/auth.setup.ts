import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

// Test credentials - loaded from environment variables set in package.json scripts
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'artorstarve@gmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'zebtoB-9kuhdy-pubhim';

setup('authenticate', async ({ page }) => {
	// Skip authentication setup if credentials are not provided
	if (!process.env.TEST_USER_EMAIL) {
		console.log('⚠️  Skipping E2E authentication - no TEST_USER_EMAIL provided');
		console.log('Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables to enable E2E tests');
		return;
	}

	try {
		console.log('🔧 Setting up authentication for:', TEST_EMAIL);

		// Go to dashboard first to trigger auth redirect
		await page.goto('/dashboard');

		// Wait for either dashboard content or sign-in redirect
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Check if we're on sign-in page
		const currentUrl = page.url();
		console.log('📍 Current URL:', currentUrl);

		if (currentUrl.includes('/sign-in') || currentUrl.includes('/auth')) {
			console.log('🔐 Authentication required, signing in...');

			// Wait for Clerk sign-in form - try multiple selectors with better error handling
			try {
				// Try to find email input with multiple possible selectors
				const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[name*="email" i], [data-testid="email-input"]').first();
				await emailInput.waitFor({ timeout: 15000 });

				// Fill in email with error handling
				await emailInput.clear();
				await emailInput.fill(TEST_EMAIL);
				console.log('✅ Email filled successfully');

				// Click continue/submit - try multiple selectors with better error handling
				const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Sign in"), button[type="submit"], [data-testid="continue-button"]').first();
				await continueButton.click();
				console.log('✅ Continue button clicked');

				// Wait for password field or success
				await page.waitForTimeout(2000);

				// Check if we need password or if we're already authenticated
				const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i], input[name*="password" i], [data-testid="password-input"]').first();

				if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
					console.log('🔑 Password field found, entering password...');
					await passwordInput.fill(TEST_PASSWORD);

					// Submit password
					const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Continue"), button:has-text("Submit"), button[type="submit"], [data-testid="signin-button"]').first();
					await signInButton.click();
					console.log('✅ Password submitted');
				} else {
					console.log('✅ No password field found - may already be authenticated');
				}

				// Wait for redirect to dashboard
				await page.waitForURL(/.*dashboard.*/, { timeout: 20000 });
				console.log('✅ Redirected to dashboard');

			} catch (formError) {
				console.log('⚠️  Standard auth form not found, checking for alternative auth methods...');

				// Check if we're already on dashboard (middleware bypass)
				if (currentUrl.includes('/dashboard')) {
					console.log('✅ Dashboard loaded directly (middleware bypass active)');
				} else {
					throw formError;
				}
			}
		} else if (currentUrl.includes('/dashboard')) {
			console.log('✅ Dashboard loaded directly (middleware bypass active)');
		} else {
			console.log('⚠️  Unexpected URL, checking if authenticated...');
		}

		// Ensure user is authenticated and dashboard loads
		await expect(page.locator('h1, h2, [data-testid="dashboard"], [data-testid="dashboard-title"]')).toBeVisible({ timeout: 10000 });

		// Save authentication state
		await page.context().storageState({ path: authFile });
		console.log('✅ Authentication successful, state saved to', authFile);

	} catch (error) {
		console.error('❌ Authentication failed:', error);
		// Take a screenshot for debugging
		await page.screenshot({ path: 'test-results/auth-failure.png', fullPage: true });
		// Save page content for debugging
		const pageContent = await page.content();
		console.log('📄 Page content at failure:', pageContent.substring(0, 1000));
		throw error;
	}
});

