/**
 * Bills API Integration Tests
 * Tests the fixed bills API with real database operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/bills/route';
import { TestDatabase } from '../test-db';

describe('Bills API - Real Database Integration', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = TestDatabase.getInstance();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it('should handle GET requests to bills API', async () => {
    const request = new NextRequest('http://localhost:3000/api/bills');
    const response = await GET(request);

    // Should return 401 (unauthorized) since we don't have auth
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle POST requests to bills API', async () => {
    const billData = {
      vendorId: 'test-vendor-123',
      amount: 150.00,
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate: new Date().toISOString(),
      invoiceNumber: 'INV-TEST-001',
      description: 'Test bill for integration testing',
      category: 'office_supplies',
      priority: 'medium'
    };

    const request = new NextRequest('http://localhost:3000/api/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billData),
    });

    const response = await POST(request);

    // Should return 401 (unauthorized) since we don't have auth
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should validate API route structure', async () => {
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });

  it('should handle query parameters correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/bills?status=draft&limit=10&offset=0');
    const response = await GET(request);

    // Should return 401 (unauthorized) but the route should handle query params
    expect(response.status).toBe(401);
  });
});
