/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/analytics/revenue/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AnalyticsService
vi.mock('@/lib/services/analytics/analytics-service', () => ({
  AnalyticsService: {
    getRevenueAnalytics: vi.fn(),
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
const { AnalyticsService } = await import('@/lib/services/analytics/analytics-service');

describe('Analytics Revenue API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics/revenue', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return revenue analytics when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getRevenueAnalytics).mockResolvedValue({
        totalRevenue: 125000.50,
        growth: 15.5,
        trends: [
          { period: 'Jan', revenue: 10000 },
          { period: 'Feb', revenue: 12000 },
        ],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue?period=12months');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('analytics');
      expect(data.analytics).toHaveProperty('totalRevenue');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should handle different period parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getRevenueAnalytics).mockResolvedValue({
        totalRevenue: 0,
        growth: 0,
        trends: [],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue?period=30d');
      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getRevenueAnalytics).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

