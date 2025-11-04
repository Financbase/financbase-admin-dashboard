/**
 * Admin-Protected Endpoints Tests
 * Comprehensive tests to verify admin role validation across all protected endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock isAdmin
vi.mock('@/lib/auth/financbase-rbac', () => ({
  isAdmin: vi.fn(),
}));

// Mock FeatureFlagsService
vi.mock('@/lib/services/feature-flags-service', () => ({
  FeatureFlagsService: {
    getAllFlags: vi.fn(),
    getFlag: vi.fn(),
    createFlag: vi.fn(),
    updateFlag: vi.fn(),
    deleteFlag: vi.fn(),
    enableFlag: vi.fn(),
    disableFlag: vi.fn(),
    isEnabled: vi.fn(),
  },
}));

// Mock ApiErrorHandler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: () => ({
      json: async () => ({ error: 'Unauthorized' }),
      status: 401,
    }),
    forbidden: (message?: string) => ({
      json: async () => ({ error: message || 'Admin access required' }),
      status: 403,
    }),
    badRequest: (message?: string) => ({
      json: async () => ({ error: message || 'Bad Request' }),
      status: 400,
    }),
    notFound: (message?: string) => ({
      json: async () => ({ error: message || 'Not Found' }),
      status: 404,
    }),
    handle: (error: unknown) => ({
      json: async () => ({ error: 'Internal Server Error' }),
      status: 500,
    }),
  },
  generateRequestId: () => 'test-request-id',
}));

describe('Admin-Protected Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Flags Endpoints', () => {
    it('should require admin for GET /api/feature-flags', async () => {
      const { GET } = await import('@/app/api/feature-flags/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags');
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('should require admin for POST /api/feature-flags', async () => {
      const { POST } = await import('@/app/api/feature-flags/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'test', name: 'Test' }),
      });
      request.json = vi.fn().mockResolvedValue({ key: 'test', name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it('should require admin for PATCH /api/feature-flags/[key]', async () => {
      const { PATCH } = await import('@/app/api/feature-flags/[key]/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: true }),
      });
      request.json = vi.fn().mockResolvedValue({ enabled: true });
      const response = await PATCH(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(403);
    });

    it('should require admin for DELETE /api/feature-flags/[key]', async () => {
      const { DELETE } = await import('@/app/api/feature-flags/[key]/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(403);
    });

    it('should require admin for POST /api/feature-flags/[key]/enable', async () => {
      const { POST } = await import('@/app/api/feature-flags/[key]/enable/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag/enable', {
        method: 'POST',
      });
      const response = await POST(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(403);
    });

    it('should require admin for POST /api/feature-flags/[key]/disable', async () => {
      const { POST } = await import('@/app/api/feature-flags/[key]/disable/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag/disable', {
        method: 'POST',
      });
      const response = await POST(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Platform Hub Integrations Endpoints', () => {
    it('should require admin for POST /api/platform/hub/integrations', async () => {
      const { POST } = await import('@/app/api/platform/hub/integrations/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Integration',
          slug: 'test-integration',
          category: 'payment',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });
  });

  describe('Admin Access Validation Flow', () => {
    it('should check admin status before processing request', async () => {
      const { POST } = await import('@/app/api/feature-flags/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key: 'test', name: 'Test' }),
      });
      await POST(request);

      // Verify isAdmin was called
      expect(isAdmin).toHaveBeenCalled();
    });

    it('should allow admin users to access protected endpoints', async () => {
      const { GET } = await import('@/app/api/feature-flags/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);
      vi.mocked(FeatureFlagsService.getAllFlags).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/feature-flags');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(isAdmin).toHaveBeenCalled();
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { GET } = await import('@/app/api/feature-flags/route');
      const { auth } = await import('@clerk/nextjs/server');

      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for authenticated but non-admin users', async () => {
      const { POST } = await import('@/app/api/platform/hub/integrations/route');
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Integration',
          slug: 'test-integration',
          category: 'payment',
        }),
      });
      request.json = vi.fn().mockResolvedValue({
        name: 'Test Integration',
        slug: 'test-integration',
        category: 'payment',
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });
});

