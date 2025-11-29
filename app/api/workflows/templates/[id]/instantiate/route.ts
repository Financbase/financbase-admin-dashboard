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

    const templateId = parseInt(id);
    if (isNaN(templateId)) {
      return ApiErrorHandler.badRequest('Invalid template ID');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { name, description, organizationId } = body;

    if (!name) {
      return ApiErrorHandler.badRequest('Name is required');
    }

    const workflow = await WorkflowService.createWorkflowFromTemplate(templateId, userId, {
      name,
      description,
      organizationId,
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Template not found') {
      return ApiErrorHandler.notFound('Template not found');
    }
    return ApiErrorHandler.handle(error, requestId);
  }
}

