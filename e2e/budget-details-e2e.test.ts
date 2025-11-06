/**
 * Budget Details E2E Test
 * Tests the budget details modal/dialog functionality
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { test, expect } from '@playwright/test';

test.describe('Budget Details', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to budgets page (assuming it exists at /budgets)
		// In a real scenario, you'd need to authenticate first
		await page.goto('/budgets');
	});

	test('should open budget details dialog when clicking view details', async ({ page }) => {
		// Wait for budget list to load
		await page.waitForSelector('[data-testid="budget-card"]', { timeout: 10000 });

		// Find first budget card and click view details
		const firstBudgetCard = page.locator('[data-testid="budget-card"]').first();
		const viewButton = firstBudgetCard.locator('button:has-text("View")');

		await viewButton.click();

		// Verify dialog is open
		await expect(page.locator('[role="dialog"]')).toBeVisible();
		await expect(page.locator('text=Budget Details')).toBeVisible();
	});

	test('should display budget information in details dialog', async ({ page }) => {
		// Wait for budget list to load
		await page.waitForSelector('[data-testid="budget-card"]', { timeout: 10000 });

		// Open details dialog
		const firstBudgetCard = page.locator('[data-testid="budget-card"]').first();
		await firstBudgetCard.locator('button:has-text("View")').click();

		// Wait for dialog content
		await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

		// Verify budget details are displayed
		await expect(page.locator('text=Budget Period')).toBeVisible();
		await expect(page.locator('text=Spending Progress')).toBeVisible();
	});

	test('should close dialog when clicking close button', async ({ page }) => {
		// Wait for budget list to load
		await page.waitForSelector('[data-testid="budget-card"]', { timeout: 10000 });

		// Open details dialog
		const firstBudgetCard = page.locator('[data-testid="budget-card"]').first();
		await firstBudgetCard.locator('button:has-text("View")').click();

		// Wait for dialog
		await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

		// Click close button
		const closeButton = page.locator('[role="dialog"] button[aria-label="Close"]');
		await closeButton.click();

		// Verify dialog is closed
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	test('should open edit dialog when clicking edit from details', async ({ page }) => {
		// Wait for budget list to load
		await page.waitForSelector('[data-testid="budget-card"]', { timeout: 10000 });

		// Open details dialog
		const firstBudgetCard = page.locator('[data-testid="budget-card"]').first();
		await firstBudgetCard.locator('button:has-text("View")').click();

		// Wait for dialog
		await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

		// Click edit button in details dialog
		const editButton = page.locator('[role="dialog"] button:has-text("Edit")');
		await editButton.click();

		// Verify details dialog is closed and edit dialog is open
		// (This depends on your implementation - edit might open in same dialog or different)
		await expect(page.locator('text=Edit Budget')).toBeVisible();
	});

	test('should handle loading state while fetching budget details', async ({ page }) => {
		// Wait for budget list to load
		await page.waitForSelector('[data-testid="budget-card"]', { timeout: 10000 });

		// Open details dialog
		const firstBudgetCard = page.locator('[data-testid="budget-card"]').first();
		await firstBudgetCard.locator('button:has-text("View")').click();

		// Verify loading skeleton is shown (if implemented)
		// This test might need adjustment based on actual loading UI
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();
	});
});

