import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows, workflowExecutions } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
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
    if (Number.isNaN(workflowId)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    // Verify workflow ownership
    const workflow = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .limit(1);

    if (workflow.length === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
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
    // eslint-disable-next-line no-console
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
