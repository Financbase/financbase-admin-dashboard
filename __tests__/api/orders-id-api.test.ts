/**
 * Orders [id] API Tests
 * Tests for order detail and update endpoints
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
import { GET, PATCH } from '@/app/api/orders/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock OrdersService - use a class-like constructor
vi.mock('@/lib/services/business/orders-service', () => {
  const mockInstance = {
    getById: vi.fn(),
    update: vi.fn(),
  };
  return {
    OrdersService: class {
      getById = mockInstance.getById;
      update = mockInstance.update;
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
const { __mockInstance } = await import('@/lib/services/business/orders-service');

describe('Orders [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/orders/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return order when authenticated and order exists', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        status: 'pending',
        total: 199.99,
      };
      __mockInstance.getById.mockResolvedValue(mockOrder);
      
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockOrder);
      expect(__mockInstance.getById).toHaveBeenCalledWith('order-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should handle errors when order service fails', async () => {
      __mockInstance.getById.mockRejectedValue(new Error('Service error'));
      
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/orders/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'fulfilled' }),
      });
      
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update order when authenticated', async () => {
      const updateData = { status: 'fulfilled' };
      const updatedOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        ...updateData,
        total: 199.99,
      };
      __mockInstance.update.mockResolvedValue(updatedOrder);
      
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedOrder);
      expect(__mockInstance.update).toHaveBeenCalledWith({ id: 'order-123', ...updateData });
    });

    it('should handle errors when update fails', async () => {
      __mockInstance.update.mockRejectedValue(new Error('Update failed'));
      
      const params = Promise.resolve({ id: 'order-123' });
      const request = new NextRequest('http://localhost:3000/api/orders/order-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'fulfilled' }),
      });
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});
