/**
 * Freelancers Dashboard API Tests
 * Tests for freelancers dashboard endpoint
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
import { GET } from '@/app/api/freelancers/dashboard/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', async () => {
  const { vi } = await import('vitest');
  
  const mockFreelancers = [
    {
      id: 'freelancer_1',
      userId: 'user-123',
      displayName: 'John Doe',
      title: 'Web Developer',
      rating: 4.8,
      specialties: ['React', 'Node.js'],
      avatarUrl: 'https://example.com/avatar.jpg',
      status: 'available' as const,
    },
  ];
  
  const createThenableQuery = (result: any[] = []) => {
    const query: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve(result),
    };
    return query;
  };
  
  return {
    db: {
      select: vi.fn((selector?: any) => {
        if (selector && typeof selector === 'function') {
          // For count queries
          return createThenableQuery([{ count: 10 }]);
        }
        // For regular select queries
        if (selector && selector.count) {
          return createThenableQuery([{ count: 10 }]);
        }
        return createThenableQuery(mockFreelancers);
      }),
    },
  };
});

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', left: a, right: b })),
  and: vi.fn((...args) => ({ type: 'and', conditions: args })),
  desc: vi.fn((a) => ({ type: 'desc', column: a })),
  sql: vi.fn((strings, ...values) => ({ type: 'sql', strings, values })),
  gte: vi.fn((a, b) => ({ type: 'gte', left: a, right: b })),
  count: vi.fn(() => ({ type: 'count' })),
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

describe('Freelancers Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/freelancers/dashboard', () => {
    it('should return dashboard statistics for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/freelancers/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.topFreelancers).toBeDefined();
      expect(data.data.dashboardStats).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/freelancers/dashboard');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});

