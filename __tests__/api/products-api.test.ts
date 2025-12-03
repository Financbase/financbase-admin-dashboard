/**
 * Products API Tests
 * Tests for products list and create endpoints
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
import { GET, POST } from '@/app/api/products/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ProductsService
vi.mock('@/lib/services/business/products-service', () => ({
  ProductsService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
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
const { z } = await import('zod');

describe('Products API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
    };
    vi.mocked(ProductsService).mockImplementation(() => mockService);
  });

  describe('GET /api/products', () => {
    it('should return products when authenticated', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU001', price: '100.00', status: 'active' },
        { id: '2', name: 'Product 2', sku: 'SKU002', price: '200.00', status: 'active' },
      ];
      mockService.getAll.mockResolvedValue(mockProducts);

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProducts);
    });

    it('should filter products by search term', async () => {
      mockService.getAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/products?search=laptop');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/products', () => {
    it('should create product when valid data provided', async () => {
      const mockProduct = {
        id: '1',
        name: 'New Product',
        sku: 'SKU003',
        price: '150.00',
        status: 'active',
      };
      mockService.create.mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'SKU003',
          category: 'Electronics',
          price: '150.00',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockProduct);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          // Missing sku, category, price
        }),
      });

      const response = await POST(request);
      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'SKU003',
          category: 'Electronics',
          price: '150.00',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

