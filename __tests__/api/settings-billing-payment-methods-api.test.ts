/**
 * Settings Billing Payment Methods API Tests
 * Tests for payment methods management endpoints
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
import { GET, POST } from '@/app/api/settings/billing/payment-methods/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { db } = await import('@/lib/db');

describe('Settings Billing Payment Methods API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/settings/billing/payment-methods', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return payment methods when authenticated', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 2 }]),
        }),
      } as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce([
                  { id: 1, type: 'card', last4: '1234', brand: 'visa', isDefault: true },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('paymentMethods');
      expect(data).toHaveProperty('pagination');
    });

    it('should handle pagination parameters', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
        }),
      } as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce([]),
              }),
            }),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods?page=2&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/settings/billing/payment-methods', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          type: 'card',
          stripePaymentMethodId: 'pm_123',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should create payment method when valid', async () => {
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(undefined),
        }),
      } as any);
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([
            {
              id: 1,
              type: 'card',
              last4: '1234',
              brand: 'visa',
              isDefault: false,
              status: 'active',
            },
          ]),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/settings/billing/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          type: 'card',
          stripePaymentMethodId: 'pm_1234567890',
          last4: '1234',
          brand: 'visa',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('paymentMethod');
      expect(data.paymentMethod.type).toBe('card');
    });
  });
});

