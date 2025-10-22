import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for Financbase Admin Dashboard
 * 
 * These tests validate core functionality after deployment to staging/production.
 * They should run quickly and cover the most critical user flows.
 * 
 * Run with: pnpm e2e --grep "smoke"
 */

test.describe('Smoke Tests - Core Functionality', () => {
	test.beforeEach(async ({ page }) => {
    // Set a longer timeout for smoke tests as they run against deployed environments
    test.setTimeout(60000);
  });

  test('Health endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
    expect(healthData.database).toBe('connected');
  });

  test('Application loads and shows sign-in page', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to sign-in or show sign-in form
    await expect(page).toHaveURL(/.*sign.*|.*auth.*|.*login.*/);
    
    // Check for Clerk sign-in elements or custom sign-in form
    const hasClerkSignIn = await page.locator('[data-clerk-element="sign-in"]').count() > 0;
    const hasCustomSignIn = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    
    expect(hasClerkSignIn || hasCustomSignIn).toBeTruthy();
  });

  test('Dashboard loads after authentication', async ({ page }) => {
    // This test assumes you have test credentials or session state
    // You may need to implement authentication setup in beforeEach
		await page.goto('/dashboard');
    
    // Should show dashboard elements
    await expect(page.locator('h1, h2, [data-testid="dashboard-title"]')).toBeVisible();
    
    // Check for navigation elements
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
  });

  test('Client creation flow works', async ({ page }) => {
    // Navigate to clients page
		await page.goto('/dashboard/clients');

    // Click create client button
    await page.click('button:has-text("Create"), button:has-text("Add"), [data-testid="create-client"]');
    
    // Fill in client form
    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test Client');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');

			// Submit form
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    
    // Verify success (client appears in list or success message)
    await expect(page.locator('text=Test Client, text=test@example.com')).toBeVisible();
  });

  test('Invoice creation flow works', async ({ page }) => {
    // Navigate to invoices page
		await page.goto('/dashboard/invoices');

    // Click create invoice button
    await page.click('button:has-text("Create"), button:has-text("Add"), [data-testid="create-invoice"]');
    
    // Fill in invoice form
    await page.fill('input[name="client_name"], input[placeholder*="client" i]', 'Test Client');
    await page.fill('input[name="amount"], input[type="number"]', '100.00');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    
    // Verify success
    await expect(page.locator('text=Test Client, text=$100')).toBeVisible();
  });

  test('Expense creation flow works', async ({ page }) => {
    // Navigate to expenses page
		await page.goto('/dashboard/expenses');

    // Click create expense button
    await page.click('button:has-text("Create"), button:has-text("Add"), [data-testid="create-expense"]');
    
    // Fill in expense form
    await page.fill('input[name="description"], input[placeholder*="description" i]', 'Test Expense');
    await page.fill('input[name="amount"], input[type="number"]', '50.00');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    
    // Verify success
    await expect(page.locator('text=Test Expense, text=$50')).toBeVisible();
  });

  test('Payment recording works', async ({ page }) => {
    // Navigate to invoices page
    await page.goto('/dashboard/invoices');
    
    // Find an invoice and click record payment
    await page.click('button:has-text("Payment"), button:has-text("Pay"), [data-testid="record-payment"]');
    
    // Fill in payment form
    await page.fill('input[name="amount"], input[type="number"]', '100.00');
    await page.selectOption('select[name="method"], select[name="payment_method"]', 'bank_transfer');

			// Submit payment
    await page.click('button[type="submit"], button:has-text("Record"), button:has-text("Save")');
    
    // Verify payment was recorded
    await expect(page.locator('text=Payment recorded, text=Paid')).toBeVisible();
  });

  test('Expense approval works', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/dashboard/expenses');
    
    // Find an expense and click approve
    await page.click('button:has-text("Approve"), [data-testid="approve-expense"]');
    
    // Confirm approval
    await page.click('button:has-text("Confirm"), button:has-text("Yes")');
    
    // Verify expense was approved
    await expect(page.locator('text=Approved, text=Status: approved')).toBeVisible();
  });

  test('List views display data correctly', async ({ page }) => {
    // Test clients list
    await page.goto('/dashboard/clients');
    await expect(page.locator('table, [role="table"], .grid')).toBeVisible();
    
    // Test invoices list
    await page.goto('/dashboard/invoices');
    await expect(page.locator('table, [role="table"], .grid')).toBeVisible();
    
    // Test expenses list
    await page.goto('/dashboard/expenses');
    await expect(page.locator('table, [role="table"], .grid')).toBeVisible();
  });

  test('Navigation works between pages', async ({ page }) => {
    const navigationItems = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Clients', url: '/dashboard/clients' },
      { name: 'Invoices', url: '/dashboard/invoices' },
      { name: 'Expenses', url: '/dashboard/expenses' },
      { name: 'Reports', url: '/dashboard/reports' },
    ];

    for (const item of navigationItems) {
      await page.goto(item.url);
      await expect(page).toHaveURL(item.url);
      
      // Check that page loads without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('API endpoints respond correctly', async ({ page }) => {
    const apiEndpoints = [
      '/api/health',
      '/api/clients',
      '/api/invoices',
      '/api/expenses',
    ];

    for (const endpoint of apiEndpoints) {
      const response = await page.request.get(endpoint);
      
      // Should return 200 or 401 (if protected)
      expect([200, 401]).toContain(response.status());
    }
  });

  test('Error handling works gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('text=404, text=Not Found, text=Page not found')).toBeVisible();
    
    // Test invalid API endpoint
    const response = await page.request.get('/api/invalid-endpoint');
    expect([404, 401]).toContain(response.status());
  });

  test('Performance metrics are acceptable', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/dashboard');

		const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check for performance issues
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Should not have critical console errors
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Failed to load') || 
      error.includes('NetworkError') ||
      error.includes('TypeError')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Smoke Tests - Authentication', () => {
  test('Sign-in flow works', async ({ page }) => {
    await page.goto('/');
    
    // Should show sign-in form
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    
    // Fill in test credentials (adjust based on your test setup)
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'testpassword123');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('Sign-out flow works', async ({ page }) => {
    // Assuming user is already signed in
    await page.goto('/dashboard');
    
    // Click sign-out button
    await page.click('button:has-text("Sign Out"), button:has-text("Logout"), [data-testid="sign-out"]');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/.*sign.*|.*auth.*|.*login.*/);
	});
});

