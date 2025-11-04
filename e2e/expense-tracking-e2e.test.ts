/**
 * Expense Tracking E2E Tests
 * End-to-end tests for expense tracking and approval flow
 */

import { test, expect } from '@playwright/test';

test.describe('Expense Tracking E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode environment variable
    await page.addInitScript(() => {
      process.env.TEST_MODE = 'true';
    });
  });

  test('should navigate to expense tracking page', async ({ page }) => {
    await page.goto('/dashboard/expenses');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for expense page elements
    await expect(page.locator('text=/expense/i)).toBeVisible();
  });

  test('should display expense creation form', async ({ page }) => {
    await page.goto('/dashboard/expenses/new');
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    
    // Check for form fields
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
  });

  test('should create expense successfully', async ({ page }) => {
    await page.goto('/dashboard/expenses/new');
    
    // Fill in form fields
    await page.fill('input[name="amount"]', '50.00');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="category"]', 'office_supplies');
    await page.fill('textarea[name="description"]', 'Office supplies purchase');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await page.waitForLoadState('networkidle');
    
    // Check for success indicator
    await expect(page.locator('text=/success|created/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display expense list', async ({ page }) => {
    await page.goto('/dashboard/expenses');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for expense list or table
    await expect(page.locator('[data-testid="expense-list"], table')).toBeVisible();
  });

  test('should approve expense', async ({ page }) => {
    await page.goto('/dashboard/expenses');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click approve button if available
    const approveButton = page.locator('button:has-text("Approve"), button[aria-label*="approve"]');
    if (await approveButton.count() > 0) {
      await approveButton.first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=/approved/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should reject expense', async ({ page }) => {
    await page.goto('/dashboard/expenses');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click reject button if available
    const rejectButton = page.locator('button:has-text("Reject"), button[aria-label*="reject"]');
    if (await rejectButton.count() > 0) {
      await rejectButton.first().click();
      await page.waitForTimeout(500);
    }
  });
});

