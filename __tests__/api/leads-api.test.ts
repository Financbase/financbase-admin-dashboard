/**
 * Leads API Tests
 * Tests for leads list and create endpoints
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
import { GET, POST } from '@/app/api/leads/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock LeadManagementService
vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: {
    getPaginatedLeads: vi.fn(),
    createLead: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized', timestamp: new Date().toISOString() } }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: { code: 'BAD_REQUEST', message, timestamp: new Date().toISOString() } }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: { code: 'INTERNAL_SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() } }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { LeadManagementService } = await import('@/lib/services/lead-management-service');

describe('Leads API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/leads', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads');
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return paginated leads when authenticated', async () => {
      const mockLeads = {
        data: [
          {
            id: 'lead-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            status: 'new',
            source: 'website',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };
      
      vi.mocked(LeadManagementService.getPaginatedLeads).mockResolvedValue(mockLeads);
      
      const request = new NextRequest('http://localhost:3000/api/leads?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(LeadManagementService.getPaginatedLeads).toHaveBeenCalledWith('user-123', {
        page: 1,
        limit: 20,
        search: undefined,
        status: undefined,
        source: undefined,
        priority: undefined,
        assignedTo: undefined,
      });
    });

    it('should handle query parameters correctly', async () => {
      const mockLeads = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      
      vi.mocked(LeadManagementService.getPaginatedLeads).mockResolvedValue(mockLeads);
      
      const request = new NextRequest('http://localhost:3000/api/leads?page=2&limit=10&status=new&source=website&priority=high');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(LeadManagementService.getPaginatedLeads).toHaveBeenCalledWith('user-123', {
        page: 2,
        limit: 10,
        search: undefined,
        status: 'new',
        source: 'website',
        priority: 'high',
        assignedTo: undefined,
      });
    });

    it('should handle errors from service', async () => {
      vi.mocked(LeadManagementService.getPaginatedLeads).mockRejectedValue(new Error('Database error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/leads', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          source: 'website',
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: 'invalid json',
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should create lead when valid', async () => {
      const mockLead = {
        id: 'lead-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: 'website',
        status: 'new',
      };
      
      vi.mocked(LeadManagementService.createLead).mockResolvedValue(mockLead);
      
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          source: 'website',
        }),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('lead');
      expect(data.lead.id).toBe('lead-1');
      expect(LeadManagementService.createLead).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const { z } = await import('zod');
      const validationError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['firstName'],
          message: 'First name is required',
        },
      ]);
      
      vi.mocked(LeadManagementService.createLead).mockRejectedValue(validationError);
      
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          lastName: 'Doe',
          email: 'john@example.com',
          source: 'website',
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });

  describe('Error Handling', () => {
    it('should return standardized error format for 401 errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/leads');
      
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
      vi.mocked(LeadManagementService.getPaginatedLeads).mockRejectedValue(new Error('Service error'));
      
      const request = new NextRequest('http://localhost:3000/api/leads');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});

