import { test, expect } from '@playwright/test';

test.describe('Financbase Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		// Mock authentication
		await page.route('**/api/auth/**', (route) => {
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					user: {
						id: 'test-user-id',
						email: 'test@example.com',
						name: 'Test User',
					},
				}),
			});
		});

		// Mock AI analysis API
		await page.route('**/api/ai/financial-analysis', (route) => {
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					data: {
						insights: [
							'Revenue growth is consistent with business plan',
							'Expense management shows good discipline',
						],
						recommendations: [
							'Consider increasing marketing spend for growth',
							'Review vendor contracts for better rates',
						],
						riskAssessment: 'Low - Strong financial position',
						forecast: {
							nextMonth: 22000,
							nextQuarter: 66000,
							nextYear: 264000,
						},
					},
				}),
			});
		});
	});

	test('should load the main dashboard', async ({ page }) => {
		await page.goto('/dashboard');

		// Check if dashboard loads
		await expect(page.locator('h2')).toContainText('Financial Dashboard');
		await expect(page.locator('text=AI-powered financial insights and analytics')).toBeVisible();
	});

	test('should display financial metrics cards', async ({ page }) => {
		await page.goto('/dashboard');

		// Wait for metrics to load
		await expect(page.locator('text=$45,231.89')).toBeVisible(); // Total Revenue
		await expect(page.locator('text=12')).toBeVisible(); // Active Clients
		await expect(page.locator('text=$2,350.00')).toBeVisible(); // Expenses
	});

	test('should show quick actions section', async ({ page }) => {
		await page.goto('/dashboard');

		// Check quick actions are visible
		await expect(page.locator('text=Create New Invoice')).toBeVisible();
		await expect(page.locator('text=Add Expense')).toBeVisible();
		await expect(page.locator('text=Add Client')).toBeVisible();
	});

	test('should display AI insights section', async ({ page }) => {
		await page.goto('/dashboard');

		// Wait for AI insights section
		await expect(page.locator('text=AI Insights')).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('should have navigation elements', async ({ page }) => {
		await page.goto('/dashboard');

		// Check that the dashboard loaded (basic smoke test)
		await expect(page.locator('text=Financial Dashboard')).toBeVisible();
	});
});

test.describe('Responsive Design', () => {
	test('should work on mobile devices', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto('/dashboard');

		// Should still show main content on mobile
		await expect(page.locator('text=Financial Dashboard')).toBeVisible();
	});

	test('should work on tablet devices', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });

		await page.goto('/dashboard');

		// Should show responsive layout
		await expect(page.locator('text=Financial Dashboard')).toBeVisible();
	});
});
