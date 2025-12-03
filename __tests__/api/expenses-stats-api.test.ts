/**
 * Expenses Stats API Tests
 * Tests for expense statistics endpoint
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
import { GET } from '@/app/api/expenses/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ExpenseService
vi.mock('@/lib/services/expense-service', () => ({
  ExpenseService: {
    getStats: vi.fn(),
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
const { ExpenseService } = await import('@/lib/services/expense-service');

describe('GET /api/expenses/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  it('should return expense stats for authenticated user', async () => {
    const mockStats = {
      totalExpenses: 5000,
      averageExpense: 250,
      expensesByCategory: {
        'Office Supplies': 2000,
        'Travel': 3000,
      },
      monthlyTrend: [
        { month: 'Jan', amount: 1500 },
        { month: 'Feb', amount: 2000 },
      ],
    };
    vi.mocked(ExpenseService.getStats).mockResolvedValue(mockStats as any);

    const request = new NextRequest('http://localhost:3000/api/expenses/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStats);
    expect(ExpenseService.getStats).toHaveBeenCalledWith('user-123', undefined);
    expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
  });

  it('should accept timeframe parameter', async () => {
    const mockStats = { totalExpenses: 5000 };
    vi.mocked(ExpenseService.getStats).mockResolvedValue(mockStats as any);

    const request = new NextRequest('http://localhost:3000/api/expenses/stats?timeframe=month');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(ExpenseService.getStats).toHaveBeenCalledWith('user-123', 'month');
  });

  it('should return 401 if unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const request = new NextRequest('http://localhost:3000/api/expenses/stats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(ExpenseService.getStats).not.toHaveBeenCalled();
  });
});

