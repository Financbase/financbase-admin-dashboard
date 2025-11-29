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

    const workflow = await WorkflowService.getWorkflow(workflowId, userId);
    if (!workflow) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json(workflow);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PUT(
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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const workflow = await WorkflowService.updateWorkflow(workflowId, userId, body);
    if (!workflow) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json(workflow);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function DELETE(
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

    const deleted = await WorkflowService.deleteWorkflow(workflowId, userId);
    if (!deleted) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
