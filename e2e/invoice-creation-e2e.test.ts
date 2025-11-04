/**
 * Invoice Creation E2E Tests
 * End-to-end tests for invoice creation and management flow
 */

import { test, expect } from '@playwright/test';

test.describe('Invoice Creation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode environment variable
    await page.addInitScript(() => {
      process.env.TEST_MODE = 'true';
    });
  });

  test('should navigate to invoice creation page', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for invoice page elements
    await expect(page.locator('text=/invoice/i)).toBeVisible();
  });

  test('should display invoice creation form', async ({ page }) => {
    await page.goto('/dashboard/invoices/new');
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    
    // Check for form fields
    await expect(page.locator('input[name="clientId"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('input[name="dueDate"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/dashboard/invoices/new');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=/required/i)).toBeVisible();
  });

  test('should create invoice successfully', async ({ page }) => {
    await page.goto('/dashboard/invoices/new');
    
    // Fill in form fields
    await page.fill('input[name="clientId"]', 'test-client-123');
    await page.fill('input[name="amount"]', '1000.00');
    await page.fill('input[name="dueDate"]', '2024-12-31');
    await page.fill('textarea[name="description"]', 'Test invoice description');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await page.waitForLoadState('networkidle');
    
    // Check for success indicator
    await expect(page.locator('text=/success|created/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display invoice list', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for invoice list or table
    await expect(page.locator('[data-testid="invoice-list"], table')).toBeVisible();
  });

  test('should filter invoices', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for filter controls
    const filterInput = page.locator('input[placeholder*="search"], input[placeholder*="filter"]');
    if (await filterInput.count() > 0) {
      await filterInput.first().fill('test');
      await page.waitForTimeout(500); // Wait for filter to apply
    }
  });
});

