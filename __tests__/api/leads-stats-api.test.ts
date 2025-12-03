/**
 * Leads Stats API Tests
 * Tests for leads statistics endpoint
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
import { GET } from '@/app/api/leads/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock LeadManagementService
vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: {
    getLeadStats: vi.fn(),
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
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized', timestamp: new Date().toISOString() } }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() } }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { LeadManagementService } = await import('@/lib/services/lead-management-service');

describe('Leads Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/leads/stats', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return lead stats when authenticated', async () => {
      const mockStats = {
        totalLeads: 100,
        leadsByStatus: {
          new: 20,
          contacted: 15,
          qualified: 10,
          closed_won: 5,
        },
        leadsBySource: {
          website: 50,
          referral: 30,
          social_media: 20,
        },
        conversionRate: 25.5,
        totalValue: 500000,
        averageValue: 5000,
        monthlyTrend: [
          { month: '2025-01', count: 10, value: 50000 },
        ],
      };
      
      vi.mocked(LeadManagementService.getLeadStats).mockResolvedValue(mockStats);
      
      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('stats');
      expect(data.stats.totalLeads).toBe(100);
      expect(LeadManagementService.getLeadStats).toHaveBeenCalledWith('user-123');
    });

    it('should handle errors from service', async () => {
      vi.mocked(LeadManagementService.getLeadStats).mockRejectedValue(new Error('Database error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });

    it('should return standardized error format for 401 errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data.error).toHaveProperty('timestamp');
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return standardized error format for 500 errors', async () => {
      vi.mocked(LeadManagementService.getLeadStats).mockRejectedValue(new Error('Service error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});

