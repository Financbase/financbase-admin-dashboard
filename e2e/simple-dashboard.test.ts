/**
 * Simple Dashboard Test
 * Basic test to check if dashboard loads
 */

import { test, expect } from '@playwright/test';

test.describe('Simple Dashboard Test', () => {
  test('should load dashboard page', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/dashboard-debug.png' });
    
    // Check if the page title contains "Financial Dashboard"
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
  });

  test('should show page content', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for any content on the page
    const bodyText = await page.textContent('body');
    console.log('Page content:', bodyText);
    
    // Check if there's any content
    expect(bodyText).toBeTruthy();
  });
});
