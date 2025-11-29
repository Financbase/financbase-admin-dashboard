/**
 * Simple Database Connection Test
 * Tests basic database operations without complex setup
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TestDatabase } from '../test-db';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('Database Connection Test', () => {
  let testDatabase: ReturnType<typeof TestDatabase.getInstance>;

  beforeAll(async () => {
    testDatabase = TestDatabase.getInstance();
    await testDatabase.setup();
  });

  afterAll(async () => {
    await testDatabase?.teardown();
  });

  it('should connect to database and run basic queries', async () => {
    try {
      const { testDb } = await import('../test-db');
      const { bills, vendors } = await import('@/lib/db/schemas/bill-pay.schema');

      // Test basic query
      const result = await testDb.select().from(bills).limit(1);
      expect(Array.isArray(result)).toBe(true);

      // Test vendor query
      const vendorResult = await testDb.select().from(vendors).limit(1);
      expect(Array.isArray(vendorResult)).toBe(true);
    } catch (error) {
      console.error('Database test failed:', error);
      // Skip test if database is not available
      if (error instanceof Error && error.message.includes('DATABASE_URL')) {
        console.warn('Skipping database test - DATABASE_URL not configured');
        return;
      }
      throw error;
    }
  });
});
