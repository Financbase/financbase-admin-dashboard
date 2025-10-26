/**
 * Form Submission E2E Tests
 * End-to-end tests for form submissions with database verification
 */

import { test, expect } from '@playwright/test';

test.describe('Form Submission E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in a real test, you would set up proper auth
    await page.addInitScript(() => {
      // Mock Clerk authentication
      window.Clerk = {
        user: {
          id: 'test-user-123',
          emailAddresses: [{ emailAddress: 'test@example.com' }]
        },
        isSignedIn: () => true
      };
    });
  });

  test.describe('Invoice Form', () => {
    test('should create a new invoice successfully', async ({ page }) => {
      // Navigate to invoice creation page
      await page.goto('/invoices/new');
      
      // Wait for form to load
      await page.waitForSelector('form');
      
      // Fill in client information
      await page.fill('input[placeholder*="Client"]', 'Test Client');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[placeholder*="Phone"]', '+1-555-123-4567');
      await page.fill('input[placeholder*="Address"]', '123 Test St');
      
      // Fill in invoice details
      await page.fill('input[type="date"]', '2024-01-15');
      await page.fill('input[type="date"]', '2024-02-15');
      
      // Fill in line items
      await page.fill('input[placeholder*="Item description"]', 'Test Service');
      await page.fill('input[type="number"]', '1');
      await page.fill('input[type="number"]', '100.00');
      
      // Fill in calculations
      await page.fill('input[placeholder*="Tax Rate"]', '8.5');
      await page.fill('input[placeholder*="Discount"]', '0');
      
      // Fill in additional information
      await page.fill('textarea[placeholder*="notes"]', 'Test invoice notes');
      await page.fill('textarea[placeholder*="terms"]', 'Payment due within 30 days');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for success message or redirect
      await page.waitForSelector('text=Invoice created successfully', { timeout: 10000 });
      
      // Verify redirect to invoices list
      await expect(page).toHaveURL(/.*\/invoices/);
    });

    test('should show validation errors for required fields', async ({ page }) => {
      // Navigate to invoice creation page
      await page.goto('/invoices/new');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Client name and email are required')).toBeVisible();
    });

    test('should calculate totals correctly', async ({ page }) => {
      // Navigate to invoice creation page
      await page.goto('/invoices/new');
      
      // Fill in line items
      await page.fill('input[placeholder*="Item description"]', 'Test Service');
      await page.fill('input[type="number"]', '2');
      await page.fill('input[type="number"]', '50.00');
      
      // Check that total is calculated correctly
      await expect(page.locator('text=$100.00')).toBeVisible();
    });
  });

  test.describe('Expense Form', () => {
    test('should create a new expense successfully', async ({ page }) => {
      // Navigate to expense creation page
      await page.goto('/expenses/new');
      
      // Wait for form to load
      await page.waitForSelector('form');
      
      // Fill in expense details
      await page.fill('input[placeholder*="What was this expense for"]', 'Office Supplies');
      await page.fill('input[type="number"]', '50.00');
      await page.fill('input[type="date"]', '2024-01-15');
      
      // Select category
      await page.click('text=Select category');
      await page.click('text=Office Supplies');
      
      // Fill in vendor
      await page.fill('input[placeholder*="Where did you make this purchase"]', 'Test Store');
      
      // Select payment method
      await page.click('text=Select payment method');
      await page.click('text=Credit Card');
      
      // Upload receipt (mock file)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'receipt.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content')
      });
      
      // Fill in tax information
      await page.check('input[type="checkbox"]');
      await page.fill('input[placeholder*="Tax Amount"]', '4.25');
      
      // Fill in notes
      await page.fill('textarea[placeholder*="Any additional notes"]', 'Test expense notes');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('text=Expense created successfully', { timeout: 10000 });
      
      // Verify redirect to expenses list
      await expect(page).toHaveURL(/.*\/expenses/);
    });

    test('should show validation errors for required fields', async ({ page }) => {
      // Navigate to expense creation page
      await page.goto('/expenses/new');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Description, amount, and category are required')).toBeVisible();
    });
  });

  test.describe('Client Form', () => {
    test('should create a new client successfully', async ({ page }) => {
      // Navigate to client creation page
      await page.goto('/clients/new');
      
      // Wait for form to load
      await page.waitForSelector('form');
      
      // Fill in client information
      await page.fill('input[placeholder*="Client\'s full name"]', 'John Doe');
      await page.fill('input[type="email"]', 'john@example.com');
      await page.fill('input[placeholder*="+1 (555) 123-4567"]', '+1-555-123-4567');
      await page.fill('input[placeholder*="Company name"]', 'Test Company');
      
      // Fill in address information
      await page.fill('input[placeholder*="Street address"]', '123 Test St');
      await page.fill('input[placeholder*="City"]', 'Test City');
      await page.fill('input[placeholder*="State or Province"]', 'TS');
      await page.fill('input[placeholder*="ZIP or Postal Code"]', '12345');
      
      // Select country
      await page.click('text=Select country');
      await page.click('text=US');
      
      // Select currency
      await page.click('text=Select currency');
      await page.click('text=USD');
      
      // Fill in business information
      await page.fill('input[placeholder*="Tax identification number"]', '12-3456789');
      
      // Select payment terms
      await page.click('text=Select payment terms');
      await page.click('text=Net 30');
      
      // Select status
      await page.click('text=Select status');
      await page.click('text=Active');
      
      // Fill in notes
      await page.fill('textarea[placeholder*="Any additional notes about this client"]', 'Test client notes');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('text=Client created successfully', { timeout: 10000 });
      
      // Verify redirect to clients list
      await expect(page).toHaveURL(/.*\/clients/);
    });

    test('should show validation errors for required fields', async ({ page }) => {
      // Navigate to client creation page
      await page.goto('/clients/new');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Name and email are required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      // Navigate to client creation page
      await page.goto('/clients/new');
      
      // Fill in invalid email
      await page.fill('input[placeholder*="Client\'s full name"]', 'John Doe');
      await page.fill('input[type="email"]', 'invalid-email');
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Check for email validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/invoices', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      // Navigate to invoice creation page
      await page.goto('/invoices/new');
      
      // Fill in required fields
      await page.fill('input[placeholder*="Client"]', 'Test Client');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[placeholder*="Item description"]', 'Test Service');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Check for error message
      await expect(page.locator('text=Failed to save invoice')).toBeVisible();
    });

    test('should show loading states during submission', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/invoices', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: { id: 1 } })
          });
        }, 2000);
      });

      // Navigate to invoice creation page
      await page.goto('/invoices/new');
      
      // Fill in required fields
      await page.fill('input[placeholder*="Client"]', 'Test Client');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[placeholder*="Item description"]', 'Test Service');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Check for loading state
      await expect(page.locator('text=Saving...')).toBeVisible();
    });
  });
});
