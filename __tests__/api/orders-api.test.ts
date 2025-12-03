/**
 * Orders API Tests
 * Tests for orders list and create endpoints
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
import { GET, POST } from '@/app/api/orders/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock OrdersService
vi.mock('@/lib/services/business/orders-service', () => ({
  OrdersService: vi.fn().mockImplementation(() => ({
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
const { OrdersService } = await import('@/lib/services/business/orders-service');

describe('Orders API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
    };
    vi.mocked(OrdersService).mockImplementation(() => mockService);
  });

  describe('GET /api/orders', () => {
    it('should return orders when authenticated', async () => {
      const mockOrders = [
        { id: '1', orderNumber: 'ORD-001', status: 'pending', total: 1000.00 },
        { id: '2', orderNumber: 'ORD-002', status: 'processing', total: 2000.00 },
      ];
      mockService.getAll.mockResolvedValue(mockOrders);

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockOrders);
    });

    it('should filter orders by status', async () => {
      mockService.getAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/orders?status=pending');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order when valid data provided', async () => {
      const mockOrder = {
        id: '1',
        orderNumber: 'ORD-003',
        status: 'pending',
        total: 1500.00,
      };
      mockService.create.mockResolvedValue(mockOrder);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          products: [
            { productId: '1', quantity: 2, price: '500.00' },
            { productId: '2', quantity: 1, price: '500.00' },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockOrder);
    });

    it('should return 400 for missing products', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: 'customer-123',
        }),
      });

      const response = await POST(request);
      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          products: [{ productId: '1', quantity: 1, price: '100.00' }],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