test.describe('Smoke Tests - Data Integrity', () => {
  test('Database connectivity is working', async ({ page }) => {
    const response = await page.request.get('/api/health');
    const healthData = await response.json();
    
    expect(healthData.database).toBe('connected');
    expect(healthData.overall).toBe('healthy');
  });

  test('CRUD operations work end-to-end', async ({ page }) => {
    // Create a client
    await page.goto('/dashboard/clients');
    await page.click('button:has-text("Create"), button:has-text("Add")');
    await page.fill('input[name="name"]', 'Smoke Test Client');
    await page.fill('input[name="email"]', 'smoke@test.com');
    await page.click('button[type="submit"]');
    
    // Verify client was created
    await expect(page.locator('text=Smoke Test Client')).toBeVisible();
    
    // Edit the client
    await page.click('button:has-text("Edit"), [data-testid="edit-client"]');
    await page.fill('input[name="name"]', 'Updated Smoke Test Client');
    await page.click('button[type="submit"]');
    
    // Verify client was updated
    await expect(page.locator('text=Updated Smoke Test Client')).toBeVisible();
    
    // Delete the client
    await page.click('button:has-text("Delete"), [data-testid="delete-client"]');
    await page.click('button:has-text("Confirm"), button:has-text("Yes")');
    
    // Verify client was deleted
    await expect(page.locator('text=Updated Smoke Test Client')).not.toBeVisible();
  });
});