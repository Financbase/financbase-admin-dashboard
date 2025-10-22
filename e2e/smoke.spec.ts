import { test, expect } from '@playwright/test';

/**
 * Smoke tests for critical user flows
 * These tests validate that the core functionality works end-to-end
 */
test.describe('Smoke Tests - Core Flows', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to dashboard to ensure we're authenticated and ready for tests
		await page.goto('/dashboard');
		await expect(page.locator('text=Dashboard')).toBeVisible();
	});

	test('should complete full client lifecycle', async ({ page }) => {
		// Test 1: Create a new client
		await page.goto('/dashboard/clients');

		// Look for "Add Client" or similar button
		const addClientButton = page.locator('button:has-text("Add Client"), button:has-text("New Client"), [data-testid="add-client"]');
		if (await addClientButton.isVisible()) {
			await addClientButton.click();

			// Fill client form (adjust selectors based on actual form)
			await page.fill('input[name*="name"], input[placeholder*="name" i]', 'Test Client ABC');
			await page.fill('input[name*="email"], input[placeholder*="email" i]', 'client@example.com');
			await page.fill('input[name*="company"], input[placeholder*="company" i]', 'ABC Corporation');

			// Submit form
			const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
			await submitButton.click();

			// Verify client appears in list
			await expect(page.locator('text=Test Client ABC')).toBeVisible();
		}

		// Test 2: Verify clients list view loads
		await expect(page.locator('text=Client')).toBeVisible();
	});

	test('should complete invoice workflow', async ({ page }) => {
		// Navigate to invoices
		await page.goto('/dashboard/invoices');

		// Test 3: Create invoice (if UI allows)
		const createInvoiceButton = page.locator('button:has-text("Create Invoice"), button:has-text("New Invoice"), [data-testid="create-invoice"]');
		if (await createInvoiceButton.isVisible()) {
			await createInvoiceButton.click();

			// Fill basic invoice details
			await page.fill('input[name*="amount"], input[placeholder*="amount" i]', '1000');
			await page.fill('input[name*="description"], textarea[placeholder*="description" i]', 'Test invoice for smoke test');

			// Submit invoice
			const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
			await submitButton.click();

			// Verify invoice appears in list
			await expect(page.locator('text=$1,000.00')).toBeVisible();
		}

		// Test 4: Verify invoices list loads
		await expect(page.locator('text=Invoice')).toBeVisible();
	});

	test('should handle expense workflow', async ({ page }) => {
		// Navigate to expenses
		await page.goto('/dashboard/expenses');

		// Test 5: Create expense (if UI allows)
		const addExpenseButton = page.locator('button:has-text("Add Expense"), button:has-text("New Expense"), [data-testid="add-expense"]');
		if (await addExpenseButton.isVisible()) {
			await addExpenseButton.click();

			// Fill expense form
			await page.fill('input[name*="amount"], input[placeholder*="amount" i]', '250');
			await page.fill('input[name*="description"], textarea[placeholder*="description" i]', 'Test expense for smoke test');

			// Submit expense
			const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
			await submitButton.click();

			// Verify expense appears in list
			await expect(page.locator('text=$250.00')).toBeVisible();
		}

		// Test 6: Verify expenses list loads
		await expect(page.locator('text=Expense')).toBeVisible();
	});

	test('should validate payment recording', async ({ page }) => {
		// Navigate to payments
		await page.goto('/dashboard/payments');

		// Test 7: Record payment (if UI allows)
		const recordPaymentButton = page.locator('button:has-text("Record Payment"), button:has-text("Add Payment"), [data-testid="record-payment"]');
		if (await recordPaymentButton.isVisible()) {
			await recordPaymentButton.click();

			// Fill payment details
			await page.fill('input[name*="amount"], input[placeholder*="amount" i]', '500');

			// Submit payment
			const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Record")');
			await submitButton.click();

			// Verify payment appears in list
			await expect(page.locator('text=$500.00')).toBeVisible();
		}

		// Test 8: Verify payments list loads
		await expect(page.locator('text=Payment')).toBeVisible();
	});

	test('should validate dashboard navigation', async ({ page }) => {
		// Test 9: Verify main navigation works
		await page.goto('/dashboard');

		// Check dashboard loads
		await expect(page.locator('text=Dashboard')).toBeVisible();

		// Test navigation to different sections
		const navigationLinks = [
			{ text: 'Clients', url: '/dashboard/clients' },
			{ text: 'Invoices', url: '/dashboard/invoices' },
			{ text: 'Expenses', url: '/dashboard/expenses' },
			{ text: 'Payments', url: '/dashboard/payments' },
		];

		for (const nav of navigationLinks) {
			// Look for navigation link
			const navLink = page.locator(`a:has-text("${nav.text}"), [href*="${nav.url}"]`).first();
			if (await navLink.isVisible()) {
				await navLink.click();
				await expect(page.locator(`text=${nav.text}`)).toBeVisible();
			}
		}
	});

	test('should validate API health endpoint', async ({ page }) => {
		// Test 10: API health check
		const response = await page.request.get('/api/health');
		expect(response.ok()).toBeTruthy();

		const healthData = await response.json();
		expect(healthData.status).toBe('healthy');
		expect(healthData.database).toBe('connected');
	});
});

/**
 * Performance smoke tests
 */
test.describe('Performance Smoke Tests', () => {
	test('should load dashboard within acceptable time', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/dashboard');
		await page.waitForLoadState('networkidle');

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

		console.log(`📊 Dashboard load time: ${loadTime}ms`);
	});

	test('should respond to API calls quickly', async ({ page }) => {
		// Test API response times
		const startTime = Date.now();
		const response = await page.request.get('/api/health');
		const responseTime = Date.now() - startTime;

		expect(response.ok()).toBeTruthy();
		expect(responseTime).toBeLessThan(1000); // API should respond within 1 second

		console.log(`📊 Health API response time: ${responseTime}ms`);
	});
});
