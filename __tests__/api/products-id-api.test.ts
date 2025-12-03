/**
 * Products [id] API Tests
 * Tests for product detail, update, and delete endpoints
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
import { GET, PATCH, DELETE } from '@/app/api/products/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Create shared mock service instance
const mockServiceInstance = {
  getById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock ProductsService - use a class-like constructor
vi.mock('@/lib/services/business/products-service', () => {
  const mockInstance = {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return {
    ProductsService: class {
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
const { __mockInstance } = await import('@/lib/services/business/products-service');

describe('Products [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/products/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return product when authenticated and product exists', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        stockQuantity: 10,
        status: 'active',
      };
      __mockInstance.getById.mockResolvedValue(mockProduct);
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123');
      const response = await GET(request, { params });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(__mockInstance.getById).toHaveBeenCalledWith('product-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should handle errors when product service fails', async () => {
      __mockInstance.getById.mockRejectedValue(new Error('Service error'));
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/products/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Product' }),
      });
      
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update product when authenticated', async () => {
      const updateData = { name: 'Updated Product', price: '129.99' };
      const updatedProduct = {
        id: 'product-123',
        ...updateData,
        description: 'Test Description',
        stockQuantity: 10,
        status: 'active',
      };
      __mockInstance.update.mockResolvedValue(updatedProduct);
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedProduct);
      expect(__mockInstance.update).toHaveBeenCalledWith({ id: 'product-123', ...updateData });
    });

    it('should handle errors when update fails', async () => {
      __mockInstance.update.mockRejectedValue(new Error('Update failed'));
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Product' }),
      });
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/products/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete product when authenticated', async () => {
      __mockInstance.delete.mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(__mockInstance.delete).toHaveBeenCalledWith('product-123');
    });

    it('should handle errors when delete fails', async () => {
      __mockInstance.delete.mockRejectedValue(new Error('Delete failed'));
      
      const params = Promise.resolve({ id: 'product-123' });
      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});
