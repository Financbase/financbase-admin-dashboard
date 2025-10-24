import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows, workflowExecutions } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { WorkflowEngine } from '@/lib/services/workflow-engine';
import { nanoid } from 'nanoid';

export async function POST(
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
    if (Number.isNaN(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    // Get workflow
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const body = await request.json();
    const triggerData = body.triggerData || {};

    // Create execution record
    const executionId = nanoid();
    const execution = await db.insert(workflowExecutions).values({
      workflowId,
      userId,
      executionId,
      status: 'pending',
      triggerData,
      inputData: triggerData,
      startedAt: new Date(),
    }).returning();

    try {
      // Execute workflow
      const result = await WorkflowEngine.executeWorkflow(
        workflowId,
        triggerData,
        userId
      );

      // Update execution record
      await db
        .update(workflowExecutions)
        .set({
          status: result.success ? 'completed' : 'failed',
          outputData: result.output,
          errorData: result.error ? { message: result.error } : null,
          completedAt: new Date(),
          duration: result.duration,
        })
        .where(eq(workflowExecutions.executionId, executionId as any));

      // Update workflow statistics
      await db
        .update(workflows)
        .set({
          executionCount: workflow[0].executionCount + 1,
          successCount: result.success ? workflow[0].successCount + 1 : workflow[0].successCount,
          failureCount: result.success ? workflow[0].failureCount : workflow[0].failureCount + 1,
          lastExecutionAt: new Date(),
        })
        .where(eq(workflows.id, workflowId));

      return NextResponse.json({
        executionId,
        success: result.success,
        output: result.output,
        duration: result.duration,
        error: result.error,
      });
    } catch (error) {
      // Update execution record with error
      await db
        .update(workflowExecutions)
        .set({
          status: 'failed',
          errorData: { message: error instanceof Error ? error.message : 'Unknown error' },
          completedAt: new Date(),
        })
        .where(eq(workflowExecutions.executionId, executionId as any));

      throw error;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error executing workflow:', error);
    return NextResponse.json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
