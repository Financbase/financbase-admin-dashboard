/**
 * Simple Database Connection Test
 * Verifies that the database connection and basic operations work
 */

import { describe, it, expect } from 'vitest';
import { db } from '../lib/db';
import { bills, vendors } from '../lib/db/schemas/bill-pay.schema';

describe('Database Connection Test', () => {
  it('should connect to database successfully', async () => {
    try {
      // Test basic connection
      const result = await db.execute('SELECT 1 as test');
      expect(result).toBeDefined();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });

  it('should be able to query bills table', async () => {
    try {
      // Test bills table query
      const result = await db.select().from(bills).limit(1);
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('Bills table query failed:', error);
      throw error;
    }
  });

  it('should be able to query vendors table', async () => {
    try {
      // Test vendors table query
      const result = await db.select().from(vendors).limit(1);
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('Vendors table query failed:', error);
      throw error;
    }
  });
});
