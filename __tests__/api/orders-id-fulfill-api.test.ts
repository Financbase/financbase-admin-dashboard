/**
 * Orders Fulfill API Tests
 * Tests for order fulfillment endpoint
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
import { POST } from '@/app/api/orders/[id]/fulfill/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock OrdersService
vi.mock('@/lib/services/business/orders-service', () => ({
  OrdersService: vi.fn().mockImplementation(() => ({
    fulfill: vi.fn(),
  })),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { OrdersService } = await import('@/lib/services/business/orders-service');

describe('Orders Fulfill API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      fulfill: vi.fn(),
    };
    vi.mocked(OrdersService).mockImplementation(() => mockService);
  });

  describe('POST /api/orders/{id}/fulfill', () => {
    it('should fulfill order when valid', async () => {
      const mockOrder = {
        id: '1',
        orderNumber: 'ORD-001',
        status: 'shipped',
        trackingNumber: '1Z999AA10123456784',
        carrier: 'UPS',
        fulfilledAt: new Date().toISOString(),
      };
      mockService.fulfill.mockResolvedValue(mockOrder);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/orders/1/fulfill', {
        method: 'POST',
        body: JSON.stringify({
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
        }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockOrder);
      expect(mockService.fulfill).toHaveBeenCalledWith('1', '1Z999AA10123456784', 'UPS');
    });

    it('should fulfill order without tracking information', async () => {
      const mockOrder = {
        id: '1',
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString(),
      };
      mockService.fulfill.mockResolvedValue(mockOrder);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/orders/1/fulfill', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(200);
      expect(mockService.fulfill).toHaveBeenCalledWith('1', undefined, undefined);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/orders/1/fulfill', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(401);
      expect(mockService.fulfill).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Order not found');
      mockService.fulfill.mockRejectedValue(error);

      const params = Promise.resolve({ id: '999' });
      const request = new NextRequest('http://localhost:3000/api/orders/999/fulfill', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(500);
    });
  });
});

