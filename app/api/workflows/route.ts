import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schemas';
import { eq, desc, and, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereConditions = [eq(workflows.userId, userId)];

    if (category) {
      whereConditions.push(eq(workflows.category, category));
    }

    if (status) {
      whereConditions.push(eq(workflows.status, status as any));
    }

    if (search) {
      // Add search functionality using ILIKE
      whereConditions.push(sql`${workflows.name} ILIKE ${`%${search}%`} OR ${workflows.description} ILIKE ${`%${search}%`}`);
    }

    const userWorkflows = await db
      .select()
      .from(workflows)
      .where(and(...whereConditions))
      .orderBy(desc(workflows.createdAt));

    return NextResponse.json(userWorkflows);
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

    const { name, description, category, type, steps, triggers, variables, settings } = body;

    if (!name || !category) {
      return ApiErrorHandler.badRequest('Name and category are required');
    }

    const newWorkflow = await db.insert(workflows).values({
      userId,
      name,
      description,
      category,
      type: type || 'sequential',
      status: 'draft',
      isActive: false,
      steps: steps || [],
      triggers: triggers || [],
      variables: variables || {},
      settings: settings || {},
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    }).returning();

    return NextResponse.json(newWorkflow[0], { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}