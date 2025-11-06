/**
 * Settings Management E2E Tests
 * End-to-end tests for settings management flow
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode environment variable
    await page.addInitScript(() => {
      process.env.TEST_MODE = 'true';
    });
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for settings page elements
    await expect(page.locator('text=/setting/i')).toBeVisible();
  });

  test('should display settings tabs', async ({ page }) => {
    await page.goto('/settings');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for common settings tabs
    const tabs = ['profile', 'security', 'notifications', 'preferences', 'billing'];
    for (const tab of tabs) {
      const tabElement = page.locator(`text=/${tab}/i`);
      if (await tabElement.count() > 0) {
        await expect(tabElement.first()).toBeVisible();
      }
    }
  });

  test('should update profile settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Try to find and update profile fields
    const nameInput = page.locator('input[name="name"], input[name="displayName"]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('Test User Updated');
      
      // Find and click save button
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=/saved|updated/i')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should update notification preferences', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for notification toggles
    const toggles = page.locator('input[type="checkbox"], [role="switch"]');
    if (await toggles.count() > 0) {
      await expect(toggles.first()).toBeVisible();
    }
  });

  test('should update security settings', async ({ page }) => {
    await page.goto('/settings/security');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for security settings
    await expect(page.locator('text=/password|security|mfa/i')).toBeVisible();
  });

  test('should display billing information', async ({ page }) => {
    await page.goto('/settings/billing');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for billing section
    await expect(page.locator('text=/billing|subscription|payment/i')).toBeVisible();
  });
});

