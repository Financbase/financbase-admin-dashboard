/**
 * Reconciliation Sessions API Tests
 * Tests for reconciliation sessions endpoints
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
import { GET, POST } from '@/app/api/reconciliation/sessions/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ReconciliationService
vi.mock('@/lib/reconciliation/reconciliation-service', () => ({
  ReconciliationService: {
    createReconciliationSession: vi.fn(),
  },
}));

// Mock AIMatchingEngine
vi.mock('@/lib/reconciliation/ai-matching-engine', () => ({
  AIMatchingEngine: {},
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', left: a, right: b })),
  desc: vi.fn((a) => ({ type: 'desc', column: a })),
  count: vi.fn(() => ({ type: 'count' })),
}));

// Mock database schemas
vi.mock('@/lib/db/schemas/reconciliation.schema', () => ({
  reconciliationSessions: {},
  reconciliationMatches: {},
}));

// Mock database
const mockDbSelect = vi.fn();
vi.mock('@/lib/db', () => {
  const mockSelect = vi.fn();
  return {
    db: {
      select: mockSelect,
    },
  };
});

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
const { ReconciliationService } = await import('@/lib/reconciliation/reconciliation-service');
const { db } = await import('@/lib/db');

describe('Reconciliation Sessions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/reconciliation/sessions', () => {
    it('should return paginated sessions for authenticated user', async () => {
      // Mock the count query - first call for count (select({ count: count() }))
      const mockCountResult = [{ count: 1 }];
      const mockCountFrom = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockCountResult)),
      }));
      const mockCountChain = {
        from: mockCountFrom,
      };
      
      // Mock the data query - second call for data (select())
      const mockDataResult = [
        { id: 'session_1', name: 'Test Session', status: 'in_progress' },
      ];
      const mockDataOffset = vi.fn(() => Promise.resolve(mockDataResult));
      const mockDataLimit = vi.fn(() => ({ offset: mockDataOffset }));
      const mockDataOrderBy = vi.fn(() => ({ limit: mockDataLimit }));
      const mockDataWhere = vi.fn(() => ({ orderBy: mockDataOrderBy }));
      const mockDataFrom = vi.fn(() => ({ where: mockDataWhere }));
      const mockDataChain = {
        from: mockDataFrom,
      };
      
      // First call returns count chain, second call returns data chain
      // The route calls db.select() twice - once with count(), once without
      vi.mocked(db.select)
        .mockReturnValueOnce(mockCountChain as any) // First call: select({ count: count() })
        .mockReturnValueOnce(mockDataChain as any); // Second call: select()

      const request = new NextRequest('http://localhost:3000/api/reconciliation/sessions?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/sessions');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/reconciliation/sessions', () => {
    it('should create a reconciliation session for authenticated user', async () => {
      const sessionData = {
        accountId: 'acc_123',
        name: 'Q1 2025 Reconciliation',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        type: 'bank_statement',
      };
      const mockSession = [{ id: 'session_new', ...sessionData }];
      vi.mocked(ReconciliationService.createReconciliationSession).mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/reconciliation/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(ReconciliationService.createReconciliationSession).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/reconciliation/sessions', {
        method: 'POST',
        body: JSON.stringify({ accountId: 'acc_123' }), // Missing name, startDate, endDate
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/sessions', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'acc_123',
          name: 'Test',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});
