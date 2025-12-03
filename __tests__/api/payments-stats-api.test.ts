/**
 * Payments Stats API Tests
 * Tests for payment statistics endpoint
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/payments/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock PaymentService
vi.mock('@/lib/services/payment-service', () => ({
  PaymentService: {
    getPaymentStats: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { PaymentService } = await import('@/lib/services/payment-service');

describe('GET /api/payments/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  it('should return payment stats for authenticated user', async () => {
    const mockStats = {
      totalPayments: 150,
      totalAmount: 50000,
      averageAmount: 333.33,
      paymentsByStatus: {
        completed: 140,
        pending: 10,
      },
      paymentsByType: {
        credit_card: 100,
        bank_transfer: 50,
      },
      monthlyTrend: [
        { month: 'Jan', count: 45, amount: 15000 },
        { month: 'Feb', count: 50, amount: 17000 },
      ],
    };
    vi.mocked(PaymentService.getPaymentStats).mockResolvedValue(mockStats as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toEqual(mockStats);
    expect(PaymentService.getPaymentStats).toHaveBeenCalledWith('user-123');
    expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
  });

  it('should return 401 if unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const response = await GET();

    expect(response.status).toBe(401);
    expect(PaymentService.getPaymentStats).not.toHaveBeenCalled();
  });
});
