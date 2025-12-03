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
import { POST } from '@/app/api/workflows/[id]/execute/route';

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
    createWorkflowExecution: vi.fn(),
    updateWorkflowExecution: vi.fn(),
  },
}));

// Mock WorkflowEngine
vi.mock('@/lib/services/workflow-engine', () => ({
  WorkflowEngine: {
    executeWorkflow: vi.fn(),
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
const { WorkflowEngine } = await import('@/lib/services/workflow-engine');

describe('Workflows Execute API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/workflows/{id}/execute', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/workflows/1/execute', {
        method: 'POST',
      });
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });
      expect(response.status).toBe(401);
    });

    it('should return 400 when workflow is not active', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.getWorkflow).mockResolvedValue({
        id: 1,
        status: 'draft',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/workflows/1/execute', {
        method: 'POST',
      });
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });
      expect(response.status).toBe(400);
    });

    it('should execute workflow when active', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
      vi.mocked(WorkflowService.getWorkflow).mockResolvedValue({
        id: 1,
        status: 'active',
      } as any);
      vi.mocked(WorkflowService.createWorkflowExecution).mockResolvedValue({
        id: 100,
      } as any);
      vi.mocked(WorkflowEngine.executeWorkflow).mockResolvedValue({
        success: true,
        output: {},
      } as any);

      const request = new NextRequest('http://localhost:3000/api/workflows/1/execute', {
        method: 'POST',
        body: JSON.stringify({ triggerData: {} }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('executionId');
      expect(data).toHaveProperty('status', 'pending');
    });
  });
});

