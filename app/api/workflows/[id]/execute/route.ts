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
import { WorkflowEngine } from '@/lib/services/workflow-engine';

export async function POST(
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

    // Get workflow to verify ownership and status
    const workflow = await WorkflowService.getWorkflow(workflowId, userId);
    if (!workflow) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    if (workflow.status !== 'active') {
      return ApiErrorHandler.badRequest('Workflow must be active to execute');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const triggerData = body.triggerData || {};

    // Create execution record
    const execution = await WorkflowService.createWorkflowExecution(workflowId, userId, {
      triggeredBy: 'user',
      triggerData,
      status: 'pending',
    });

    // Execute workflow asynchronously
    WorkflowEngine.executeWorkflow(workflowId, triggerData, userId)
      .then(async (result) => {
        await WorkflowService.updateWorkflowExecution(execution.id, userId, {
          status: result.success ? 'completed' : 'failed',
          error: result.error,
          results: result.output,
          executionLog: [],
        });
      })
      .catch(async (error) => {
        await WorkflowService.updateWorkflowExecution(execution.id, userId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorDetails: { stack: error instanceof Error ? error.stack : undefined },
        });
      });

    return NextResponse.json({
      executionId: execution.id,
      status: 'pending',
      message: 'Workflow execution started',
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
