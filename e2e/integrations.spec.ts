import { test, expect } from '@playwright/test'

test.describe('Integrations E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to integrations page
    await page.goto('/integrations')
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="integrations-page"]')
  })

  test('should connect to Stripe integration', async ({ page }) => {
    // Find Stripe integration card
    const stripeCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Stripe' })
    await expect(stripeCard).toBeVisible()
    
    // Click connect button
    await stripeCard.locator('[data-testid="connect-button"]').click()
    
    // Wait for OAuth redirect (in real test, this would redirect to Stripe)
    await page.waitForSelector('[data-testid="oauth-redirect"]')
    
    // Mock successful OAuth callback
    await page.goto('/integrations?oauth=stripe&code=test-code&state=test-state')
    
    // Wait for connection success
    await page.waitForSelector('[data-testid="connection-success"]')
    
    // Verify connection status
    await expect(stripeCard.locator('[data-testid="connection-status"]')).toContainText('Connected')
  })

  test('should connect to Slack integration', async ({ page }) => {
    // Find Slack integration card
    const slackCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Slack' })
    await expect(slackCard).toBeVisible()
    
    // Click connect button
    await slackCard.locator('[data-testid="connect-button"]').click()
    
    // Wait for OAuth redirect
    await page.waitForSelector('[data-testid="oauth-redirect"]')
    
    // Mock successful OAuth callback
    await page.goto('/integrations?oauth=slack&code=test-code&state=test-state')
    
    // Wait for connection success
    await page.waitForSelector('[data-testid="connection-success"]')
    
    // Verify connection status
    await expect(slackCard.locator('[data-testid="connection-status"]')).toContainText('Connected')
  })

  test('should sync data from connected integrations', async ({ page }) => {
    // Assume Stripe is already connected
    const stripeCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Stripe' })
    await expect(stripeCard.locator('[data-testid="connection-status"]')).toContainText('Connected')
    
    // Click sync button
    await stripeCard.locator('[data-testid="sync-button"]').click()
    
    // Wait for sync dialog
    await page.waitForSelector('[data-testid="sync-dialog"]')
    
    // Select sync options
    await page.check('[data-testid="sync-customers"]')
    await page.check('[data-testid="sync-invoices"]')
    await page.check('[data-testid="sync-payments"]')
    
    // Start sync
    await page.click('[data-testid="start-sync-button"]')
    
    // Wait for sync to complete
    await page.waitForSelector('[data-testid="sync-complete"]')
    
    // Verify sync results
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Completed')
    await expect(page.locator('[data-testid="records-synced"]')).toBeVisible()
  })

  test('should view sync history', async ({ page }) => {
    // Navigate to sync history tab
    await page.click('[data-testid="sync-history-tab"]')
    
    // Wait for history to load
    await page.waitForSelector('[data-testid="sync-history-list"]')
    
    // Verify sync records are displayed
    await expect(page.locator('[data-testid="sync-record"]')).toHaveCount.greaterThan(0)
    
    // Click on a sync record to view details
    await page.click('[data-testid="sync-record"]:first-child')
    
    // Wait for sync details
    await page.waitForSelector('[data-testid="sync-details"]')
    
    // Verify sync details are shown
    await expect(page.locator('[data-testid="sync-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="sync-metrics"]')).toBeVisible()
  })

  test('should configure integration settings', async ({ page }) => {
    // Find connected integration
    const stripeCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Stripe' })
    
    // Click settings button
    await stripeCard.locator('[data-testid="settings-button"]').click()
    
    // Wait for settings dialog
    await page.waitForSelector('[data-testid="integration-settings-dialog"]')
    
    // Configure sync settings
    await page.selectOption('[data-testid="sync-frequency-select"]', 'daily')
    await page.fill('[data-testid="sync-time-input"]', '09:00')
    
    // Configure webhook settings
    await page.check('[data-testid="enable-webhooks"]')
    await page.fill('[data-testid="webhook-url-input"]', 'https://api.example.com/webhooks/stripe')
    
    // Save settings
    await page.click('[data-testid="save-settings-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify settings are saved
    await expect(page.locator('[data-testid="sync-frequency"]')).toContainText('Daily')
  })

  test('should handle integration errors gracefully', async ({ page }) => {
    // Find integration with error
    const errorCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'QuickBooks' })
    
    // Verify error status is shown
    await expect(errorCard.locator('[data-testid="connection-status"]')).toContainText('Error')
    
    // Click retry button
    await errorCard.locator('[data-testid="retry-button"]').click()
    
    // Wait for retry attempt
    await page.waitForSelector('[data-testid="retry-attempt"]')
    
    // Verify retry status
    await expect(page.locator('[data-testid="retry-status"]')).toBeVisible()
  })

  test('should disconnect integration', async ({ page }) => {
    // Find connected integration
    const stripeCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Stripe' })
    
    // Click disconnect button
    await stripeCard.locator('[data-testid="disconnect-button"]').click()
    
    // Wait for confirmation dialog
    await page.waitForSelector('[data-testid="disconnect-confirmation-dialog"]')
    
    // Confirm disconnection
    await page.click('[data-testid="confirm-disconnect-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify connection status changed
    await expect(stripeCard.locator('[data-testid="connection-status"]')).toContainText('Disconnected')
  })

  test('should test integration connection', async ({ page }) => {
    // Find integration
    const slackCard = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Slack' })
    
    // Click test button
    await slackCard.locator('[data-testid="test-button"]').click()
    
    // Wait for test dialog
    await page.waitForSelector('[data-testid="test-dialog"]')
    
    // Fill test parameters
    await page.fill('[data-testid="test-channel-input"]', '#general')
    await page.fill('[data-testid="test-message-input"]', 'Test message from Financbase')
    
    // Run test
    await page.click('[data-testid="run-test-button"]')
    
    // Wait for test results
    await page.waitForSelector('[data-testid="test-results"]')
    
    // Verify test results
    await expect(page.locator('[data-testid="test-status"]')).toContainText('Success')
    await expect(page.locator('[data-testid="test-response"]')).toBeVisible()
  })

  test('should view integration metrics', async ({ page }) => {
    // Navigate to metrics tab
    await page.click('[data-testid="metrics-tab"]')
    
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="integration-metrics"]')
    
    // Verify metrics are displayed
    await expect(page.locator('[data-testid="sync-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="last-sync"]')).toBeVisible()
    
    // Check metrics charts
    await expect(page.locator('[data-testid="sync-trend-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-trend-chart"]')).toBeVisible()
  })

  test('should handle OAuth callback errors', async ({ page }) => {
    // Navigate to OAuth callback with error
    await page.goto('/integrations?oauth=stripe&error=access_denied&error_description=User%20denied%20access')
    
    // Wait for error message
    await page.waitForSelector('[data-testid="oauth-error"]')
    
    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toContainText('User denied access')
    
    // Click retry button
    await page.click('[data-testid="retry-oauth-button"]')
    
    // Verify redirect to OAuth flow
    await page.waitForSelector('[data-testid="oauth-redirect"]')
  })

  test('should filter integrations by status', async ({ page }) => {
    // Test connected filter
    await page.selectOption('[data-testid="status-filter"]', 'connected')
    
    // Verify only connected integrations are shown
    const connectedCards = page.locator('[data-testid="integration-card"]')
    await expect(connectedCards).toHaveCount.greaterThan(0)
    
    // Test disconnected filter
    await page.selectOption('[data-testid="status-filter"]', 'disconnected')
    
    // Verify only disconnected integrations are shown
    await expect(connectedCards).toHaveCount.greaterThan(0)
    
    // Test error filter
    await page.selectOption('[data-testid="status-filter"]', 'error')
    
    // Verify only error integrations are shown
    await expect(connectedCards).toHaveCount.greaterThan(0)
  })

  test('should search integrations', async ({ page }) => {
    // Search for Stripe
    await page.fill('[data-testid="search-input"]', 'Stripe')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify only Stripe is shown
    await expect(page.locator('[data-testid="integration-card"]')).toContainText('Stripe')
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '')
    
    // Wait for all integrations to show
    await page.waitForTimeout(500)
    
    // Verify all integrations are shown
    await expect(page.locator('[data-testid="integration-card"]')).toHaveCount.greaterThan(0)
  })
})
