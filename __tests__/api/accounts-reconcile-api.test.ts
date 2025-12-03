/**
 * Accounts Reconcile API Tests
 * Tests for account reconciliation endpoints
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
import { GET, POST } from '@/app/api/accounts/reconcile/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AccountService
vi.mock('@/lib/services/account-service', () => ({
  AccountService: {
    getReconciliationStatus: vi.fn(),
    reconcileAccount: vi.fn(),
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

const { auth } = await import('@clerk/nextjs/server');
const { AccountService } = await import('@/lib/services/account-service');

describe('Accounts Reconcile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/accounts/reconcile', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      const response = await GET();
      
      expect(response.status).toBe(401);
    });

    it('should return reconciliation status when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockStatus = {
        accounts: [
          { id: 'acc-1', needsReconciliation: false },
          { id: 'acc-2', needsReconciliation: true },
        ],
      };
      vi.mocked(AccountService.getReconciliationStatus).mockResolvedValue(mockStatus as any);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reconciliationStatus');
      expect(AccountService.getReconciliationStatus).toHaveBeenCalledWith('user-123');
    });
  });

  describe('POST /api/accounts/reconcile', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/accounts/reconcile', {
        method: 'POST',
        body: JSON.stringify({ accountId: 'acc-123', bankBalance: 1000.00 }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/reconcile', {
        method: 'POST',
        body: 'invalid json',
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should reconcile account when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const reconciledAccount = {
        id: 'acc-123',
        balance: 1000.00,
        reconciled: true,
      };
      vi.mocked(AccountService.reconcileAccount).mockResolvedValue(reconciledAccount as any);
      
      const request = new NextRequest('http://localhost:3000/api/accounts/reconcile', {
        method: 'POST',
        body: JSON.stringify({ accountId: 'acc-123', bankBalance: 1000.00 }),
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.account).toEqual(reconciledAccount);
      expect(AccountService.reconcileAccount).toHaveBeenCalledWith('acc-123', 'user-123', 1000.00);
    });
  });
});

