/**
 * Clients [id] API Tests
 * Tests for client detail, update, and delete endpoints
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
import { GET, PUT, DELETE } from '@/app/api/clients/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ClientService
vi.mock('@/lib/services/client-service', () => ({
  ClientService: {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

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

const { auth } = await import('@clerk/nextjs/server');
const { ClientService } = await import('@/lib/services/client-service');

describe('Clients [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/clients/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return client when authenticated and client exists', async () => {
      const mockClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@test.com',
        isActive: true,
      };
      vi.mocked(ClientService.getById).mockResolvedValue(mockClient as any);
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.client).toEqual(mockClient);
      expect(ClientService.getById).toHaveBeenCalledWith('client-123', 'user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should return 404 when client not found', async () => {
      vi.mocked(ClientService.getById).mockResolvedValue(null);
      
      const params = Promise.resolve({ id: 'non-existent' });
      const request = new NextRequest('http://localhost:3000/api/clients/non-existent');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });

    it('should handle errors when client service fails', async () => {
      vi.mocked(ClientService.getById).mockRejectedValue(new Error('Service error'));
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/clients/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'PUT',
        body: JSON.stringify({ companyName: 'Updated Company' }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update client when authenticated', async () => {
      const updateData = { companyName: 'Updated Company', email: 'updated@test.com' };
      const updatedClient = {
        id: 'client-123',
        userId: 'user-123',
        ...updateData,
        contactName: 'John Doe',
        isActive: true,
      };
      vi.mocked(ClientService.update).mockResolvedValue(updatedClient as any);
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.client).toEqual(updatedClient);
      expect(ClientService.update).toHaveBeenCalledWith({
        id: 'client-123',
        userId: 'user-123',
        ...updateData,
      });
    });

    it('should return 400 for invalid request body', async () => {
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'PUT',
        body: 'invalid json',
      });
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should handle errors when update fails', async () => {
      vi.mocked(ClientService.update).mockRejectedValue(new Error('Update failed'));
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'PUT',
        body: JSON.stringify({ companyName: 'Updated Company' }),
      });
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/clients/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete client when authenticated', async () => {
      vi.mocked(ClientService.delete).mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ClientService.delete).toHaveBeenCalledWith('client-123', 'user-123');
    });

    it('should handle errors when delete fails', async () => {
      vi.mocked(ClientService.delete).mockRejectedValue(new Error('Delete failed'));
      
      const params = Promise.resolve({ id: 'client-123' });
      const request = new NextRequest('http://localhost:3000/api/clients/client-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});

