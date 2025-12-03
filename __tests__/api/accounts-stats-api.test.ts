/**
 * Accounts Stats API Tests
 * Tests for account statistics endpoint
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/accounts/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock AccountService
vi.mock('@/lib/services/account-service', () => ({
  AccountService: {
    getAccountStats: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { AccountService } = await import('@/lib/services/account-service');

describe('Accounts Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/accounts/stats', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      
      const response = await GET();
      
      expect(response.status).toBe(401);
    });

    it('should return account stats when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      const mockStats = {
        totalBalance: 150000.00,
        accountCount: 5,
        byType: {
          checking: 12500.00,
          savings: 45000.00,
          investment: 125000.00,
        },
      };
      vi.mocked(AccountService.getAccountStats).mockResolvedValue(mockStats as any);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('stats');
      expect(data.stats).toEqual(mockStats);
      expect(AccountService.getAccountStats).toHaveBeenCalledWith('user-123');
    });

    it('should return 500 on service error', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(AccountService.getAccountStats).mockRejectedValue(new Error('Service error'));
      
      const response = await GET();
      
      expect(response.status).toBe(500);
    });
  });
});

