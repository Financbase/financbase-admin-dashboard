/**
 * HR Contractors [id] API Tests
 * Tests for contractor detail, update, and delete endpoints
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
import { GET, PATCH, DELETE } from '@/app/api/hr/contractors/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ContractorsService - use a class-like constructor
vi.mock('@/lib/services/hr/contractors-service', () => {
  const mockInstance = {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return {
    ContractorsService: class {
      getById = mockInstance.getById;
      update = mockInstance.update;
      delete = mockInstance.delete;
    },
    __mockInstance: mockInstance,
  };
});

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

// Mock validation schemas
vi.mock('@/lib/validation-schemas', () => ({
  updateContractorSchema: {
    parse: vi.fn((data) => data),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { __mockInstance } = await import('@/lib/services/hr/contractors-service');

describe('HR Contractors [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/hr/contractors/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return contractor when authenticated and contractor exists', async () => {
      const mockContractor = {
        id: 'contractor-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Contractor Inc',
        status: 'active',
      };
      __mockInstance.getById.mockResolvedValue(mockContractor);
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockContractor);
      expect(__mockInstance.getById).toHaveBeenCalledWith('contractor-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should handle errors when contractor service fails', async () => {
      __mockInstance.getById.mockRejectedValue(new Error('Service error'));
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/hr/contractors/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update contractor when authenticated', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const updatedContractor = {
        id: 'contractor-123',
        ...updateData,
        company: 'Contractor Inc',
        status: 'active',
      };
      __mockInstance.update.mockResolvedValue(updatedContractor);
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedContractor);
    });

    it('should handle errors when update fails', async () => {
      __mockInstance.update.mockRejectedValue(new Error('Update failed'));
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/hr/contractors/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete contractor when authenticated', async () => {
      __mockInstance.delete.mockResolvedValue(undefined);
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(__mockInstance.delete).toHaveBeenCalledWith('contractor-123');
    });

    it('should handle errors when delete fails', async () => {
      __mockInstance.delete.mockRejectedValue(new Error('Delete failed'));
      
      const params = { id: 'contractor-123' };
      const request = new NextRequest('http://localhost:3000/api/hr/contractors/contractor-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});

