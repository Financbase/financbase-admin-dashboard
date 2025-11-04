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

    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json(workflow[0]);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PATCH(
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
    const updateData: Partial<{
      name: string;
      description: string;
      category: string;
      type: string;
      status: string;
      isActive: boolean;
      steps: unknown;
      triggers: unknown;
      variables: unknown;
      settings: unknown;
      updatedAt: Date;
    }> = {};

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status as any;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.steps !== undefined) updateData.steps = body.steps;
    if (body.triggers !== undefined) updateData.triggers = body.triggers;
    if (body.variables !== undefined) updateData.variables = body.variables;
    if (body.settings !== undefined) updateData.settings = body.settings;

    updateData.updatedAt = new Date();

    const updatedWorkflow = await db
      .update(workflows)
      .set(updateData)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .returning();

    if (updatedWorkflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json(updatedWorkflow[0]);
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

    const deletedWorkflow = await db
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .returning();

    if (deletedWorkflow.length === 0) {
      return ApiErrorHandler.notFound('Workflow not found');
    }

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
