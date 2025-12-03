/**
 * Customers Analytics API Tests
 * Tests for customer analytics endpoint
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/customers/analytics/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock CustomersService
const mockGetAnalytics = vi.fn();
vi.mock('@/lib/services/business/customers-service', () => ({
  CustomersService: class {
    getAnalytics = mockGetAnalytics;
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');

describe('Customers Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    mockGetAnalytics.mockClear();
  });

  describe('GET /api/customers/analytics', () => {
    it('should return customer analytics for authenticated user', async () => {
      const mockAnalytics = {
        totalCustomers: 150,
        newCustomers: 10,
        activeCustomers: 120,
        customerRetention: 0.85,
        averageLifetimeValue: 5000,
        customerGrowth: [],
      };
      mockGetAnalytics.mockResolvedValue(mockAnalytics);

      const request = new NextRequest('http://localhost:3000/api/customers/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalCustomers).toBe(150);
      expect(data.activeCustomers).toBe(120);
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/customers/analytics');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
