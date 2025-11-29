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

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'inactive' | 'draft' | 'archived' | null;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const workflows = await WorkflowService.getWorkflows(userId, {
      status: status || undefined,
      search,
      limit,
      offset,
    });

    return NextResponse.json(workflows);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { name, description, organizationId, triggerConfig, actions, conditions, status, metadata } = body;

    if (!name || !triggerConfig || !actions || !Array.isArray(actions) || actions.length === 0) {
      return ApiErrorHandler.badRequest('Name, triggerConfig, and at least one action are required');
    }

    const workflow = await WorkflowService.createWorkflow(userId, {
      name,
      description,
      organizationId,
      triggerConfig,
      actions,
      conditions,
      status: status || 'draft',
      metadata,
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}