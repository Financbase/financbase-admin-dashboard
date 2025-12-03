/**
 * Projects [id] API Tests
 * Tests for project detail and update endpoints
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
import { GET, PUT } from '@/app/api/projects/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock FreelanceHubService
vi.mock('@/lib/services/freelance-hub-service', () => ({
  FreelanceHubService: {
    getProjectById: vi.fn(),
    updateProject: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { FreelanceHubService } = await import('@/lib/services/freelance-hub-service');

describe('Projects [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/projects/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123');
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should return project when authenticated and project exists', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        priority: 'high',
      };
      vi.mocked(FreelanceHubService.getProjectById).mockResolvedValue(mockProject as any);
      
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123');
      const response = await GET(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.project).toEqual(mockProject);
      expect(FreelanceHubService.getProjectById).toHaveBeenCalledWith('project-123', 'user-123');
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(FreelanceHubService.getProjectById).mockResolvedValue(null);
      
      const params = Promise.resolve({ id: 'non-existent' });
      const request = new NextRequest('http://localhost:3000/api/projects/non-existent');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(404);
    });

    it('should handle errors when project service fails', async () => {
      vi.mocked(FreelanceHubService.getProjectById).mockRejectedValue(new Error('Service error'));
      
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123');
      const response = await GET(request, { params });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/projects/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Project' }),
      });
      
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(401);
    });

    it('should update project when authenticated', async () => {
      const updateData = { name: 'Updated Project', status: 'completed' };
      const updatedProject = {
        id: 'project-123',
        userId: 'user-123',
        ...updateData,
        description: 'Test Description',
        priority: 'high',
      };
      vi.mocked(FreelanceHubService.updateProject).mockResolvedValue(updatedProject as any);
      
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request, { params });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.project).toEqual(updatedProject);
      expect(FreelanceHubService.updateProject).toHaveBeenCalledWith(
        'project-123',
        'user-123',
        expect.objectContaining(updateData)
      );
    });

    it('should return 400 for invalid request body', async () => {
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: 'invalid json',
      });
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should handle errors when update fails', async () => {
      vi.mocked(FreelanceHubService.updateProject).mockRejectedValue(new Error('Update failed'));
      
      const params = Promise.resolve({ id: 'project-123' });
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Project' }),
      });
      const response = await PUT(request, { params });
      
      expect(response.status).toBe(500);
    });
  });
});

