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
import { workflows, workflowLogs } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

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
    const executionId = searchParams.get('executionId');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build all where conditions
    const whereConditions = [eq(workflowLogs.workflowId, workflowId)];
    
    if (executionId) {
      whereConditions.push(eq(workflowLogs.executionId, executionId));
    }

    if (level) {
      whereConditions.push(eq(workflowLogs.level, level as any));
    }

    const logs = await db
      .select()
      .from(workflowLogs)
      .where(and(...whereConditions))
      .orderBy(desc(workflowLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(logs);
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.error('Error fetching workflow logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
