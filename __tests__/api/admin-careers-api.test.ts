/**
 * Admin Careers API Tests
 * Tests for admin job postings endpoints
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
import { GET, POST } from '@/app/api/admin/careers/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

// Mock RBAC
vi.mock('@/lib/auth/financbase-rbac', () => ({
  checkPermission: vi.fn(),
  isManagerOrAbove: vi.fn(),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    forbidden: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 403 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
    validationError: vi.fn((error: any, requestId: string) => new Response(JSON.stringify({ error: 'Validation error' }), { status: 400 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { checkPermission, isManagerOrAbove } = await import('@/lib/auth/financbase-rbac');
const { db } = await import('@/lib/db');

describe('Admin Careers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
    vi.mocked(checkPermission).mockResolvedValue(true);
    vi.mocked(isManagerOrAbove).mockResolvedValue(true);
  });

  describe('GET /api/admin/careers', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/admin/careers');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 when user lacks permissions', async () => {
      vi.mocked(checkPermission).mockResolvedValue(false);
      vi.mocked(isManagerOrAbove).mockResolvedValue(false);
      const request = new NextRequest('http://localhost:3000/api/admin/careers');
      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    it('should return job postings when authenticated and authorized', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
        }),
      } as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce([
                  { id: 1, title: 'Software Engineer', status: 'published' },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/careers?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('jobs');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page', 1);
      expect(data.pagination).toHaveProperty('limit', 20);
    });

    it('should handle pagination parameters', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 50 }]),
        }),
      } as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce([]),
              }),
            }),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/careers?page=2&limit=25');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(25);
    });

    it('should filter by status when provided', async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 5 }]),
        }),
      } as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            orderBy: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockReturnValueOnce({
                offset: vi.fn().mockResolvedValueOnce([]),
              }),
            }),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/careers?status=published');
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/admin/careers', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/admin/careers', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Job', department: 'Engineering' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 when user lacks permissions', async () => {
      vi.mocked(checkPermission).mockResolvedValue(false);
      vi.mocked(isManagerOrAbove).mockResolvedValue(false);
      const request = new NextRequest('http://localhost:3000/api/admin/careers', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Job', department: 'Engineering' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/careers', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should create job posting when valid', async () => {
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([
            { id: 1, title: 'Software Engineer', department: 'Engineering' },
          ]),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/careers', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Software Engineer',
          department: 'Engineering',
          location: 'Remote',
          type: 'Full-time',
          experience: '5+ years',
          description: 'Test description',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('job');
      expect(data.job.title).toBe('Software Engineer');
    });
  });
});

