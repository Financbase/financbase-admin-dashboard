/**
 * Expenses Categories API Tests
 * Tests for expense categories endpoints
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
import { GET, POST } from '@/app/api/expenses/categories/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ExpenseService
vi.mock('@/lib/services/expense-service', () => ({
  ExpenseService: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
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

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { ExpenseService } = await import('@/lib/services/expense-service');

describe('Expenses Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/expenses/categories', () => {
    it('should return categories for authenticated user', async () => {
      const mockCategories = [
        { id: 'cat_1', name: 'Office Supplies', color: '#FF5733' },
        { id: 'cat_2', name: 'Travel', color: '#33FF57' },
      ];
      vi.mocked(ExpenseService.getCategories).mockResolvedValue(mockCategories as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
      expect(ExpenseService.getCategories).toHaveBeenCalledWith('user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const response = await GET();

      expect(response.status).toBe(401);
      expect(ExpenseService.getCategories).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/expenses/categories', () => {
    it('should create a category for authenticated user', async () => {
      const newCategory = { id: 'cat_3', name: 'New Category', color: '#3357FF' };
      vi.mocked(ExpenseService.createCategory).mockResolvedValue(newCategory as any);

      const request = new NextRequest('http://localhost:3000/api/expenses/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Category', color: '#3357FF' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newCategory);
      expect(ExpenseService.createCategory).toHaveBeenCalledWith(
        'user-123',
        'New Category',
        expect.objectContaining({
          color: '#3357FF',
        })
      );
    });

    it('should return 400 if name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses/categories', {
        method: 'POST',
        body: JSON.stringify({ color: '#3357FF' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(ExpenseService.createCategory).not.toHaveBeenCalled();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/expenses/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Category' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});

