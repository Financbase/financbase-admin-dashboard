/**
 * Marketing Analytics API Tests
 * Tests for marketing analytics endpoint
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
import { GET } from '@/app/api/marketing/analytics/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock campaignAnalyticsService
vi.mock('@/lib/services/marketing/campaign-analytics-service', () => ({
  campaignAnalyticsService: {
    getAnalyticsOverview: vi.fn(),
    getPerformanceMetrics: vi.fn(),
    getCampaignPerformance: vi.fn(),
    getPlatformBreakdown: vi.fn(),
    getDailyMetrics: vi.fn(),
    getConversionFunnel: vi.fn(),
    getAudienceInsights: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { campaignAnalyticsService } = await import('@/lib/services/marketing/campaign-analytics-service');

describe('Marketing Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    
    // Setup default mock returns
    vi.mocked(campaignAnalyticsService.getAnalyticsOverview).mockResolvedValue({});
    vi.mocked(campaignAnalyticsService.getPerformanceMetrics).mockResolvedValue({
      impressions: { current: 0, previous: 0, change: 0 },
      clicks: { current: 0, previous: 0, change: 0 },
      conversions: { current: 0, previous: 0, change: 0 },
      spend: { current: 0, previous: 0, change: 0 },
    });
    vi.mocked(campaignAnalyticsService.getCampaignPerformance).mockResolvedValue([]);
    vi.mocked(campaignAnalyticsService.getPlatformBreakdown).mockResolvedValue([]);
    vi.mocked(campaignAnalyticsService.getDailyMetrics).mockResolvedValue([]);
    vi.mocked(campaignAnalyticsService.getConversionFunnel).mockResolvedValue({});
    vi.mocked(campaignAnalyticsService.getAudienceInsights).mockResolvedValue({});
  });

  describe('GET /api/marketing/analytics', () => {
    it('should return marketing analytics for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/marketing/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analytics).toBeDefined();
      expect(data.analytics.overview).toBeDefined();
      expect(data.analytics.performanceMetrics).toBeDefined();
      expect(data.analytics.campaignPerformance).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should handle date range parameters', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';
      const request = new NextRequest(`http://localhost:3000/api/marketing/analytics?startDate=${startDate}&endDate=${endDate}`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(campaignAnalyticsService.getAnalyticsOverview).toHaveBeenCalledWith('user-123', expect.any(Date), expect.any(Date));
    });

    it('should return 400 for invalid date format', async () => {
      const request = new NextRequest('http://localhost:3000/api/marketing/analytics?startDate=invalid-date');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 if startDate is after endDate', async () => {
      const request = new NextRequest('http://localhost:3000/api/marketing/analytics?startDate=2025-01-31&endDate=2025-01-01');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should filter by platform when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/marketing/analytics?platform=facebook');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analytics).toBeDefined();
      expect(data.analytics.campaignPerformance).toBeDefined();
      expect(data.analytics.platformBreakdown).toBeDefined();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/marketing/analytics');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});

