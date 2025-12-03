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
import { GET } from '@/app/api/dashboard/chart-data/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock DashboardService
vi.mock('@/lib/services/dashboard-service', () => ({
  DashboardService: {
    getChartData: vi.fn(),
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

describe('Dashboard Chart Data API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard/chart-data', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/dashboard/chart-data');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return chart data when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getChartData).mockResolvedValue({
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Revenue',
          data: [10000, 12000, 15000],
        }],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/dashboard/chart-data?type=revenue&period=12m&timeRange=month');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('labels');
      expect(data.data).toHaveProperty('datasets');
      expect(data.data).toHaveProperty('timeSeries');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should handle different type parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getChartData).mockResolvedValue({
        labels: [],
        datasets: [],
      } as any);

      const types = ['revenue', 'expenses', 'sales'];
      for (const type of types) {
        const request = new NextRequest(`http://localhost:3000/api/dashboard/chart-data?type=${type}`);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle different period parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getChartData).mockResolvedValue({
        labels: [],
        datasets: [],
      } as any);

      const periods = ['7d', '30d', '90d', '12m'];
      for (const period of periods) {
        const request = new NextRequest(`http://localhost:3000/api/dashboard/chart-data?period=${period}`);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getChartData).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/dashboard/chart-data');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

