/**
 * Expenses [id] API Tests
 * Tests for expense detail, update, and delete endpoints
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
import { GET, PUT, DELETE } from '@/app/api/expenses/[id]/route';

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
const { ExpenseService } = await import('@/lib/services/expense-service');

describe('Expenses [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/expenses/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid expense ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'invalid' });
      const request = new NextRequest('http://localhost:3000/api/expenses/invalid');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should return expense when authenticated and expense exists', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockExpense = {
        id: 1,
        userId: 'user-123',
        amount: 150.00,
        category: 'Office Supplies',
        status: 'pending',
        date: new Date(),
      };
      vi.mocked(ExpenseService.getById).mockResolvedValue(mockExpense as any);
      
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockExpense);
      expect(ExpenseService.getById).toHaveBeenCalledWith(1, 'user-123');
    });

    it('should return 404 when expense not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(ExpenseService.getById).mockResolvedValue(null);
      
      const params = Promise.resolve({ id: '999' });
      const request = new NextRequest('http://localhost:3000/api/expenses/999');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/expenses/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1', {
        method: 'PUT',
        body: JSON.stringify({ amount: 200.00 }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid expense ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'invalid' });
      const request = new NextRequest('http://localhost:3000/api/expenses/invalid', {
        method: 'PUT',
        body: JSON.stringify({ amount: 200.00 }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid request body', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1', {
        method: 'PUT',
        body: 'invalid json',
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should update expense when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const updatedExpense = {
        id: 1,
        amount: 200.00,
        category: 'Travel',
      };
      vi.mocked(ExpenseService.update).mockResolvedValue(updatedExpense as any);
      
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1', {
        method: 'PUT',
        body: JSON.stringify({ amount: 200.00, category: 'Travel' }),
      });
      const response = await PUT(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedExpense);
    });
  });

  describe('DELETE /api/expenses/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid expense ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'invalid' });
      const request = new NextRequest('http://localhost:3000/api/expenses/invalid', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should delete expense when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(ExpenseService.delete).mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/expenses/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(ExpenseService.delete).toHaveBeenCalledWith(1, 'user-123');
    });
  });
});

