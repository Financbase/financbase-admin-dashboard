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
import { GET, PUT, DELETE } from '@/app/api/workflows/[id]/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock WorkflowService
vi.mock('@/lib/services/workflow-service', () => ({
  WorkflowService: {
    getWorkflow: vi.fn(),
    updateWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { WorkflowService } = await import('@/lib/services/workflow-service');

describe('Workflows ID API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/workflows/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid workflow ID', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows/invalid');
      const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });
      expect(response.status).toBe(400);
    });

    it('should return workflow when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.getWorkflow).mockResolvedValue({
        id: 1,
        name: 'Test Workflow',
        status: 'active',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/workflows/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should return 404 when workflow not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.getWorkflow).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/workflows/999');
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/workflows/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      expect(response.status).toBe(401);
    });

    it('should update workflow when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.updateWorkflow).mockResolvedValue({
        id: 1,
        name: 'Updated Workflow',
        status: 'active',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/workflows/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Workflow' }),
      });
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('name', 'Updated Workflow');
    });
  });

  describe('DELETE /api/workflows/{id}', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows/1', { method: 'DELETE' });
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
      expect(response.status).toBe(401);
    });

    it('should delete workflow when valid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.deleteWorkflow).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/workflows/1', { method: 'DELETE' });
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message', 'Workflow deleted successfully');
    });

    it('should return 404 when workflow not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.deleteWorkflow).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/workflows/999', { method: 'DELETE' });
      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });
      expect(response.status).toBe(404);
    });
  });
});

