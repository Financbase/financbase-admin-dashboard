/**
 * Products Stock API Tests
 * Tests for product stock update endpoint
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
import { PATCH } from '@/app/api/products/[id]/stock/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ProductsService
vi.mock('@/lib/services/business/products-service', () => ({
  ProductsService: vi.fn().mockImplementation(() => ({
    updateStock: vi.fn(),
  })),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { ProductsService } = await import('@/lib/services/business/products-service');

describe('Products Stock API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      updateStock: vi.fn(),
    };
    vi.mocked(ProductsService).mockImplementation(() => mockService);
  });

  describe('PATCH /api/products/{id}/stock', () => {
    it('should update stock when valid data provided', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        stockQuantity: 100,
      };
      mockService.updateStock.mockResolvedValue(mockProduct);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/products/1/stock', {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: 100,
          operation: 'set',
        }),
      });

      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(mockService.updateStock).toHaveBeenCalledWith('1', 100, 'set');
    });

    it('should return 400 when quantity is missing', async () => {
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/products/1/stock', {
        method: 'PATCH',
        body: JSON.stringify({
          operation: 'set',
        }),
      });

      const response = await PATCH(request, { params });
      expect(response.status).toBe(400);
    });

    it('should return 400 when quantity is not a number', async () => {
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/products/1/stock', {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: 'invalid',
        }),
      });

      const response = await PATCH(request, { params });
      expect(response.status).toBe(400);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/products/1/stock', {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: 100,
        }),
      });

      const response = await PATCH(request, { params });
      expect(response.status).toBe(401);
    });

    it('should handle add operation', async () => {
      const mockProduct = { id: '1', stockQuantity: 150 };
      mockService.updateStock.mockResolvedValue(mockProduct);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/products/1/stock', {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: 50,
          operation: 'add',
        }),
      });

      const response = await PATCH(request, { params });
      expect(response.status).toBe(200);
      expect(mockService.updateStock).toHaveBeenCalledWith('1', 50, 'add');
    });
  });
});

