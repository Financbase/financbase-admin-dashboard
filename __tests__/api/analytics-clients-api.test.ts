/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/analytics/clients/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AnalyticsService
vi.mock('@/lib/services/analytics/analytics-service', () => ({
  AnalyticsService: {
    getClientAnalytics: vi.fn(),
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

describe('Analytics Clients API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics/clients', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return client analytics when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getClientAnalytics).mockResolvedValue({
        totalClients: 150,
        activeClients: 120,
        newClients: [
          { month: 'Jan', count: 10 },
          { month: 'Feb', count: 15 },
        ],
        clientRetention: 0.85,
        satisfactionScore: 4.5,
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalClients');
      expect(data).toHaveProperty('activeClients');
      expect(data).toHaveProperty('newClientsThisMonth');
      expect(data).toHaveProperty('clientRetention');
      expect(data).toHaveProperty('satisfactionScore');
    });

    it('should handle empty new clients array', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getClientAnalytics).mockResolvedValue({
        totalClients: 0,
        activeClients: 0,
        newClients: [],
        clientRetention: 0,
        satisfactionScore: 0,
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.newClientsThisMonth).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(AnalyticsService.getClientAnalytics).mockRejectedValue(new Error('Service error'));

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });
});

