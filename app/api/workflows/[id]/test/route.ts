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

    // Get workflow to verify ownership
    const workflow = await WorkflowService.getWorkflow(workflowId, userId);
    if (!workflow) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const triggerData = body.triggerData || {};

    // Execute workflow in test mode (dry run)
    try {
      const result = await WorkflowEngine.testWorkflow(workflowId, triggerData, userId);
      return NextResponse.json({
        success: result.success,
        output: result.output,
        duration: result.duration,
        error: result.error,
        dryRun: result.dryRun ?? true,
        testMode: true,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dryRun: true,
        testMode: true,
      }, { status: 500 });
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
