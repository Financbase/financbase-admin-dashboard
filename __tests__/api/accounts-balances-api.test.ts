/**
 * Accounts Balances API Tests
 * Tests for account balances endpoint
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
import { GET } from '@/app/api/accounts/balances/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
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

describe('Accounts Balances API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/accounts/balances', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      const response = await GET();
      
      expect(response.status).toBe(401);
    });

    it('should return account balances when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('balances');
      expect(data.balances).toHaveProperty('checking');
      expect(data.balances).toHaveProperty('savings');
      expect(data.balances).toHaveProperty('investment');
      expect(data.balances).toHaveProperty('credit');
      expect(data.balances.checking).toHaveProperty('balance');
      expect(data.balances.checking).toHaveProperty('change');
      expect(data.balances.checking).toHaveProperty('accountNumber');
      expect(data.balances.checking).toHaveProperty('bankName');
    });
  });
});

