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
import { GET } from '@/app/api/dashboard/executive-metrics/route';

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

describe('Dashboard Executive Metrics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard/executive-metrics', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/dashboard/executive-metrics');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return executive metrics when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      
      // Mock database responses
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_revenue: '125000.50' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_revenue: '100000.00' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ invoice_count: '45' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ invoice_count: '40' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ avg_invoice_value: '2777.78' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ client_count: '120' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ client_count: '110' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ total_invoices: '45', paid_invoices: '40' }],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [],
      } as any);
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [],
      } as any);

      // Mock fetch for top-products
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: [] }),
      });

      const request = new NextRequest('http://localhost:3000/api/dashboard/executive-metrics?period=30d');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalRevenue');
      expect(data).toHaveProperty('revenueChange');
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('totalOrders');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should handle different period parameters', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(db.execute).mockResolvedValue({
        rows: [{ total_revenue: '0', invoice_count: '0', client_count: '0', total_invoices: '0', paid_invoices: '0', avg_invoice_value: '0' }],
      } as any);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: [] }),
      });

      const periods = ['7d', '30d', '90d'];
      for (const period of periods) {
        const request = new NextRequest(`http://localhost:3000/api/dashboard/executive-metrics?period=${period}`);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(db.execute).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/dashboard/executive-metrics');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});

