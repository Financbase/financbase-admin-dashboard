/**
 * Products Analytics API Tests
 * Tests for product analytics endpoint
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
import { GET } from '@/app/api/products/analytics/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ProductsService
const mockGetAnalytics = vi.fn();
vi.mock('@/lib/services/business/products-service', () => ({
  ProductsService: class {
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

describe('Products Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    mockGetAnalytics.mockClear();
  });

  describe('GET /api/products/analytics', () => {
    it('should return product analytics for authenticated user', async () => {
      const mockAnalytics = {
        totalProducts: 50,
        totalSales: 75000,
        topSellingProducts: [],
        inventoryLevels: {},
        productTrends: [],
      };
      mockGetAnalytics.mockResolvedValue(mockAnalytics);

      const request = new NextRequest('http://localhost:3000/api/products/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalProducts).toBe(50);
      expect(data.totalSales).toBe(75000);
      expect(mockGetAnalytics).toHaveBeenCalled();
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/products/analytics');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});

