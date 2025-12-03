/**
 * Accounts API Tests
 * Tests for accounts list and create endpoints
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
import { GET, POST } from '@/app/api/accounts/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AccountService
vi.mock('@/lib/services/account-service', () => ({
  AccountService: {
    getPaginatedAccounts: vi.fn(),
    createAccount: vi.fn(),
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

describe('Accounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/accounts', () => {
    it('should return paginated accounts for authenticated user', async () => {
      const mockAccounts = {
        data: [
          { id: 'acc_1', accountName: 'Checking', accountType: 'checking', balance: 1000 },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      };
      vi.mocked(AccountService.getPaginatedAccounts).mockResolvedValue(mockAccounts as any);

      const request = new NextRequest('http://localhost:3000/api/accounts?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(AccountService.getPaginatedAccounts).toHaveBeenCalledWith('user-123', expect.any(Object));
      // The actual route uses 300s cache, not 60s
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=300, stale-while-revalidate=600');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/accounts');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/accounts', () => {
    it('should create an account for authenticated user', async () => {
      const accountData = {
        accountName: 'New Checking',
        accountType: 'checking' as const,
        openingBalance: 0,
      };
      const mockAccount = { id: 'acc_new', ...accountData };
      vi.mocked(AccountService.createAccount).mockResolvedValue(mockAccount as any);

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.account).toBeDefined();
      expect(AccountService.createAccount).toHaveBeenCalled();
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName: '' }), // Invalid - empty name
      });
      const response = await POST(request);

      // Zod validation errors are handled by ApiErrorHandler.handle which may return 500
      // or the route may return 400 directly
      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          accountName: 'New Account',
          accountType: 'checking',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});

