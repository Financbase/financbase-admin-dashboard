/**
 * Expenses API Tests
 * Tests for expenses list and create endpoints
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/expenses/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock database - use thenable pattern like clients test
vi.mock('@/lib/db', async () => {
  const { vi } = await import('vitest');
  
  const mockExpenses = [
    {
      id: 1,
      userId: 'user-123',
      amount: 50,
      description: 'Test Expense',
      category: 'Food',
      date: new Date(),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[] = []) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve(result),
    };
    return query;
  };
  
  // The route does: 
  // 1. db.select().from(expenses).where(...).limit(...).offset(...) - for data
  // 2. db.select({ count: count() }).from(expenses).where(...) - for count
  // We need to handle both patterns
  const mockSelectFn = vi.fn();
  
  // First call returns data query, second call returns count query
  mockSelectFn
    .mockReturnValueOnce(createThenableQuery(mockExpenses)) // First: data
    .mockReturnValueOnce(createThenableQuery([{ count: mockExpenses.length }])); // Second: count
  
  return {
    db: {
      select: mockSelectFn,
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockExpenses[0]])),
        })),
      })),
    },
  };
});

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', left: a, right: b })),
  count: vi.fn(() => ({ type: 'count' })),
  and: vi.fn((...args) => ({ type: 'and', conditions: args })),
  gte: vi.fn((a, b) => ({ type: 'gte', left: a, right: b })),
  lte: vi.fn((a, b) => ({ type: 'lte', left: a, right: b })),
  like: vi.fn((a, b) => ({ type: 'like', left: a, right: b })),
}));

// Mock withRLS - properly handle the wrapper
// withRLS returns a Promise<NextResponse>, so we need to make sure it's properly awaited
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: vi.fn((handler, options = {}) => {
    return async (req: NextRequest) => {
      const { auth } = await import('@clerk/nextjs/server');
      const authResult = await auth();
      if (!authResult?.userId) {
        const { ApiErrorHandler } = await import('@/lib/api-error-handler');
        return await ApiErrorHandler.unauthorized();
      }
      // Mock setRLSContextFromClerkId
      const { setRLSContextFromClerkId } = await import('@/lib/db/rls-context');
      await setRLSContextFromClerkId(authResult.userId, null);
      // Call the handler with userId, clerkUser (undefined), and request
      // The handler returns a Promise<NextResponse>, so await it
      return await handler(authResult.userId, undefined, req);
    };
  }),
}));

// Mock RLS context
vi.mock('@/lib/db/rls-context', () => ({
  setRLSContextFromClerkId: vi.fn(() => Promise.resolve(true)),
  getUserFromDatabase: vi.fn(),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new NextResponse(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })),
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

const { withRLS } = await import('@/lib/api/with-rls');

describe('Expenses API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    
    // Default withRLS mock - calls the handler with userId and returns Promise<NextResponse>
    // withRLS signature: (handler, options?) => Promise<NextResponse>
    // The route does: return withRLS(async (userId) => {...}, { request: req })
    // So withRLS is called immediately with the handler and options, and returns a Promise<NextResponse>
    vi.mocked(withRLS).mockImplementation(async (handler, options = {}) => {
      const { auth } = await import('@clerk/nextjs/server');
      const authResult = await auth();
      if (!authResult?.userId) {
        const { ApiErrorHandler } = await import('@/lib/api-error-handler');
        return await ApiErrorHandler.unauthorized();
      }
      // Mock setRLSContextFromClerkId
      const { setRLSContextFromClerkId } = await import('@/lib/db/rls-context');
      await setRLSContextFromClerkId(authResult.userId, null);
      // Call the handler with userId, clerkUser (undefined), and request (from options)
      // The handler signature is (userId, clerkUser, request) => Promise<NextResponse>
      const request = (options as any).request;
      return await handler(authResult.userId, undefined, request);
    });
  });

  describe('GET /api/expenses', () => {
    it('should return paginated expenses for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses?page=1&limit=10');
      const response = await GET(request);
      
      // withRLS returns a Promise<NextResponse>
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/expenses');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create an expense for authenticated user', async () => {
      const expenseData = {
        amount: 50,
        description: 'Test Expense',
        category: 'Food',
        date: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      const response = await POST(request);
      
      // withRLS returns a Promise<NextResponse>
      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50,
          description: 'Test',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});
