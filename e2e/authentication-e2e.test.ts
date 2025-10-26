/**
 * Authentication E2E Tests
 * End-to-end tests for authentication flows and protected routes
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to sign-in', async ({ page }) => {
      // Try to access protected dashboard route
      await page.goto('/dashboard');
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*\/auth\/sign-in/);
    });

    test('should redirect unauthenticated users from API routes', async ({ page }) => {
      // Try to access protected API route
      const response = await page.request.get('/api/invoices');
      
      // Should return 401 Unauthorized
      expect(response.status()).toBe(401);
      
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Unauthorized');
      expect(responseBody.message).toBe('Authentication required');
    });

    test('should allow access to public routes without authentication', async ({ page }) => {
      // Access public health check route
      const response = await page.request.get('/api/health');
      
      // Should return 200 OK
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Sign In Flow', () => {
    test('should display sign-in page correctly', async ({ page }) => {
      // Navigate to sign-in page
      await page.goto('/auth/sign-in');
      
      // Check for sign-in form elements
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      // Navigate to sign-in page
      await page.goto('/auth/sign-in');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Navigate to sign-in page
      await page.goto('/auth/sign-in');
      
      // Fill in invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Check for error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should redirect to dashboard after successful sign-in', async ({ page }) => {
      // Mock successful authentication
      await page.addInitScript(() => {
        window.Clerk = {
          user: {
            id: 'test-user-123',
            emailAddresses: [{ emailAddress: 'test@example.com' }]
          },
          isSignedIn: () => true
        };
      });

      // Navigate to sign-in page
      await page.goto('/auth/sign-in');
      
      // Fill in valid credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });

  test.describe('Sign Up Flow', () => {
    test('should display sign-up page correctly', async ({ page }) => {
      // Navigate to sign-up page
      await page.goto('/auth/sign-up');
      
      // Check for sign-up form elements
      await expect(page.locator('text=Sign Up')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for invalid email', async ({ page }) => {
      // Navigate to sign-up page
      await page.goto('/auth/sign-up');
      
      // Fill in invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Check for validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should show validation errors for weak password', async ({ page }) => {
      // Navigate to sign-up page
      await page.goto('/auth/sign-up');
      
      // Fill in weak password
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', '123');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Check for validation error
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });
  });

  test.describe('Authenticated User Experience', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        window.Clerk = {
          user: {
            id: 'test-user-123',
            emailAddresses: [{ emailAddress: 'test@example.com' }]
          },
          isSignedIn: () => true
        };
      });
    });

    test('should display user information in header', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Check for user information in header
      await expect(page.locator('text=test@example.com')).toBeVisible();
    });

    test('should allow access to protected routes', async ({ page }) => {
      // Navigate to protected dashboard route
      await page.goto('/dashboard');
      
      // Should load successfully
      await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    });

    test('should allow access to protected API routes', async ({ page }) => {
      // Access protected API route
      const response = await page.request.get('/api/invoices');
      
      // Should return 200 OK (or appropriate response)
      expect(response.status()).toBe(200);
    });

    test('should sign out successfully', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Click sign out button
      await page.click('text=Sign Out');
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*\/auth\/sign-in/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        window.Clerk = {
          user: {
            id: 'test-user-123',
            emailAddresses: [{ emailAddress: 'test@example.com' }]
          },
          isSignedIn: () => true
        };
      });

      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Refresh the page
      await page.reload();
      
      // Should still be on dashboard
      await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    });

    test('should handle session expiration', async ({ page }) => {
      // Mock expired session
      await page.addInitScript(() => {
        window.Clerk = {
          user: null,
          isSignedIn: () => false
        };
      });

      // Try to access protected route
      await page.goto('/dashboard');
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/.*\/auth\/sign-in/);
    });
  });

  test.describe('Middleware Protection', () => {
    test('should protect all API routes except public ones', async ({ page }) => {
      const protectedRoutes = [
        '/api/invoices',
        '/api/expenses',
        '/api/clients',
        '/api/dashboard/ai-insights'
      ];

      for (const route of protectedRoutes) {
        const response = await page.request.get(route);
        expect(response.status()).toBe(401);
      }
    });

    test('should allow access to public API routes', async ({ page }) => {
      const publicRoutes = [
        '/api/health',
        '/api/test-simple'
      ];

      for (const route of publicRoutes) {
        const response = await page.request.get(route);
        expect(response.status()).toBe(200);
      }
    });
  });
});
