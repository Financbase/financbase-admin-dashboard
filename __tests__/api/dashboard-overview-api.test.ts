/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/dashboard/overview/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock DashboardService
vi.mock('@/lib/services/dashboard-service', () => ({
  DashboardService: {
    getOverview: vi.fn(),
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

describe('Dashboard Overview API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard/overview', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new Request('http://localhost:3000/api/dashboard/overview');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return dashboard overview when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getOverview).mockResolvedValue({
        revenue: { total: 125000.50 },
        expenses: { total: 45000.25 },
        netIncome: { thisMonth: 80000.25 },
        clients: { total: 45, active: 38 },
      } as any);

      const request = new Request('http://localhost:3000/api/dashboard/overview');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('overview');
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('timestamp');
      expect(data.overview).toHaveProperty('revenue');
      expect(data.overview).toHaveProperty('expenses');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(DashboardService.getOverview).mockRejectedValue(new Error('Service error'));

      const request = new Request('http://localhost:3000/api/dashboard/overview');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

