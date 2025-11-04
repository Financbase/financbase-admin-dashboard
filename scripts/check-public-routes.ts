import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const publicRoutes = [
  '/',
  '/about',
  '/analytics',
  '/blog',
  '/careers',
  '/contact',
  '/docs',
  '/guides',
  '/home',
  '/legal',
  '/pricing',
  '/privacy',
  '/security',
  '/support',
  '/team-collaboration',
  '/terms',
];

test.describe('Public Routes Check', () => {
  for (const route of publicRoutes) {
    test(`should load ${route} without errors`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      
      // Check for client-side errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
        }
      });

      // Check for 404 elements
      const notFoundText = await page.getByText('404', { exact: false }).count();
      const errorText = await page.getByText('error', { exact: false }).count();
      
      expect(notFoundText, 'Page should not contain 404 text').toBe(0);
      expect(errorText, 'Page should not contain error text').toBe(0);
      expect(consoleErrors, 'No console errors should be present').toHaveLength(0);
      
      // Check for broken images
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth
        }))
      );
      
      for (const img of images) {
        // Skip data URLs and external images for now
        if (!img.src.startsWith('http') || img.src.includes(BASE_URL)) {
          expect(img.naturalWidth, `Image should load correctly: ${img.src}`).toBeGreaterThan(0);
        }
      }
    });
  }
});
