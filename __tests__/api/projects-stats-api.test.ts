/**
 * Projects Stats API Tests
 * Tests for project statistics endpoint
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/projects/stats/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock FreelanceHubService
vi.mock('@/lib/services/freelance-hub-service', () => ({
  FreelanceHubService: {
    getProjectStats: vi.fn(),
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
const { FreelanceHubService } = await import('@/lib/services/freelance-hub-service');

describe('GET /api/projects/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  it('should return project stats for authenticated user', async () => {
    const mockStats = {
      totalProjects: 45,
      activeProjects: 12,
      completedProjects: 30,
      totalRevenue: 250000,
      averageProjectValue: 5555.56,
    };
    vi.mocked(FreelanceHubService.getProjectStats).mockResolvedValue(mockStats as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toEqual(mockStats);
    expect(FreelanceHubService.getProjectStats).toHaveBeenCalledWith('user-123');
    expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=120, stale-while-revalidate=300');
  });

  it('should return 401 if unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const response = await GET();

    expect(response.status).toBe(401);
    expect(FreelanceHubService.getProjectStats).not.toHaveBeenCalled();
  });
});

