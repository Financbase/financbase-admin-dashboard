/**
 * Budgets [id] API Tests
 * Tests for budget detail, update, and delete endpoints
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
import { GET, PATCH, DELETE } from '@/app/api/budgets/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock budget service functions
const mockGetBudgetById = vi.fn();
const mockUpdateBudget = vi.fn();
const mockDeleteBudget = vi.fn();

vi.mock('@/lib/services/budget-service', () => ({
  getBudgetById: (...args: any[]) => mockGetBudgetById(...args),
  updateBudget: (...args: any[]) => mockUpdateBudget(...args),
  deleteBudget: (...args: any[]) => mockDeleteBudget(...args),
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

describe('Budgets [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/budgets/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/budgets/1');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return budget when authenticated and budget exists', async () => {
      const mockBudget = {
        id: 1,
        category: 'Marketing',
        amount: 10000,
        spent: 5000,
        status: 'active',
      };
      mockGetBudgetById.mockResolvedValue(mockBudget);
      
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/budgets/1');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBudget);
      expect(mockGetBudgetById).toHaveBeenCalledWith(1, 'user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should return 400 for invalid budget ID', async () => {
      const params = Promise.resolve({ id: 'invalid' });
      const request = new NextRequest('http://localhost:3000/api/budgets/invalid');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should return 404 when budget not found', async () => {
      mockGetBudgetById.mockResolvedValue(null);
      
      const params = Promise.resolve({ id: '999' });
      const request = new NextRequest('http://localhost:3000/api/budgets/999');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/budgets/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = { id: '1' };
      const request = new NextRequest('http://localhost:3000/api/budgets/1', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 15000 }),
      });
      
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update budget when authenticated', async () => {
      const updateData = { amount: 15000 };
      const updatedBudget = {
        id: 1,
        category: 'Marketing',
        ...updateData,
        spent: 5000,
        status: 'active',
      };
      mockUpdateBudget.mockResolvedValue(updatedBudget);
      
      const params = { id: '1' };
      const request = new NextRequest('http://localhost:3000/api/budgets/1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedBudget);
    });

    it('should return 400 for invalid budget ID', async () => {
      const params = { id: 'invalid' };
      const request = new NextRequest('http://localhost:3000/api/budgets/invalid', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 15000 }),
      });
      const response = await PATCH(request, { params });
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/budgets/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: '1' });
      const request = new NextRequest('http://localhost:3000/api/budgets/1', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete budget when authenticated', async () => {
      mockDeleteBudget.mockResolvedValue(undefined);
      
      const params = { id: '1' };
      const request = new NextRequest('http://localhost:3000/api/budgets/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDeleteBudget).toHaveBeenCalledWith(1, 'user-123');
    });

    it('should return 400 for invalid budget ID', async () => {
      const params = { id: 'invalid' };
      const request = new NextRequest('http://localhost:3000/api/budgets/invalid', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(400);
    });
  });
});
