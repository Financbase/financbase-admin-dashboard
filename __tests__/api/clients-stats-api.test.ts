/**
 * Clients Stats API Tests
 * Tests for client statistics endpoint
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
import { GET } from '@/app/api/clients/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ClientService
vi.mock('@/lib/services/client-service', () => ({
  ClientService: {
    getStats: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { ClientService } = await import('@/lib/services/client-service');

describe('Clients Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
  });

  describe('GET /api/clients/stats', () => {
    it('should return client statistics when authenticated', async () => {
      const mockStats = {
        totalClients: 50,
        activeClients: 45,
        newClientsThisMonth: 5,
        clientRetention: 0.92,
        satisfactionScore: 4.5,
      };
      vi.mocked(ClientService.getStats).mockResolvedValue(mockStats as any);

      const request = new NextRequest('http://localhost:3000/api/clients/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('stats');
      expect(data.stats).toEqual(mockStats);
      expect(ClientService.getStats).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/clients/stats');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(ClientService.getStats).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      vi.mocked(ClientService.getStats).mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/clients/stats');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });

    it('should set cache headers', async () => {
      vi.mocked(ClientService.getStats).mockResolvedValue({} as any);
      const request = new NextRequest('http://localhost:3000/api/clients/stats');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });
  });
});
