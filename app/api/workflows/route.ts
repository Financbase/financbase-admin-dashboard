import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schemas';
import { eq, desc, and, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, type, steps, triggers, variables, settings } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
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
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}