/**
 * Dashboard E2E Tests
 * End-to-end tests for the Financial Dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Financial Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode environment variable
    await page.addInitScript(() => {
      process.env.TEST_MODE = 'true';
    });

    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
  });

  test('should display dashboard header and subtitle', async ({ page }) => {
    // Check for the main dashboard header
    await expect(page.locator('h2').filter({ hasText: 'Financial Dashboard' })).toBeVisible();
    await expect(page.locator('text=AI-powered financial insights and analytics')).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    // Check for quick action buttons
    await expect(page.locator('text=Create New Invoice')).toBeVisible();
    await expect(page.locator('text=Add Expense')).toBeVisible();
    await expect(page.locator('text=Add Client')).toBeVisible();
  });

  test('should display financial metrics', async ({ page }) => {
    // Check for overview stats section
    await expect(page.locator('[data-testid="overview-stats"]')).toBeVisible();
    
    // Check for stat cards
    await expect(page.locator('[data-testid="stat-card"]')).toHaveCount(4);
    
    // Check for specific values
    await expect(page.locator('text=$45,231.89')).toBeVisible();
    await expect(page.locator('text=12')).toBeVisible();
    await expect(page.locator('text=$2,350.00')).toBeVisible();
    await expect(page.locator('text=8')).toBeVisible();
  });

  test('should display AI insights section', async ({ page }) => {
    // Check for AI insights section
    await expect(page.locator('text=AI Insights')).toBeVisible();
    await expect(page.locator('text=Key Insights')).toBeVisible();
    await expect(page.locator('text=Recommendations')).toBeVisible();
    await expect(page.locator('text=Risk Assessment')).toBeVisible();
    await expect(page.locator('text=Financial Forecast')).toBeVisible();
  });

  test('should display charts section', async ({ page }) => {
    // Check for charts section
    await expect(page.locator('[data-testid="charts-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('should display recent orders section', async ({ page }) => {
    // Check for recent orders section
    await expect(page.locator('[data-testid="recent-orders"]')).toBeVisible();
  });

  test('should display top products section', async ({ page }) => {
    // Check for top products section
    await expect(page.locator('[data-testid="top-products"]')).toBeVisible();
  });

  test('should display customer analytics section', async ({ page }) => {
    // Check for customer analytics section
    await expect(page.locator('[data-testid="customer-analytics"]')).toBeVisible();
  });

  test('should display activity feed section', async ({ page }) => {
    // Check for activity feed section
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
  });

  test('should display financial overview section', async ({ page }) => {
    // Check for financial overview section
    await expect(page.locator('[data-testid="financial-overview"]')).toBeVisible();
    await expect(page.locator('text=Financial Overview')).toBeVisible();
  });

  test('should navigate to invoice creation from quick actions', async ({ page }) => {
    // Click on "Create New Invoice" button
    await page.click('text=Create New Invoice');
    
    // Should navigate to invoice creation page
    await expect(page).toHaveURL(/.*\/invoices\/new/);
  });

  test('should navigate to expense creation from quick actions', async ({ page }) => {
    // Click on "Add Expense" button
    await page.click('text=Add Expense');
    
    // Should navigate to expense creation page
    await expect(page).toHaveURL(/.*\/expenses\/new/);
  });

  test('should navigate to client creation from quick actions', async ({ page }) => {
    // Click on "Add Client" button
    await page.click('text=Add Client');
    
    // Should navigate to client creation page
    await expect(page).toHaveURL(/.*\/clients\/new/);
  });

  test('should handle loading states', async ({ page }) => {
    // Reload the page to trigger loading states
    await page.reload();
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    // Check for dashboard content
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that dashboard elements are still visible
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    await expect(page.locator('text=Create New Invoice')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that dashboard elements are still visible
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    await expect(page.locator('text=Create New Invoice')).toBeVisible();
  });
});
