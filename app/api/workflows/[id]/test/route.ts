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
import { WorkflowEngine } from '@/lib/services/workflow-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const resolvedParams = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const workflowId = parseInt(resolvedParams.id);
    if (Number.isNaN(workflowId)) {
      return ApiErrorHandler.badRequest('Invalid workflow ID');
    }

    // Get workflow
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const testData = body.testData || {};

    // Validate workflow configuration
    const validation = validateWorkflow(workflow[0] as any);
    if (!validation.valid) {
      return ApiErrorHandler.badRequest(
        `Workflow validation failed: ${validation.errors.join(', ')}`
      );
    }

    try {
      // Test workflow execution (dry run)
      const result = await WorkflowEngine.testWorkflow(
        workflowId,
        testData,
        userId
      );

      return NextResponse.json({
        success: true,
        result,
        message: 'Workflow test completed successfully',
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

function validateWorkflow(workflow: any) {
  const errors: string[] = [];

  // Check if workflow has steps
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
  }

  // Check if workflow has triggers
  if (!workflow.triggers || workflow.triggers.length === 0) {
    errors.push('Workflow must have at least one trigger');
  }

  // Validate each step
  if (workflow.steps) {
    workflow.steps.forEach((step: any, index: number) => {
      if (!step.name) {
        errors.push(`Step ${index + 1} must have a name`);
      }
      if (!step.type) {
        errors.push(`Step ${index + 1} must have a type`);
      }
      if (!step.configuration) {
        errors.push(`Step ${index + 1} must have configuration`);
      }
    });
  }

  // Validate each trigger
  if (workflow.triggers) {
    workflow.triggers.forEach((trigger: any, index: number) => {
      if (!trigger.eventType) {
        errors.push(`Trigger ${index + 1} must have an event type`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
