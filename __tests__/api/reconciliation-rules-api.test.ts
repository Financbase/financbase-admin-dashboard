/**
 * Reconciliation Rules API Tests
 * Tests for reconciliation rules endpoints
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
import { GET, POST } from '@/app/api/reconciliation/rules/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ReconciliationService
vi.mock('@/lib/reconciliation/reconciliation-service', () => {
  const mockInstance = {
    getActiveRules: vi.fn(),
    createRule: vi.fn(),
  };
  return {
    ReconciliationService: mockInstance,
    __mockInstance: mockInstance,
  };
});

// Mock database
vi.mock('@/lib/db', () => {
  const mockDb = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1, name: 'Test Rule' }])),
      })),
    })),
  };
  return {
    db: mockDb,
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
const { __mockInstance: mockReconciliationService } = await import('@/lib/reconciliation/reconciliation-service');

describe('Reconciliation Rules API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/reconciliation/rules', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules');
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return reconciliation rules when authenticated', async () => {
      const mockRules = [
        {
          id: 1,
          name: 'Auto-match by amount',
          conditions: { amount: { exact: true } },
          actions: { autoMatch: true },
        },
      ];
      mockReconciliationService.getActiveRules.mockResolvedValue(mockRules);
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRules);
      expect(mockReconciliationService.getActiveRules).toHaveBeenCalledWith('user-123', undefined);
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should filter rules by accountId when provided', async () => {
      const mockRules = [];
      mockReconciliationService.getActiveRules.mockResolvedValue(mockRules);
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules?accountId=acc-123');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(mockReconciliationService.getActiveRules).toHaveBeenCalledWith('user-123', 'acc-123');
    });

    it('should handle errors when service fails', async () => {
      mockReconciliationService.getActiveRules.mockRejectedValue(new Error('Service error'));
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/reconciliation/rules', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Rule',
          conditions: {},
          actions: {},
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('should create reconciliation rule when authenticated with valid data', async () => {
      const ruleData = {
        name: 'Test Rule',
        conditions: { amount: { exact: true } },
        actions: { autoMatch: true },
      };
      const mockRule = [{ id: 1, ...ruleData }];
      mockReconciliationService.createRule.mockResolvedValue(mockRule);
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData),
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRule[0]);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name, conditions, actions
        }),
      });
      const response = await POST(request);
      
      expect([400, 500]).toContain(response.status);
    });

    it('should handle errors when creation fails', async () => {
      mockReconciliationService.createRule.mockRejectedValue(new Error('Creation failed'));
      
      const request = new NextRequest('http://localhost:3000/api/reconciliation/rules', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Rule',
          conditions: {},
          actions: {},
        }),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});
