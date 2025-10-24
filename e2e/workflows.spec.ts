import { test, expect } from '@playwright/test'

test.describe('Workflows E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to workflows page
    await page.goto('/workflows')
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="workflow-builder"]')
  })

  test('should create a new workflow', async ({ page }) => {
    // Click create workflow button
    await page.click('[data-testid="create-workflow-button"]')
    
    // Wait for dialog to open
    await page.waitForSelector('[data-testid="create-workflow-dialog"]')
    
    // Fill in workflow details
    await page.fill('[data-testid="workflow-name-input"]', 'Test Invoice Workflow')
    await page.fill('[data-testid="workflow-description-input"]', 'A test workflow for invoice processing')
    
    // Select trigger type
    await page.selectOption('[data-testid="trigger-type-select"]', 'manual')
    
    // Add first step
    await page.click('[data-testid="add-step-button"]')
    await page.waitForSelector('[data-testid="step-configurator"]')
    
    // Configure email step
    await page.selectOption('[data-testid="step-type-select"]', 'email')
    await page.fill('[data-testid="email-to-input"]', '{{customerEmail}}')
    await page.fill('[data-testid="email-subject-input"]', 'Invoice {{invoiceNumber}} Created')
    await page.fill('[data-testid="email-body-input"]', 'Your invoice {{invoiceNumber}} for {{amount}} has been created.')
    
    // Save step
    await page.click('[data-testid="save-step-button"]')
    
    // Add second step
    await page.click('[data-testid="add-step-button"]')
    await page.selectOption('[data-testid="step-type-select"]', 'webhook')
    await page.fill('[data-testid="webhook-url-input"]', 'https://api.example.com/invoice-created')
    await page.selectOption('[data-testid="webhook-method-select"]', 'POST')
    
    // Save step
    await page.click('[data-testid="save-step-button"]')
    
    // Save workflow
    await page.click('[data-testid="save-workflow-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify workflow appears in list
    await expect(page.locator('[data-testid="workflow-list"]')).toContainText('Test Invoice Workflow')
  })

  test('should execute a workflow', async ({ page }) => {
    // Assume workflow exists from previous test
    await page.reload()
    
    // Find and click execute button for the test workflow
    const workflowCard = page.locator('[data-testid="workflow-card"]').filter({ hasText: 'Test Invoice Workflow' })
    await workflowCard.locator('[data-testid="execute-button"]').click()
    
    // Wait for execution dialog
    await page.waitForSelector('[data-testid="execution-dialog"]')
    
    // Fill in test data
    await page.fill('[data-testid="customer-email-input"]', 'customer@example.com')
    await page.fill('[data-testid="invoice-number-input"]', 'INV-001')
    await page.fill('[data-testid="amount-input"]', '1000')
    
    // Execute workflow
    await page.click('[data-testid="execute-workflow-button"]')
    
    // Wait for execution to complete
    await page.waitForSelector('[data-testid="execution-complete"]')
    
    // Verify execution status
    await expect(page.locator('[data-testid="execution-status"]')).toContainText('Completed')
  })

  test('should test a workflow without side effects', async ({ page }) => {
    // Find and click test button for the test workflow
    const workflowCard = page.locator('[data-testid="workflow-card"]').filter({ hasText: 'Test Invoice Workflow' })
    await workflowCard.locator('[data-testid="test-button"]').click()
    
    // Wait for test dialog
    await page.waitForSelector('[data-testid="test-dialog"]')
    
    // Fill in test data
    await page.fill('[data-testid="test-customer-email-input"]', 'test@example.com')
    await page.fill('[data-testid="test-invoice-number-input"]', 'TEST-001')
    await page.fill('[data-testid="test-amount-input"]', '500')
    
    // Run test
    await page.click('[data-testid="run-test-button"]')
    
    // Wait for test results
    await page.waitForSelector('[data-testid="test-results"]')
    
    // Verify test results show dry run
    await expect(page.locator('[data-testid="test-status"]')).toContainText('Dry Run')
    await expect(page.locator('[data-testid="test-steps"]')).toBeVisible()
  })

  test('should view execution history', async ({ page }) => {
    // Navigate to execution history tab
    await page.click('[data-testid="execution-history-tab"]')
    
    // Wait for history to load
    await page.waitForSelector('[data-testid="execution-history-list"]')
    
    // Verify executions are displayed
    await expect(page.locator('[data-testid="execution-item"]')).toHaveCount.greaterThan(0)
    
    // Click on an execution to view details
    await page.click('[data-testid="execution-item"]:first-child')
    
    // Wait for execution details
    await page.waitForSelector('[data-testid="execution-details"]')
    
    // Verify execution details are shown
    await expect(page.locator('[data-testid="execution-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="execution-steps"]')).toBeVisible()
  })

  test('should use workflow templates', async ({ page }) => {
    // Navigate to templates tab
    await page.click('[data-testid="templates-tab"]')
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="templates-list"]')
    
    // Find and click on a template
    const templateCard = page.locator('[data-testid="template-card"]').filter({ hasText: 'Invoice Approval' })
    await templateCard.click()
    
    // Wait for template details
    await page.waitForSelector('[data-testid="template-details"]')
    
    // Click use template button
    await page.click('[data-testid="use-template-button"]')
    
    // Wait for workflow creation dialog
    await page.waitForSelector('[data-testid="create-workflow-dialog"]')
    
    // Verify template data is pre-filled
    await expect(page.locator('[data-testid="workflow-name-input"]')).toHaveValue('Invoice Approval')
    
    // Customize the workflow
    await page.fill('[data-testid="workflow-name-input"]', 'Custom Invoice Approval')
    
    // Save the customized workflow
    await page.click('[data-testid="save-workflow-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify customized workflow appears in list
    await expect(page.locator('[data-testid="workflow-list"]')).toContainText('Custom Invoice Approval')
  })

  test('should handle workflow errors gracefully', async ({ page }) => {
    // Create a workflow with invalid configuration
    await page.click('[data-testid="create-workflow-button"]')
    await page.waitForSelector('[data-testid="create-workflow-dialog"]')
    
    // Fill in workflow details
    await page.fill('[data-testid="workflow-name-input"]', 'Error Test Workflow')
    await page.fill('[data-testid="workflow-description-input"]', 'A workflow that will cause errors')
    
    // Add an invalid email step
    await page.click('[data-testid="add-step-button"]')
    await page.selectOption('[data-testid="step-type-select"]', 'email')
    await page.fill('[data-testid="email-to-input"]', 'invalid-email') // Invalid email format
    await page.fill('[data-testid="email-subject-input"]', 'Test')
    await page.fill('[data-testid="email-body-input"]', 'Test body')
    
    // Try to save step
    await page.click('[data-testid="save-step-button"]')
    
    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email format')
  })

  test('should filter and search workflows', async ({ page }) => {
    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'active')
    await page.waitForSelector('[data-testid="workflow-list"]')
    
    // Verify only active workflows are shown
    const workflowCards = page.locator('[data-testid="workflow-card"]')
    await expect(workflowCards).toHaveCount.greaterThan(0)
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'Invoice')
    await page.waitForTimeout(500) // Wait for search to process
    
    // Verify only matching workflows are shown
    await expect(page.locator('[data-testid="workflow-card"]')).toContainText('Invoice')
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '')
    await page.waitForTimeout(500)
    
    // Verify all workflows are shown again
    await expect(page.locator('[data-testid="workflow-card"]')).toHaveCount.greaterThan(0)
  })

  test('should edit existing workflow', async ({ page }) => {
    // Find and click edit button for the test workflow
    const workflowCard = page.locator('[data-testid="workflow-card"]').filter({ hasText: 'Test Invoice Workflow' })
    await workflowCard.locator('[data-testid="edit-button"]').click()
    
    // Wait for edit dialog
    await page.waitForSelector('[data-testid="edit-workflow-dialog"]')
    
    // Modify workflow name
    await page.fill('[data-testid="workflow-name-input"]', 'Updated Test Invoice Workflow')
    
    // Add a new step
    await page.click('[data-testid="add-step-button"]')
    await page.selectOption('[data-testid="step-type-select"]', 'email')
    await page.fill('[data-testid="email-to-input"]', 'admin@example.com')
    await page.fill('[data-testid="email-subject-input"]', 'Invoice Notification')
    await page.fill('[data-testid="email-body-input"]', 'A new invoice has been processed.')
    
    // Save step
    await page.click('[data-testid="save-step-button"]')
    
    // Save workflow
    await page.click('[data-testid="save-workflow-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify updated workflow appears in list
    await expect(page.locator('[data-testid="workflow-list"]')).toContainText('Updated Test Invoice Workflow')
  })

  test('should delete workflow', async ({ page }) => {
    // Find and click delete button for the test workflow
    const workflowCard = page.locator('[data-testid="workflow-card"]').filter({ hasText: 'Updated Test Invoice Workflow' })
    await workflowCard.locator('[data-testid="delete-button"]').click()
    
    // Wait for confirmation dialog
    await page.waitForSelector('[data-testid="delete-confirmation-dialog"]')
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]')
    
    // Verify workflow is removed from list
    await expect(page.locator('[data-testid="workflow-list"]')).not.toContainText('Updated Test Invoice Workflow')
  })
})
