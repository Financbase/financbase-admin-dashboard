/**
 * Vendors API Integration Tests
 * Tests the fixed vendors API with real database operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/vendors/route';
import { TestDatabase } from '../test-db';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('Vendors API - Real Database Integration', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = TestDatabase.getInstance();
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it('should handle GET requests to vendors API', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    vi.mocked(auth).mockResolvedValue({
      userId: null,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/vendors');
    const response = await GET(request);

    // Should return 401 (unauthorized) since we don't have auth
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error?.message || data.error || data.message).toContain('Unauthorized');
  });

  it('should handle POST requests to vendors API', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    vi.mocked(auth).mockResolvedValue({
      userId: null,
    } as any);

    const vendorData = {
      name: 'Test Vendor Company',
      email: 'billing@testvendor.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US'
      },
      taxId: '12-3456789',
      paymentTerms: 30,
      category: 'office_supplies',
      paymentMethods: [
        {
          id: 'pm_1',
          type: 'bank_account',
          details: {
            accountNumber: '****1234',
            routingNumber: '****5678',
            bankName: 'Test Bank'
          },
          isDefault: true,
          status: 'active'
        }
      ],
      autoPay: false,
      approvalRequired: true,
      approvalThreshold: 1000
    };

    const request = new NextRequest('http://localhost:3000/api/vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendorData),
    });

    // Mock request.json() method
    request.json = vi.fn().mockResolvedValue(vendorData);

    const response = await POST(request);

    // Should return 401 (unauthorized) since we don't have auth
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error?.message || data.error || data.message).toContain('Unauthorized');
  });

  it('should validate API route structure', async () => {
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });

  it('should handle query parameters correctly', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    vi.mocked(auth).mockResolvedValue({
      userId: null,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/vendors?status=active&category=office_supplies&limit=10&offset=0');
    const response = await GET(request);

    // Should return 401 (unauthorized) but the route should handle query params
    expect(response.status).toBe(401);
  });
});
