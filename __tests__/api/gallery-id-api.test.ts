/**
 * Gallery [id] API Tests
 * Tests for gallery image detail, update, and delete endpoints
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
import { GET, PATCH, DELETE } from '@/app/api/gallery/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock GalleryService - use a class-like constructor
vi.mock('@/lib/services/media/gallery-service', () => {
  const mockInstance = {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return {
    GalleryService: class {
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

const { auth } = await import('@clerk/nextjs/server');
const { __mockInstance } = await import('@/lib/services/media/gallery-service');

describe('Gallery [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/gallery/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return gallery image when authenticated and image exists', async () => {
      const mockImage = {
        id: 'img-123',
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
        description: 'Test Description',
        category: 'products',
      };
      __mockInstance.getById.mockResolvedValue(mockImage);
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockImage);
      expect(__mockInstance.getById).toHaveBeenCalledWith('img-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should handle errors when gallery service fails', async () => {
      __mockInstance.getById.mockRejectedValue(new Error('Service error'));
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/gallery/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      });
      
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update gallery image when authenticated', async () => {
      const updateData = { title: 'Updated Title', description: 'Updated Description' };
      const updatedImage = {
        id: 'img-123',
        url: 'https://example.com/image.jpg',
        ...updateData,
        category: 'products',
      };
      __mockInstance.update.mockResolvedValue(updatedImage);
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedImage);
      expect(__mockInstance.update).toHaveBeenCalledWith({ id: 'img-123', ...updateData });
    });

    it('should handle errors when update fails', async () => {
      __mockInstance.update.mockRejectedValue(new Error('Update failed'));
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      });
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/gallery/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete gallery image when authenticated', async () => {
      __mockInstance.delete.mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(__mockInstance.delete).toHaveBeenCalledWith('img-123');
    });

    it('should handle errors when delete fails', async () => {
      __mockInstance.delete.mockRejectedValue(new Error('Delete failed'));
      
      const params = Promise.resolve({ id: 'img-123' });
      const request = new NextRequest('http://localhost:3000/api/gallery/img-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});

