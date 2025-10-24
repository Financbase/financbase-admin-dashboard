import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow[0]);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    const body = await request.json();
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
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWorkflow[0]);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    const deletedWorkflow = await db
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .returning();

    if (deletedWorkflow.length === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
