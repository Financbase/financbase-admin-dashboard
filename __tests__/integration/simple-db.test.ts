/**
 * Simple Database Connection Test
 * Tests basic database operations without complex setup
 */

import { describe, it, expect } from 'vitest';

describe('Database Connection Test', () => {
  it('should connect to database and run basic queries', async () => {
    // Test basic database connection by importing and checking if it works
    const { db } = await import('../lib/db');
    const { bills, vendors } = await import('../lib/db/schemas/bill-pay.schema');

    // Test basic query
    const result = await db.select().from(bills).limit(1);
    expect(Array.isArray(result)).toBe(true);

    // Test vendor query
    const vendorResult = await db.select().from(vendors).limit(1);
    expect(Array.isArray(vendorResult)).toBe(true);
  });
});
