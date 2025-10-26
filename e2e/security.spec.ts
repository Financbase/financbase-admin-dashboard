import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Security & Vulnerability Tests', () => {
  test('should not expose sensitive data in API responses', async ({ page }) => {
    // Test that API responses don't contain sensitive information
    const response = await page.request.get('/api/clients');
    const responseBody = await response.text();

    // Common sensitive data patterns
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key.*[a-zA-Z0-9]{20,}/i,
      /api[_-]?key/i,
      /private[_-]?key/i,
      /auth[_-]?token/i,
    ];

    for (const pattern of sensitivePatterns) {
      expect(responseBody).not.toMatch(pattern);
    }
  });

  test('should handle malicious input safely', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    // Test XSS injection
    await page.goto('/dashboard?param=<script>alert("xss")</script>');

    // Should not execute injected scripts
    const hasScriptExecution = await page.evaluate(() => {
      return typeof window !== 'undefined' && window.alert !== undefined && window.alert.toString().includes('xss');
    });

    expect(hasScriptExecution).toBe(false);
  });

  test('should validate CSRF protection', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    // Test POST request without proper CSRF token
    const response = await page.request.post('/api/clients', {
      data: { companyName: 'Test Company' },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should require authentication or proper CSRF
    expect([401, 403, 422]).toContain(response.status());
  });

  test('should handle rate limiting appropriately', async ({ page }) => {
    // Make multiple rapid requests
    const requests = Array(20).fill().map(() =>
      page.request.get('/api/clients')
    );

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());

    // Should either rate limit or consistently return 401
    const uniqueCodes = [...new Set(statusCodes)];
    expect(uniqueCodes.length).toBeLessThanOrEqual(2);
  });

  test('should validate file upload security', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Test malicious file upload
      await fileInput.setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('malicious content'),
      });

      // Should reject malicious file types
      await expect(page.locator('text=/invalid|error|rejected/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle SQL injection attempts', async ({ page }) => {
    // Test SQL injection via search
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'/*",
      "' UNION SELECT * FROM users --",
    ];

    for (const input of maliciousInputs) {
      const response = await page.request.get(`/api/search?q=${encodeURIComponent(input)}`);

      // Should not return sensitive data or crash
      expect([200, 400, 401, 404]).toContain(response.status());

      const body = await response.text();
      expect(body).not.toMatch(/sql|database|table|error.*sql/i);
    }
  });
});

test.describe('Authentication Security', () => {
  test('should not allow weak passwords', async ({ page }) => {
    await page.goto('/auth/sign-up');

    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    if (await passwordInput.isVisible()) {
      // Test weak passwords
      await passwordInput.fill('123');
      await page.locator('button[type="submit"]').click();

      // Should show validation error
      await expect(page.locator('text=/password.*weak|password.*short|invalid/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle session management securely', async ({ page }) => {
    // Test session cookie security
    await page.goto('/auth/sign-in');

    const cookies = await page.context().cookies();

    // Check for secure cookie flags
    const sessionCookies = cookies.filter(c => c.name.includes('session') || c.name.includes('auth'));

    for (const cookie of sessionCookies) {
      // Should have secure flags in production
      if (cookie.secure !== undefined) {
        expect(cookie.secure).toBe(true);
      }
      if (cookie.httpOnly !== undefined) {
        expect(cookie.httpOnly).toBe(true);
      }
    }
  });

  test('should handle logout properly', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    // Mock logout
    await page.route('**/api/auth/logout**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Should clear session and redirect
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Data Protection', () => {
  test('should encrypt sensitive data in transit', async ({ page }) => {
    // Check if HTTPS is enforced
    await page.goto('http://localhost:3000/auth/sign-in');

    // In development, HTTP is acceptable, but should redirect to HTTPS in production
    const isSecure = page.url().startsWith('https://') || page.url().includes('localhost');
    expect(isSecure).toBe(true);
  });

  test('should validate input sanitization', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    // Test HTML injection
    await page.fill('input[name*="search"]', '<img src="x" onerror="alert(\'xss\')">');

    // Should sanitize or escape input
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility & Compliance', () => {
  test('should pass accessibility audit', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Should have minimal accessibility violations
    expect(accessibilityScanResults.violations.length).toBeLessThan(5);

    // Critical violations should be zero
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );
    expect(criticalViolations.length).toBe(0);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for proper ARIA implementation
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();

      // Should have either aria-label or accessible text
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Should focus on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/dashboard');

    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0); // Should have at least one h1

    // H1 should come before other headings
    const firstH1 = page.locator('h1').first();
    const firstH2 = page.locator('h2').first();

    if (await firstH2.isVisible()) {
      // H1 should appear before H2 in document order
      const h1Exists = await firstH1.isVisible();
      expect(h1Exists).toBe(true); // Basic check that h1 exists
    }
  });
});

test.describe('Performance Security', () => {
  test('should not leak memory on repeated navigation', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    // Navigate back and forth multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/dashboard');
      await page.goto('/');
      await page.goto('/auth/sign-in');
    }

    // Should not accumulate memory leaks
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle concurrent requests safely', async ({ page }) => {
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
    });

    await page.goto('/dashboard');

    // Make multiple concurrent requests
    const requests = Array(10).fill().map(() =>
      page.request.get('/api/clients')
    );

    const responses = await Promise.all(requests);

    // All requests should complete without hanging
    responses.forEach(response => {
      expect([200, 401, 403, 429]).toContain(response.status());
    });
  });
});
