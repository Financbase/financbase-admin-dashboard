/**
 * Accounts [id] API Tests
 * Tests for account detail, update, and delete endpoints
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
import { GET, PUT, DELETE } from '@/app/api/accounts/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AccountService
vi.mock('@/lib/services/account-service', () => ({
  AccountService: {
    getAccountById: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
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
const { AccountService } = await import('@/lib/services/account-service');

describe('Accounts [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/accounts/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return account when authenticated and account exists', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        accountName: 'Test Account',
        accountType: 'checking',
        balance: 1000.00,
      };
      vi.mocked(AccountService.getAccountById).mockResolvedValue(mockAccount as any);
      
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.account).toEqual(mockAccount);
      expect(AccountService.getAccountById).toHaveBeenCalledWith('account-123', 'user-123');
    });

    it('should return 404 when account not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(AccountService.getAccountById).mockResolvedValue(null);
      
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/accounts/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ accountName: 'Updated Account' }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123', {
        method: 'PUT',
        body: 'invalid json',
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should update account when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const updatedAccount = {
        id: 'account-123',
        accountName: 'Updated Account',
        accountType: 'savings',
      };
      vi.mocked(AccountService.updateAccount).mockResolvedValue(updatedAccount as any);
      
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123', {
        method: 'PUT',
        body: JSON.stringify({ accountName: 'Updated Account' }),
      });
      const response = await PUT(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.account).toEqual(updatedAccount);
    });
  });

  describe('DELETE /api/accounts/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should delete account when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(AccountService.deleteAccount).mockResolvedValue(undefined);
      
      const params = Promise.resolve({ id: 'account-123' });
      const request = new NextRequest('http://localhost:3000/api/accounts/account-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(AccountService.deleteAccount).toHaveBeenCalledWith('account-123', 'user-123');
    });
  });
});

