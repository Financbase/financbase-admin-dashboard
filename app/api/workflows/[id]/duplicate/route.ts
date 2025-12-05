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
import { workflows } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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

    // Get the original workflow
    const originalWorkflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (originalWorkflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    const workflow = originalWorkflow[0];

    // Create a duplicate with a new name
    const duplicatedWorkflow = await db
      .insert(workflows)
      .values({
        userId,
        organizationId: workflow.organizationId,
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        triggerConfig: workflow.triggerConfig,
        actions: workflow.actions,
        conditions: workflow.conditions,
        status: 'draft',
        isTemplate: workflow.isTemplate,
        templateCategory: workflow.templateCategory,
        isPublic: false,
        metadata: workflow.metadata,
      })
      .returning();

    return NextResponse.json(duplicatedWorkflow[0]);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

