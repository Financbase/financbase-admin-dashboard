/**
 * Simple Database Connection Test
 * Verifies that the database connection and basic operations work
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TestDatabase } from '../test-db';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('Database Connection Test', () => {
  let testDb: ReturnType<typeof TestDatabase.getInstance>;

  beforeAll(async () => {
    testDb = TestDatabase.getInstance();
    await testDb.setup();
  });

  afterAll(async () => {
    await testDb?.teardown();
  });

  it('should connect to database successfully', async () => {
    try {
      const { testDb: db } = await import('../test-db');
      const { sql } = await import('drizzle-orm');
      // Test basic connection using Drizzle's sql template
      const result = await db.execute(sql`SELECT 1 as test`);
      expect(result).toBeDefined();
    } catch (error) {
      console.error('Database connection failed:', error);
      // Skip test if database is not available
      if (error instanceof Error && error.message.includes('DATABASE_URL')) {
        console.warn('Skipping database test - DATABASE_URL not configured');
        return;
      }
      throw error;
    }
  });

  it('should be able to query bills table', async () => {
    try {
      const { testDb: db } = await import('../test-db');
      const { bills } = await import('@/lib/db/schemas/bill-pay.schema');
      // Test bills table query
      const result = await db.select().from(bills).limit(1);
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('Bills table query failed:', error);
      // Skip test if database is not available
      if (error instanceof Error && error.message.includes('DATABASE_URL')) {
        console.warn('Skipping database test - DATABASE_URL not configured');
        return;
      }
      throw error;
    }
  });

  it('should be able to query vendors table', async () => {
    try {
      const { testDb: db } = await import('../test-db');
      const { vendors } = await import('@/lib/db/schemas/bill-pay.schema');
      // Test vendors table query
      const result = await db.select().from(vendors).limit(1);
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('Vendors table query failed:', error);
      // Skip test if database is not available
      if (error instanceof Error && error.message.includes('DATABASE_URL')) {
        console.warn('Skipping database test - DATABASE_URL not configured');
        return;
      }
      throw error;
    }
  });
});
