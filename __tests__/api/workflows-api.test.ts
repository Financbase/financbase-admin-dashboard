/**
 * Workflows API Tests
 * Tests for workflows list and create endpoints
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
import { GET, POST } from '@/app/api/workflows/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock WorkflowService
vi.mock('@/lib/services/workflow-service', () => ({
  WorkflowService: {
    getWorkflows: vi.fn(),
    createWorkflow: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { WorkflowService } = await import('@/lib/services/workflow-service');

describe('Workflows API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/workflows', () => {
    it('should return workflows for authenticated user', async () => {
      const mockWorkflows = {
        data: [
          { id: 'wf_1', name: 'Test Workflow', status: 'active' },
        ],
      };
      vi.mocked(WorkflowService.getWorkflows).mockResolvedValue(mockWorkflows as any);

      const request = new NextRequest('http://localhost:3000/api/workflows');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(WorkflowService.getWorkflows).toHaveBeenCalledWith('user-123', expect.any(Object));
      expect(response.headers.get('Cache-Control')).toBe('private, s-maxage=60, stale-while-revalidate=120');
    });

    it('should filter workflows by status', async () => {
      const mockWorkflows = { data: [] };
      vi.mocked(WorkflowService.getWorkflows).mockResolvedValue(mockWorkflows as any);

      const request = new NextRequest('http://localhost:3000/api/workflows?status=active');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(WorkflowService.getWorkflows).toHaveBeenCalledWith('user-123', expect.objectContaining({ status: 'active' }));
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/workflows', () => {
    it('should create a workflow for authenticated user', async () => {
      const workflowData = {
        name: 'New Workflow',
        description: 'Test workflow',
        status: 'active' as const,
      };
      const mockWorkflow = { id: 'wf_new', ...workflowData };
      vi.mocked(WorkflowService.createWorkflow).mockResolvedValue(mockWorkflow as any);

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toBeDefined();
      expect(WorkflowService.createWorkflow).toHaveBeenCalled();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});
