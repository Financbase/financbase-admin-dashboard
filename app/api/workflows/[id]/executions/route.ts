/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { WorkflowService } from '@/lib/services/workflow-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return ApiErrorHandler.badRequest('Invalid workflow ID');
    }

    // Verify workflow ownership
    const workflow = await WorkflowService.getWorkflow(workflowId, userId);
    if (!workflow) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const executions = await WorkflowService.getWorkflowExecutions(workflowId, userId, {
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json(executions);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
