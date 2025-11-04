/**
 * Feature Flags API Tests
 * Comprehensive tests for feature flags API endpoints including admin validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/feature-flags/route';
import { GET as GET_BY_KEY, PATCH, DELETE } from '@/app/api/feature-flags/[key]/route';
import { GET as GET_CHECK } from '@/app/api/feature-flags/check/route';
import { POST as POST_ENABLE } from '@/app/api/feature-flags/[key]/enable/route';
import { POST as POST_DISABLE } from '@/app/api/feature-flags/[key]/disable/route';

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
      json: async () => ({ error: message || 'Forbidden' }),
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

describe('/api/feature-flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/feature-flags', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
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

    it('should return feature flags when user is admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      const mockFlags = [
        {
          key: 'test-flag-1',
          name: 'Test Flag 1',
          enabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'test-flag-2',
          name: 'Test Flag 2',
          enabled: false,
          rolloutPercentage: 0,
        },
      ];

      vi.mocked(FeatureFlagsService.getAllFlags).mockResolvedValue(mockFlags as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFlags);
    });
  });

  describe('POST /api/feature-flags', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          key: 'new-flag',
          name: 'New Flag',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          key: 'new-flag',
          name: 'New Flag',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it('should create feature flag when user is admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      const newFlag = {
        key: 'new-flag',
        name: 'New Flag',
        description: 'A new feature flag',
        enabled: false,
        rolloutPercentage: 0,
      };

      vi.mocked(FeatureFlagsService.createFlag).mockResolvedValue(newFlag as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlag),
      });
      
      // Mock request.json() method
      request.json = vi.fn().mockResolvedValue(newFlag);
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(newFlag);
    });
  });
});

describe('/api/feature-flags/[key]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/feature-flags/[key]', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag');
      const response = await GET_BY_KEY(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 404 when flag does not exist', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(FeatureFlagsService.getFlag).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/non-existent');
      const response = await GET_BY_KEY(request, {
        params: Promise.resolve({ key: 'non-existent' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return feature flag with organization context', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);

      const mockFlag = {
        key: 'test-flag',
        name: 'Test Flag',
        enabled: true,
        rolloutPercentage: 100,
      };

      vi.mocked(FeatureFlagsService.getFlag).mockResolvedValue(mockFlag as any);
      vi.mocked(FeatureFlagsService.isEnabled).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag');
      const response = await GET_BY_KEY(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.enabledForUser).toBe(true);
      expect(FeatureFlagsService.isEnabled).toHaveBeenCalledWith('test-flag', {
        userId: 'user-123',
        organizationId: 'org-123',
      });
    });
  });

  describe('PATCH /api/feature-flags/[key]', () => {
    it('should return 403 when user is not admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag', {
        method: 'PATCH',
        body: JSON.stringify({ enabled: true }),
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(403);
    });

    it('should update feature flag when user is admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      const updatedFlag = {
        key: 'test-flag',
        name: 'Updated Flag',
        enabled: true,
      };

      vi.mocked(FeatureFlagsService.updateFlag).mockResolvedValue(updatedFlag as any);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: true }),
      });
      
      // Mock request.json() method
      request.json = vi.fn().mockResolvedValue({ enabled: true });
      
      const response = await PATCH(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedFlag);
    });
  });

  describe('DELETE /api/feature-flags/[key]', () => {
    it('should return 403 when user is not admin', async () => {
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

    it('should delete feature flag when user is admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');
      const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);
      vi.mocked(FeatureFlagsService.deleteFlag).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ key: 'test-flag' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted successfully');
    });
  });
});

describe('/api/feature-flags/[key]/enable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 when user is not admin', async () => {
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
    const response = await POST_ENABLE(request, {
      params: Promise.resolve({ key: 'test-flag' }),
    });

    expect(response.status).toBe(403);
  });

  it('should enable feature flag when user is admin', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    const { isAdmin } = await import('@/lib/auth/financbase-rbac');
    const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

    vi.mocked(auth).mockResolvedValue({
      userId: 'admin-123',
      orgId: 'org-123',
    } as any);
    vi.mocked(isAdmin).mockResolvedValue(true);

    const enabledFlag = {
      key: 'test-flag',
      enabled: true,
    };

    vi.mocked(FeatureFlagsService.enableFlag).mockResolvedValue(enabledFlag as any);

    const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag/enable', {
      method: 'POST',
    });
    const response = await POST_ENABLE(request, {
      params: Promise.resolve({ key: 'test-flag' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('enabled');
  });
});

describe('/api/feature-flags/[key]/disable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 when user is not admin', async () => {
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
    const response = await POST_DISABLE(request, {
      params: Promise.resolve({ key: 'test-flag' }),
    });

    expect(response.status).toBe(403);
  });

  it('should disable feature flag when user is admin', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    const { isAdmin } = await import('@/lib/auth/financbase-rbac');
    const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

    vi.mocked(auth).mockResolvedValue({
      userId: 'admin-123',
      orgId: 'org-123',
    } as any);
    vi.mocked(isAdmin).mockResolvedValue(true);

    const disabledFlag = {
      key: 'test-flag',
      enabled: false,
    };

    vi.mocked(FeatureFlagsService.disableFlag).mockResolvedValue(disabledFlag as any);

    const request = new NextRequest('http://localhost:3000/api/feature-flags/test-flag/disable', {
      method: 'POST',
    });
    const response = await POST_DISABLE(request, {
      params: Promise.resolve({ key: 'test-flag' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('disabled');
  });
});

describe('/api/feature-flags/check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when key is missing', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    vi.mocked(auth).mockResolvedValue({
      userId: 'user-123',
      orgId: 'org-123',
    } as any);

    const request = new NextRequest('http://localhost:3000/api/feature-flags/check');
    const response = await GET_CHECK(request);

    expect(response.status).toBe(400);
  });

  it('should check feature flag with organization context', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

    vi.mocked(auth).mockResolvedValue({
      userId: 'user-123',
      orgId: 'org-123',
    } as any);
    vi.mocked(FeatureFlagsService.isEnabled).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/feature-flags/check?key=test-flag');
    const response = await GET_CHECK(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.key).toBe('test-flag');
    expect(data.enabled).toBe(true);
    expect(FeatureFlagsService.isEnabled).toHaveBeenCalledWith('test-flag', {
      userId: 'user-123',
      organizationId: 'org-123',
    });
  });

  it('should handle missing orgId gracefully', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    const { FeatureFlagsService } = await import('@/lib/services/feature-flags-service');

    vi.mocked(auth).mockResolvedValue({
      userId: 'user-123',
      orgId: null,
    } as any);
    vi.mocked(FeatureFlagsService.isEnabled).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/feature-flags/check?key=test-flag');
    const response = await GET_CHECK(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.enabled).toBe(false);
    expect(FeatureFlagsService.isEnabled).toHaveBeenCalledWith('test-flag', {
      userId: 'user-123',
      organizationId: undefined,
    });
  });
});

