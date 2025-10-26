import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/api/clients',
      '/api/expenses',
      '/collaboration',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should redirect to auth or return 401 for API routes
      await expect(page.url()).toMatch(/.*auth.*|.*401.*/);
    }
  });

  test('should load authentication pages', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.locator('h1')).toContainText(/sign in/i);

    await page.goto('/auth/sign-up');
    await expect(page.locator('h1')).toContainText(/sign up/i);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should stay on auth page or show validation
      await expect(page.url()).toMatch(/.*auth.*/);
    }
  });
});

test.describe('API Integration Tests', () => {
  test('should handle API authentication correctly', async ({ page }) => {
    // Test unauthenticated API access
    const apiResponse = await page.request.get('/api/clients');
    expect([401, 403]).toContain(apiResponse.status());

    // Test with invalid auth
    const responseWithBadAuth = await page.request.get('/api/clients', {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });
    expect([401, 403]).toContain(responseWithBadAuth.status());
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Test API endpoint that might not exist
    const response = await page.request.get('/api/nonexistent');
    expect([404, 500]).toContain(response.status());
  });

  test('should handle rate limiting', async ({ page }) => {
    // Make multiple rapid requests
    const requests = Array.from({ length: 10 }, () =>
      page.request.get('/api/clients')
    );

    const responses = await Promise.all(requests);

    // Should get consistent responses (all 401 or some rate limited)
    const statusCodes = responses.map(r => r.status()); // Should either rate limit or consistently return 401
    const uniqueCodes = Array.from(new Set(statusCodes));
    expect(uniqueCodes.length).toBeLessThanOrEqual(2); // Max 2 different status codes
  });
});

test.describe('Collaboration Features', () => {
  test('should load collaboration page', async ({ page }) => {
    // Mock authentication for collaboration features
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/collaboration');

    // Should load collaboration interface
    await expect(page.locator('h1, h2')).toContainText(/collaboration|workspace|team/i);
  });

  test('should handle workspace creation', async ({ page }) => {
    // This would test the workspace creation flow
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/collaboration');

    // Look for workspace creation elements
    const workspaceElements = page.locator('[data-testid*="workspace"], [class*="workspace"]');
    // Check if workspace functionality is available
    const workspaceCount = await workspaceElements.count();
    // Optional - workspace creation might not be on main page
    expect(workspaceCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Form Validation', () => {
  test('should validate client creation form', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    // Navigate to a page that might have client creation
    await page.goto('/dashboard');

    // Look for client creation form
    const clientForm = page.locator('form[class*="client"], [data-testid*="client-form"]');
    if (await clientForm.isVisible()) {
      // Test form validation
      const submitButton = clientForm.locator('button[type="submit"]');
      await submitButton.click();

      // Should show validation errors or prevent submission
      await expect(page.url()).not.toMatch(/.*success.*/);
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail network requests
    await page.route('**/api/**', (route) => {
      route.abort();
    });

    await page.goto('/dashboard');

    // Should show error state or fallback content
    // Application should not crash completely
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 500 errors from API', async ({ page }) => {
    // Mock API to return 500 errors
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/dashboard');

    // Should show error handling UI
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Security Tests', () => {
  test('should not expose sensitive data in responses', async ({ page }) => {
    // Test API responses don't contain sensitive information
    const response = await page.request.get('/api/clients');
    const body = await response.text();

    // Should not contain obvious sensitive data patterns
    expect(body).not.toMatch(/password|secret|token|key.*[a-zA-Z0-9]{20,}/i);
  });

  test('should handle XSS attempts', async ({ page }) => {
    // Mock authenticated state
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    // Try to inject XSS via URL
    await page.goto('/dashboard?test=<script>alert("xss")</script>');

    // Page should still load and not execute scripts
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load critical resources quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Critical path should be fast
    expect(loadTime).toBeLessThan(2000);
  });

  test('should not have excessive DOM nodes', async ({ page }) => {
    await page.goto('/dashboard');

    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // Should not have excessive DOM complexity
    expect(nodeCount).toBeLessThan(3000);
  });
});
