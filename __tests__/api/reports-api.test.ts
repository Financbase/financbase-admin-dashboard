/**
 * Reports API Tests
 * Tests for reports list and create endpoints
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
import { GET, POST } from '@/app/api/reports/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => ([])),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => ([])),
      })),
    })),
  },
}));

// Mock withRLS
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: vi.fn((callback) => {
    return callback('user-123');
  }),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { db } = await import('@/lib/db');

describe('Reports API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('should return reports when authenticated', async () => {
      const mockReports = [
        { id: '1', name: 'Monthly Report', type: 'revenue', userId: 'user-123', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Quarterly Report', type: 'expenses', userId: 'user-123', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => (mockReports)),
              })),
            })),
          })),
        })),
      } as any);
      
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ([{ count: 2 }])),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockReports);
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should filter reports by type', async () => {
      const mockReports = [
        { id: '1', name: 'Revenue Report', type: 'revenue', userId: 'user-123', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => (mockReports)),
              })),
            })),
          })),
        })),
      } as any);
      
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ([{ count: 1 }])),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/reports?type=revenue');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockReports);
    });

    it('should handle pagination', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => ([])),
              })),
            })),
          })),
        })),
      } as any);
      
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ([{ count: 10 }])),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/reports?limit=5&offset=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.totalPages).toBe(2);
    });
  });

  describe('POST /api/reports', () => {
    it('should create report when valid data provided', async () => {
      const mockReport = {
        id: '1',
        userId: 'user-123',
        name: 'New Report',
        type: 'revenue',
        description: 'A new report',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => ([mockReport])),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Report',
          type: 'revenue',
          description: 'A new report',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockReport);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Report',
          // Missing type
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

