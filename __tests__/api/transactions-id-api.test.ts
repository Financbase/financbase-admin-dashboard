/**
 * Transactions [id] API Tests
 * Tests for transaction detail, update, and delete endpoints
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
import { GET, PUT, DELETE } from '@/app/api/transactions/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock TransactionService
vi.mock('@/lib/services/transaction-service', () => ({
  TransactionService: {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

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
const { TransactionService } = await import('@/lib/services/transaction-service');

describe('Transactions [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/transactions/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return transaction when authenticated and transaction exists', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockTransaction = {
        id: 'txn-123',
        userId: 'user-123',
        type: 'expense',
        amount: 100.00,
        currency: 'USD',
        description: 'Test transaction',
      };
      vi.mocked(TransactionService.getById).mockResolvedValue(mockTransaction as any);
      
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.transaction).toEqual(mockTransaction);
      expect(TransactionService.getById).toHaveBeenCalledWith('txn-123', 'user-123');
    });

    it('should return 404 when transaction not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(TransactionService.getById).mockResolvedValue(null);
      
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/transactions/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123', {
        method: 'PUT',
        body: JSON.stringify({ amount: 200.00 }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123', {
        method: 'PUT',
        body: 'invalid json',
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should update transaction when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const updatedTransaction = {
        id: 'txn-123',
        amount: 200.00,
        description: 'Updated transaction',
      };
      vi.mocked(TransactionService.update).mockResolvedValue(updatedTransaction as any);
      
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123', {
        method: 'PUT',
        body: JSON.stringify({ amount: 200.00 }),
      });
      const response = await PUT(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.transaction).toEqual(updatedTransaction);
    });
  });

  describe('DELETE /api/transactions/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete transaction when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(TransactionService.delete).mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: 'txn-123' });
      const request = new NextRequest('http://localhost:3000/api/transactions/txn-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(TransactionService.delete).toHaveBeenCalledWith('txn-123', 'user-123');
    });
  });
});

