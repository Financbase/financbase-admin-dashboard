/**
 * Reconciliation Dashboard API Tests
 * Tests for reconciliation dashboard endpoint
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
import { GET } from '@/app/api/reconciliation/dashboard/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ReconciliationService
const mockGetDashboardData = vi.fn();
vi.mock('@/lib/reconciliation/reconciliation-service', () => ({
  ReconciliationService: {
    getDashboardData: mockGetDashboardData,
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

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');

describe('Reconciliation Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    mockGetDashboardData.mockClear();
  });

  describe('GET /api/reconciliation/dashboard', () => {
    it('should return dashboard data for authenticated user', async () => {
      const mockDashboardData = {
        totalSessions: 10,
        activeSessions: 3,
        matchRate: 0.85,
        recentActivity: [],
      };
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      const request = new NextRequest('http://localhost:3000/api/reconciliation/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDashboardData);
      expect(mockGetDashboardData).toHaveBeenCalledWith('user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/dashboard');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});

