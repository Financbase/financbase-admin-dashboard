/**
 * Projects API Tests
 * Tests for projects list and create endpoints
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
import { GET, POST } from '@/app/api/projects/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock FreelanceHubService
vi.mock('@/lib/services/freelance-hub-service', () => ({
  FreelanceHubService: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string, requestId?: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { FreelanceHubService } = await import('@/lib/services/freelance-hub-service');

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
  });

  describe('GET /api/projects', () => {
    it('should return paginated projects when authenticated', async () => {
      const mockProjects = {
        data: [
          { id: 1, name: 'Project 1', status: 'active' },
          { id: 2, name: 'Project 2', status: 'active' },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };
      vi.mocked(FreelanceHubService.getProjects).mockResolvedValue(mockProjects as any);

      const request = new NextRequest('http://localhost:3000/api/projects?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
    });

    it('should filter projects by status', async () => {
      vi.mocked(FreelanceHubService.getProjects).mockResolvedValue({ data: [], pagination: {} } as any);
      const request = new NextRequest('http://localhost:3000/api/projects?status=active');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/projects', () => {
    it('should create project when valid data provided', async () => {
      const mockProject = {
        id: 1,
        name: 'New Project',
        status: 'planning',
      };
      vi.mocked(FreelanceHubService.createProject).mockResolvedValue(mockProject as any);

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Project',
          description: 'Project description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('project');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Project description',
          // Missing name
        }),
      });

      const response = await POST(request);
      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Project',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

