import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('should return 200 for health check endpoint', async ({ page }) => {
    // Try to access health check endpoint
    const response = await page.request.get('/api/health');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.status).toBe('ok');
  });
});
