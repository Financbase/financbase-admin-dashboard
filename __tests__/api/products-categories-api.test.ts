/**
 * Products Categories API Tests
 * Tests for product categories endpoints
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
import { GET, POST } from '@/app/api/products/categories/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ProductsService
vi.mock('@/lib/services/business/products-service', () => ({
  ProductsService: vi.fn().mockImplementation(() => ({
    getCategories: vi.fn(),
    createCategory: vi.fn(),
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

describe('Products Categories API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      getCategories: vi.fn(),
      createCategory: vi.fn(),
    };
    vi.mocked(ProductsService).mockImplementation(() => mockService);
  });

  describe('GET /api/products/categories', () => {
    it('should return categories when authenticated and organizationId provided', async () => {
      const mockCategories = [
        { id: '1', name: 'Electronics', description: 'Electronic products' },
        { id: '2', name: 'Clothing', description: 'Clothing items' },
      ];
      mockService.getCategories.mockResolvedValue(mockCategories);

      const request = new NextRequest('http://localhost:3000/api/products/categories?organizationId=org-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
      expect(mockService.getCategories).toHaveBeenCalledWith('org-123');
    });

    it('should return 400 when organizationId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/products/categories');
      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(mockService.getCategories).not.toHaveBeenCalled();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/products/categories?organizationId=org-123');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should set cache headers', async () => {
      mockService.getCategories.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/products/categories?organizationId=org-123');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });
  });

  describe('POST /api/products/categories', () => {
    it('should create category when valid data provided', async () => {
      const mockCategory = {
        id: '1',
        name: 'New Category',
        description: 'Category description',
      };
      mockService.createCategory.mockResolvedValue(mockCategory);

      const request = new NextRequest('http://localhost:3000/api/products/categories', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'org-123',
          name: 'New Category',
          description: 'Category description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCategory);
      expect(mockService.createCategory).toHaveBeenCalledWith('org-123', 'New Category', 'Category description');
    });

    it('should return 400 when organizationId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/products/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Category',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/products/categories', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'org-123',
          name: 'New Category',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

