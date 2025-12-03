/**
 * Expenses Reject API Tests
 * Tests for expense rejection endpoint
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
import { POST } from '@/app/api/expenses/[id]/reject/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ExpenseService
vi.mock('@/lib/services/expense-service', () => ({
  ExpenseService: {
    getById: vi.fn(),
    reject: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { ExpenseService } = await import('@/lib/services/expense-service');

describe('Expenses Reject API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/expenses/{id}/reject', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1/reject', {
        method: 'POST',
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(401);
      expect(ExpenseService.getById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid expense ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'invalid' });
      const request = new NextRequest('http://localhost:3000/api/expenses/invalid/reject', {
        method: 'POST',
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(400);
      expect(ExpenseService.getById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid JSON in request body', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1/reject', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(400);
    });

    it('should return 404 when expense not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(ExpenseService.getById).mockResolvedValue(null as any);
      const params = Promise.resolve({ id: '999' });
      const request = new NextRequest('http://localhost:3000/api/expenses/999/reject', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Not compliant' }),
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(404);
      expect(ExpenseService.getById).toHaveBeenCalledWith(999, 'user-123');
    });

    it('should reject expense when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockExpense = {
        id: 1,
        userId: 'user-123',
        amount: '150.00',
        category: 'Office Supplies',
        status: 'pending',
      };
      const mockRejected = {
        id: 1,
        userId: 'user-123',
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'user-123',
        rejectionReason: 'Does not meet company policy',
      };

      vi.mocked(ExpenseService.getById).mockResolvedValue(mockExpense as any);
      vi.mocked(ExpenseService.reject).mockResolvedValue(mockRejected as any);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1/reject', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Does not meet company policy' }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRejected);
      expect(ExpenseService.getById).toHaveBeenCalledWith(1, 'user-123');
      expect(ExpenseService.reject).toHaveBeenCalledWith(1, 'user-123', 'user-123', 'Does not meet company policy');
    });

    it('should reject expense without reason', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockExpense = {
        id: 1,
        userId: 'user-123',
        amount: '150.00',
        category: 'Office Supplies',
        status: 'pending',
      };
      const mockRejected = {
        id: 1,
        userId: 'user-123',
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'user-123',
      };

      vi.mocked(ExpenseService.getById).mockResolvedValue(mockExpense as any);
      vi.mocked(ExpenseService.reject).mockResolvedValue(mockRejected as any);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1/reject', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRejected);
      expect(ExpenseService.reject).toHaveBeenCalledWith(1, 'user-123', 'user-123', undefined);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const error = new Error('Database error');
      vi.mocked(ExpenseService.getById).mockRejectedValue(error);

      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1/reject', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Test' }),
      });

      const response = await POST(request, { params });
      expect(response.status).toBe(500);
    });
  });
});

