/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows, workflowExecutions } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
    if (Number.isNaN(workflowId)) {
      return ApiErrorHandler.badRequest('Invalid workflow ID');
    }

    // Verify workflow ownership
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, workflowId))
      .orderBy(desc(workflowExecutions.startedAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(and(
        eq(workflowExecutions.workflowId, workflowId),
        eq(workflowExecutions.status, status as any)
      ));
    }

    const executions = await query;

    return NextResponse.json(executions);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
