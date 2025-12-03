/**
 * Leads Pipeline API Tests
 * Tests for leads pipeline metrics endpoint
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
import { GET } from '@/app/api/leads/pipeline/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock LeadManagementService
vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: {
    getPipelineMetrics: vi.fn(),
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

describe('Leads Pipeline API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/leads/pipeline', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return pipeline metrics when authenticated', async () => {
      const mockPipeline = {
        stages: [
          { stage: 'new', count: 20, value: 100000 },
          { stage: 'contacted', count: 15, value: 75000 },
          { stage: 'qualified', count: 10, value: 50000 },
          { stage: 'closed_won', count: 5, value: 25000 },
        ],
        conversionRates: {
          'new_to_contacted': 75,
          'contacted_to_qualified': 66.7,
          'qualified_to_closed_won': 50,
        },
        averageTimeInStage: {
          new: 2,
          contacted: 5,
          qualified: 10,
        },
        pipelineVelocity: 17,
        winRate: 25,
      };
      
      vi.mocked(LeadManagementService.getPipelineMetrics).mockResolvedValue(mockPipeline);
      
      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('pipeline');
      expect(data.pipeline).toHaveProperty('stages');
      expect(data.pipeline).toHaveProperty('conversionRates');
      expect(LeadManagementService.getPipelineMetrics).toHaveBeenCalledWith('user-123');
    });

    it('should handle errors from service', async () => {
      vi.mocked(LeadManagementService.getPipelineMetrics).mockRejectedValue(new Error('Database error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });

    it('should return standardized error format for 401 errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      
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
      vi.mocked(LeadManagementService.getPipelineMetrics).mockRejectedValue(new Error('Service error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});

