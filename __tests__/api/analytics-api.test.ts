/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/analytics/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    execute: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
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
const { db } = await import('@/lib/db');

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/analytics');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return analytics data when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      
      // Mock database responses
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_revenue: '125000.50' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_expenses: '45000.25' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_revenue: '100000.00' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_expenses: '50000.00' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ client_count: '45' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ client_count: '40' }],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/analytics?period=30d');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('revenue');
      expect(data).toHaveProperty('expenses');
      expect(data).toHaveProperty('netIncome');
      expect(data).toHaveProperty('clients');
    });

    it('should handle different period parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(db.execute).mockResolvedValue({
        rows: [{ total_revenue: '0', total_expenses: '0', client_count: '0' }],
      } as any);

      const periods = ['7d', '30d', '90d'];
      for (const period of periods) {
        const request = new NextRequest(`http://localhost:3000/api/analytics?period=${period}`);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(db.execute).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/analytics');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

