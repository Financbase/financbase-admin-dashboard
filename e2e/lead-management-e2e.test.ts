/**
 * Lead Management E2E Tests
 * End-to-end tests for lead management user workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Lead Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the lead management page
    await page.goto('/leads');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="leads-page"]');
  });

  test('should create a new lead', async ({ page }) => {
    // Click the "New Lead" button
    await page.click('[data-testid="new-lead-button"]');
    
    // Wait for the modal to open
    await page.waitForSelector('[data-testid="lead-form-modal"]');
    
    // Fill in the lead form
    await page.fill('[data-testid="lead-first-name"]', 'John');
    await page.fill('[data-testid="lead-last-name"]', 'Doe');
    await page.fill('[data-testid="lead-email"]', 'john@example.com');
    await page.fill('[data-testid="lead-company"]', 'Test Company');
    await page.selectOption('[data-testid="lead-source"]', 'website');
    await page.selectOption('[data-testid="lead-priority"]', 'high');
    await page.fill('[data-testid="lead-estimated-value"]', '10000');
    await page.fill('[data-testid="lead-notes"]', 'Initial lead from website contact form');
    
    // Submit the form
    await page.click('[data-testid="submit-lead-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify the lead appears in the list
    await expect(page.locator('[data-testid="lead-item"]').first()).toContainText('John Doe');
    await expect(page.locator('[data-testid="lead-item"]').first()).toContainText('Test Company');
  });

  test('should update lead status', async ({ page }) => {
    // Find the first lead in the list
    const leadItem = page.locator('[data-testid="lead-item"]').first();
    
    // Click on the lead to open details
    await leadItem.click();
    
    // Wait for lead details modal
    await page.waitForSelector('[data-testid="lead-details-modal"]');
    
    // Update the status
    await page.selectOption('[data-testid="lead-status-select"]', 'qualified');
    await page.fill('[data-testid="lead-status-notes"]', 'Lead qualified after initial call');
    
    // Save the changes
    await page.click('[data-testid="save-lead-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify the status was updated
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('qualified');
  });

  test('should add lead activity', async ({ page }) => {
    // Find the first lead in the list
    const leadItem = page.locator('[data-testid="lead-item"]').first();
    
    // Click on the lead to open details
    await leadItem.click();
    
    // Wait for lead details modal
    await page.waitForSelector('[data-testid="lead-details-modal"]');
    
    // Navigate to activities tab
    await page.click('[data-testid="activities-tab"]');
    
    // Click "Add Activity" button
    await page.click('[data-testid="add-activity-button"]');
    
    // Wait for activity form
    await page.waitForSelector('[data-testid="activity-form"]');
    
    // Fill in the activity form
    await page.selectOption('[data-testid="activity-type"]', 'call');
    await page.fill('[data-testid="activity-subject"]', 'Initial call with lead');
    await page.fill('[data-testid="activity-description"]', 'Discussed project requirements and timeline');
    await page.selectOption('[data-testid="activity-outcome"]', 'positive');
    await page.fill('[data-testid="activity-next-steps"]', 'Send proposal and follow up in 2 days');
    
    // Submit the activity
    await page.click('[data-testid="submit-activity-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify the activity appears in the list
    await expect(page.locator('[data-testid="activity-item"]').first()).toContainText('Initial call with lead');
  });

  test('should create lead task', async ({ page }) => {
    // Find the first lead in the list
    const leadItem = page.locator('[data-testid="lead-item"]').first();
    
    // Click on the lead to open details
    await leadItem.click();
    
    // Wait for lead details modal
    await page.waitForSelector('[data-testid="lead-details-modal"]');
    
    // Navigate to tasks tab
    await page.click('[data-testid="tasks-tab"]');
    
    // Click "Add Task" button
    await page.click('[data-testid="add-task-button"]');
    
    // Wait for task form
    await page.waitForSelector('[data-testid="task-form"]');
    
    // Fill in the task form
    await page.fill('[data-testid="task-title"]', 'Follow up with lead');
    await page.fill('[data-testid="task-description"]', 'Call lead to discuss proposal and answer questions');
    await page.selectOption('[data-testid="task-priority"]', 'high');
    await page.fill('[data-testid="task-due-date"]', '2024-12-31');
    
    // Submit the task
    await page.click('[data-testid="submit-task-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify the task appears in the list
    await expect(page.locator('[data-testid="task-item"]').first()).toContainText('Follow up with lead');
  });

  test('should convert lead to client', async ({ page }) => {
    // Find the first lead in the list
    const leadItem = page.locator('[data-testid="lead-item"]').first();
    
    // Click on the lead to open details
    await leadItem.click();
    
    // Wait for lead details modal
    await page.waitForSelector('[data-testid="lead-details-modal"]');
    
    // Click "Convert to Client" button
    await page.click('[data-testid="convert-lead-button"]');
    
    // Wait for conversion modal
    await page.waitForSelector('[data-testid="convert-lead-modal"]');
    
    // Fill in client details
    await page.fill('[data-testid="client-company-name"]', 'Test Company');
    await page.fill('[data-testid="client-contact-name"]', 'John Doe');
    await page.fill('[data-testid="client-email"]', 'john@testcompany.com');
    await page.fill('[data-testid="client-phone"]', '+1234567890');
    await page.selectOption('[data-testid="client-currency"]', 'USD');
    await page.selectOption('[data-testid="client-payment-terms"]', 'net30');
    
    // Submit the conversion
    await page.click('[data-testid="submit-conversion-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify the lead status changed to "converted"
    await expect(page.locator('[data-testid="lead-status"]')).toContainText('converted');
  });

  test('should filter and search leads', async ({ page }) => {
    // Test search functionality
    await page.fill('[data-testid="lead-search-input"]', 'John');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="lead-item"]');
    
    // Verify search results
    const leadItems = page.locator('[data-testid="lead-item"]');
    await expect(leadItems).toHaveCount(1);
    await expect(leadItems.first()).toContainText('John');
    
    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'new');
    await page.click('[data-testid="apply-filters-button"]');
    
    // Wait for filtered results
    await page.waitForSelector('[data-testid="lead-item"]');
    
    // Verify filtered results
    const filteredItems = page.locator('[data-testid="lead-item"]');
    await expect(filteredItems.first()).toContainText('new');
    
    // Test source filter
    await page.selectOption('[data-testid="source-filter"]', 'website');
    await page.click('[data-testid="apply-filters-button"]');
    
    // Wait for filtered results
    await page.waitForSelector('[data-testid="lead-item"]');
    
    // Verify source filter
    const sourceFilteredItems = page.locator('[data-testid="lead-item"]');
    await expect(sourceFilteredItems.first()).toContainText('website');
  });

  test('should view lead analytics', async ({ page }) => {
    // Navigate to analytics tab
    await page.click('[data-testid="analytics-tab"]');
    
    // Wait for analytics to load
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // Verify key metrics are displayed
    await expect(page.locator('[data-testid="total-leads-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-value-metric"]')).toBeVisible();
    
    // Verify charts are rendered
    await expect(page.locator('[data-testid="leads-by-status-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="leads-by-source-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="pipeline-chart"]')).toBeVisible();
    
    // Test date range filter
    await page.click('[data-testid="date-range-picker"]');
    await page.selectOption('[data-testid="date-range-select"]', 'last-30-days');
    await page.click('[data-testid="apply-date-filter"]');
    
    // Wait for updated analytics
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // Verify analytics updated
    await expect(page.locator('[data-testid="total-leads-metric"]')).toBeVisible();
  });

  test('should handle lead bulk operations', async ({ page }) => {
    // Select multiple leads
    await page.check('[data-testid="lead-checkbox-1"]');
    await page.check('[data-testid="lead-checkbox-2"]');
    
    // Click bulk actions dropdown
    await page.click('[data-testid="bulk-actions-dropdown"]');
    
    // Select bulk action
    await page.click('[data-testid="bulk-update-status"]');
    
    // Wait for bulk update modal
    await page.waitForSelector('[data-testid="bulk-update-modal"]');
    
    // Select new status
    await page.selectOption('[data-testid="bulk-status-select"]', 'qualified');
    await page.fill('[data-testid="bulk-status-notes"]', 'Bulk update to qualified status');
    
    // Submit bulk update
    await page.click('[data-testid="submit-bulk-update"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Verify leads were updated
    const updatedLeads = page.locator('[data-testid="lead-item"]');
    await expect(updatedLeads.first()).toContainText('qualified');
  });

  test('should export leads data', async ({ page }) => {
    // Click export button
    await page.click('[data-testid="export-leads-button"]');
    
    // Wait for export modal
    await page.waitForSelector('[data-testid="export-modal"]');
    
    // Select export format
    await page.selectOption('[data-testid="export-format"]', 'csv');
    
    // Select date range
    await page.selectOption('[data-testid="export-date-range"]', 'last-30-days');
    
    // Start export
    await page.click('[data-testid="start-export-button"]');
    
    // Wait for export to complete
    await page.waitForSelector('[data-testid="export-complete"]');
    
    // Verify download link is available
    await expect(page.locator('[data-testid="download-link"]')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/leads', route => route.abort());
    
    // Try to load leads
    await page.reload();
    
    // Wait for error state
    await page.waitForSelector('[data-testid="error-state"]');
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load leads');
    
    // Test retry functionality
    await page.click('[data-testid="retry-button"]');
    
    // Restore network
    await page.unroute('**/api/leads');
    
    // Wait for successful load
    await page.waitForSelector('[data-testid="leads-page"]');
    
    // Verify leads are loaded
    await expect(page.locator('[data-testid="lead-item"]')).toBeVisible();
  });
});
