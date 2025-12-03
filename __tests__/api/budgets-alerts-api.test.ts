/**
 * Budgets Alerts API Tests
 * Tests for budget alerts endpoint
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
import { GET } from '@/app/api/budgets/alerts/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock budget service function
const mockGetBudgetAlerts = vi.fn();

vi.mock('@/lib/services/budget-service', () => ({
  getBudgetAlerts: (...args: any[]) => mockGetBudgetAlerts(...args),
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

describe('Budgets Alerts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/budgets/alerts', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/budgets/alerts');
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return budget alerts when authenticated', async () => {
      const mockAlerts = [
        {
          budgetId: 1,
          category: 'Marketing',
          threshold: 80,
          currentSpending: 85,
          alertType: 'warning',
        },
        {
          budgetId: 2,
          category: 'Travel',
          threshold: 100,
          currentSpending: 120,
          alertType: 'exceeded',
        },
      ];
      mockGetBudgetAlerts.mockResolvedValue(mockAlerts);
      
      const request = new NextRequest('http://localhost:3000/api/budgets/alerts');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAlerts);
      expect(mockGetBudgetAlerts).toHaveBeenCalledWith('user-123');
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should return empty array when no alerts exist', async () => {
      mockGetBudgetAlerts.mockResolvedValue([]);
      
      const request = new NextRequest('http://localhost:3000/api/budgets/alerts');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle errors when service fails', async () => {
      mockGetBudgetAlerts.mockRejectedValue(new Error('Service error'));
      
      const request = new NextRequest('http://localhost:3000/api/budgets/alerts');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });
  });
});
