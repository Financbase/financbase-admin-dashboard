/**
 * Reconciliation Match API Tests
 * Tests for reconciliation match endpoints
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
import { POST } from '@/app/api/reconciliation/match/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AIMatchingEngine
vi.mock('@/lib/reconciliation/ai-matching-engine', () => {
  const mockInstance = {
    findOptimalMatches: vi.fn(),
  };
  return {
    AIMatchingEngine: mockInstance,
    __mockInstance: mockInstance,
  };
});

// Mock database
vi.mock('@/lib/db', () => {
  const mockDb = {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([])),
    })),
  };
  return {
    db: mockDb,
    __mockDb: mockDb,
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

const { auth } = await import('@clerk/nextjs/server');
const { __mockInstance: mockAIMatchingEngine } = await import('@/lib/reconciliation/ai-matching-engine');

describe('Reconciliation Match API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('POST /api/reconciliation/match', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/match', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-123',
          statementTransactions: [],
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('should create matches when authenticated with valid data', async () => {
      const mockMatchResult = {
        matches: [
          {
            statementTransaction: { id: 'stmt-1', amount: 100, description: 'Test', date: new Date(), reference: 'REF-1' },
            bookTransaction: { id: 'book-1', amount: 100, description: 'Test', date: new Date(), reference: 'REF-1' },
            confidence: 0.95,
            score: 0.95,
            criteria: 'exact_match',
            reason: 'Exact amount and date match',
          },
        ],
        unmatchedStatements: [],
        unmatchedBooks: [],
        confidence: 0.95,
        aiInsights: [],
      };
      mockAIMatchingEngine.findOptimalMatches.mockResolvedValue(mockMatchResult);
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/match', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-123',
          statementTransactions: [
            { id: 'stmt-1', amount: 100, description: 'Test', date: new Date().toISOString(), reference: 'REF-1' },
          ],
        }),
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.matches).toHaveLength(1);
      expect(mockAIMatchingEngine.findOptimalMatches).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/reconciliation/match', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-123',
          // Missing statementTransactions
        }),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle errors when matching fails', async () => {
      mockAIMatchingEngine.findOptimalMatches.mockRejectedValue(new Error('Matching failed'));
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/match', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-123',
          statementTransactions: [],
        }),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});
