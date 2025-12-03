/**
 * Dashboard Top Products API Tests
 * Tests for dashboard top products endpoint
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
import { GET } from '@/app/api/dashboard/top-products/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock neon database - need to handle dynamic import in getDbConnection
// The route uses sql`...` which is a tagged template function
const mockSqlFunction = vi.fn(() => Promise.resolve([
  { name: 'Product 1', revenue: 1000, sales: 10 },
  { name: 'Product 2', revenue: 800, sales: 8 },
]));

// Create a mock sql function that can be used as a tagged template
const mockSql = Object.assign(mockSqlFunction, {
  [Symbol.toStringTag]: 'Function',
});

vi.mock('@neondatabase/serverless', async () => {
  return {
    neon: vi.fn(() => mockSql),
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

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');

describe('Dashboard Top Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    
    // Reset mock to return products
    mockSqlFunction.mockResolvedValue([
      { name: 'Product 1', revenue: 1000, sales: 10 },
      { name: 'Product 2', revenue: 800, sales: 8 },
    ]);
    
    // Mock process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  });

  describe('GET /api/dashboard/top-products', () => {
    it('should return top products for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/dashboard/top-products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toBeDefined();
      expect(Array.isArray(data.products)).toBe(true);
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should handle sortBy parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/dashboard/top-products?sortBy=sales');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/dashboard/top-products?limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/dashboard/top-products');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});

