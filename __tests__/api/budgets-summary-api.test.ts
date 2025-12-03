/**
 * Budgets Summary API Tests
 * Tests for budget summary endpoint
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
import { GET } from '@/app/api/budgets/summary/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock budget service
vi.mock('@/lib/services/budget-service', () => ({
  getBudgetSummary: vi.fn(),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { getBudgetSummary } = await import('@/lib/services/budget-service');

describe('GET /api/budgets/summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  it('should return budget summary for authenticated user', async () => {
    const mockSummary = {
      totalBudgets: 5,
      totalBudgeted: 50000,
      totalSpent: 30000,
      totalRemaining: 20000,
      byCategory: {
        Marketing: { budgeted: 10000, spent: 6000 },
        Travel: { budgeted: 5000, spent: 3000 },
      },
    };
    vi.mocked(getBudgetSummary).mockResolvedValue(mockSummary as any);

    const request = new NextRequest('http://localhost:3000/api/budgets/summary');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSummary);
    expect(getBudgetSummary).toHaveBeenCalledWith('user-123');
    expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
  });

  it('should return 401 if unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const request = new NextRequest('http://localhost:3000/api/budgets/summary');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(getBudgetSummary).not.toHaveBeenCalled();
  });
});
