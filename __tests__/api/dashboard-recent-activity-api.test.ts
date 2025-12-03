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
import { GET } from '@/app/api/dashboard/recent-activity/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock DashboardService
vi.mock('@/lib/services/dashboard-service', () => ({
  DashboardService: {
    getRecentActivity: vi.fn(),
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
const { DashboardService } = await import('@/lib/services/dashboard-service');

describe('Dashboard Recent Activity API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard/recent-activity', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/dashboard/recent-activity');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return recent activity when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getRecentActivity).mockResolvedValue([
        {
          id: '1',
          type: 'invoice',
          description: 'Invoice #123 was paid',
          amount: 1250.00,
          createdAt: new Date(),
          status: 'paid',
        },
        {
          id: '2',
          type: 'transaction',
          description: 'Payment received',
          amount: 500.00,
          createdAt: new Date(),
          status: 'completed',
        },
      ] as any);

      const request = new NextRequest('http://localhost:3000/api/dashboard/recent-activity?limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('activities');
      expect(Array.isArray(data.activities)).toBe(true);
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
    });

    it('should handle limit parameter', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getRecentActivity).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/dashboard/recent-activity?limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(DashboardService.getRecentActivity).toHaveBeenCalledWith('user-123', 5);
    });

    it('should use default limit of 10 when not provided', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getRecentActivity).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/dashboard/recent-activity');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(DashboardService.getRecentActivity).toHaveBeenCalledWith('user-123', 10);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getRecentActivity).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/dashboard/recent-activity');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

