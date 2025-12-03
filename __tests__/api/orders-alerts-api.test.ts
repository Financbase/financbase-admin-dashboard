/**
 * Orders Alerts API Tests
 * Tests for order alerts endpoint
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
import { GET } from '@/app/api/orders/alerts/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock OrdersService
vi.mock('@/lib/services/business/orders-service', () => ({
  OrdersService: vi.fn().mockImplementation(() => ({
    getAlerts: vi.fn(),
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

describe('Orders Alerts API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      getAlerts: vi.fn(),
    };
    vi.mocked(OrdersService).mockImplementation(() => mockService);
  });

  describe('GET /api/orders/alerts', () => {
    it('should return order alerts when authenticated', async () => {
      const mockAlerts = {
        alerts: [
          {
            id: '1',
            orderId: 'order-1',
            type: 'overdue',
            severity: 'high',
            message: 'Order is overdue',
          },
          {
            id: '2',
            orderId: 'order-2',
            type: 'low_stock',
            severity: 'medium',
            message: 'Low stock for order items',
          },
        ],
      };
      mockService.getAlerts.mockResolvedValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/orders/alerts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAlerts);
      expect(mockService.getAlerts).toHaveBeenCalled();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/orders/alerts');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(mockService.getAlerts).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockService.getAlerts.mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/orders/alerts');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });

    it('should set cache headers', async () => {
      mockService.getAlerts.mockResolvedValue({ alerts: [] });
      const request = new NextRequest('http://localhost:3000/api/orders/alerts');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });
  });
});

