/**
 * Transactions API Tests
 * Tests for transactions list and create endpoints
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
import { GET, POST } from '@/app/api/transactions/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock TransactionService
vi.mock('@/lib/services/transaction-service', () => {
  const mockTransactionService = {
    getAll: vi.fn(),
    create: vi.fn(),
  };
  return {
    TransactionService: mockTransactionService,
  };
});

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    validationError: vi.fn((error: any, requestId: string) => new Response(JSON.stringify({ error: 'Validation error', details: error.issues }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { TransactionService } = await import('@/lib/services/transaction-service');
const { z } = await import('zod');

describe('Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
  });

  describe('GET /api/transactions', () => {
    it('should return transactions for authenticated user', async () => {
      const mockTransactions = [
        { id: 'txn_1', amount: 1000, type: 'income', status: 'completed' },
        { id: 'txn_2', amount: 500, type: 'expense', status: 'pending' },
      ];
      vi.mocked(TransactionService.getAll).mockResolvedValue(mockTransactions as any);

      const request = new NextRequest('http://localhost:3000/api/transactions?limit=50&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toEqual(mockTransactions);
      expect(TransactionService.getAll).toHaveBeenCalledWith('user-123', expect.any(Object));
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/transactions');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(TransactionService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/transactions', () => {
    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when required fields are missing', async () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['type'],
          message: 'Type is required',
        },
      ]);

      vi.mocked(TransactionService.create).mockImplementation(() => {
        throw zodError;
      });

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ amount: 1000 }), // Missing type
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should create transaction when valid', async () => {
      const newTransaction = {
        id: 'txn_3',
        amount: 1500,
        type: 'expense',
        status: 'completed',
      };
      vi.mocked(TransactionService.create).mockResolvedValue(newTransaction as any);

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'expense',
          amount: 1500,
          description: 'Test transaction',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.transaction).toEqual(newTransaction);
      expect(TransactionService.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'expense',
        amount: 1500,
        userId: 'user-123',
      }));
    });
  });
});

