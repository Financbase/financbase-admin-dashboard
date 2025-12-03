/**
 * Bills Attention API Tests
 * Tests for bills requiring attention endpoint
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
import { GET } from '@/app/api/bills/attention/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock billPayService
vi.mock('@/lib/services/bill-pay/bill-pay-service', () => ({
  billPayService: {
    getBillsRequiringAttention: vi.fn(),
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
const { billPayService } = await import('@/lib/services/bill-pay/bill-pay-service');

describe('Bills Attention API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/bills/attention', () => {
    it('should return bills requiring attention for authenticated user', async () => {
      const mockBills = {
        overdue: [
          { id: 'bill_1', amount: 1000, dueDate: '2025-01-01' },
        ],
        pendingApproval: [
          { id: 'bill_2', amount: 500, status: 'pending_approval' },
        ],
      };
      vi.mocked(billPayService.getBillsRequiringAttention).mockResolvedValue(mockBills as any);

      const request = new NextRequest('http://localhost:3000/api/bills/attention');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.overdue).toBeDefined();
      expect(data.pendingApproval).toBeDefined();
      expect(billPayService.getBillsRequiringAttention).toHaveBeenCalledWith('user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/bills/attention');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
