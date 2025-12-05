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
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { workflowTemplates } from '@/lib/db/schemas';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const isOfficial = searchParams.get('isOfficial') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const templates = await WorkflowService.getWorkflowTemplates({
      category,
      isPublic: true,
      isOfficial: isOfficial || undefined,
      limit,
      offset,
    });

    return NextResponse.json(templates);
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

    const { name, description, category, triggerConfig, actions, conditions, metadata } = body;

    if (!name || !description || !category || !triggerConfig || !actions) {
      return ApiErrorHandler.badRequest('Name, description, category, triggerConfig, and actions are required');
    }

    const newTemplate = await db.insert(workflowTemplates).values({
      name,
      description,
      category,
      triggerConfig,
      actions,
      conditions: conditions || null,
      isPublic: true,
      isOfficial: false,
      createdBy: userId,
      metadata: metadata || null,
    }).returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    logger.error('Error creating workflow template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
