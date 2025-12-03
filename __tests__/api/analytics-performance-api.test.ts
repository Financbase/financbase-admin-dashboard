/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/analytics/performance/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AnalyticsService
vi.mock('@/lib/services/analytics/analytics-service', () => ({
  AnalyticsService: {
    getPerformanceMetrics: vi.fn(),
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

describe('Analytics Performance API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics/performance', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return performance metrics when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getPerformanceMetrics).mockResolvedValue({
        averageResponseTime: 150,
        errorRate: 0.5,
        uptime: 99.9,
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('metrics');
      expect(data.metrics).toHaveProperty('averageResponseTime');
      expect(data.metrics).toHaveProperty('errorRate');
      expect(data.metrics).toHaveProperty('uptime');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getPerformanceMetrics).mockRejectedValue(new Error('Service error'));

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });
});

