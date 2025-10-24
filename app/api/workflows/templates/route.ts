import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflowTemplates } from '@/lib/db/schemas';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isOfficial = searchParams.get('isOfficial');
    const isPopular = searchParams.get('isPopular');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereConditions = [eq(workflowTemplates.isActive, true)];

    if (category) {
      whereConditions.push(eq(workflowTemplates.category, category));
    }

    if (search) {
      whereConditions.push(or(
        like(workflowTemplates.name, `%${search}%`),
        like(workflowTemplates.description, `%${search}%`)
      ));
    }

    if (isOfficial === 'true') {
      whereConditions.push(eq(workflowTemplates.isOfficial, true));
    }

    if (isPopular === 'true') {
      whereConditions.push(eq(workflowTemplates.isPopular, true));
    }

    const templates = await db
      .select()
      .from(workflowTemplates)
      .where(and(...whereConditions))
      .orderBy(desc(workflowTemplates.usageCount))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
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
    const { name, description, category, templateConfig, tags } = body;

    if (!name || !description || !category || !templateConfig) {
      return NextResponse.json({ 
        error: 'Name, description, category, and templateConfig are required' 
      }, { status: 400 });
    }

    const newTemplate = await db.insert(workflowTemplates).values({
      name,
      description,
      category,
      templateConfig,
      tags: tags || [],
      authorId: userId,
      isOfficial: false,
      isPopular: false,
      usageCount: 0,
      isActive: true,
    }).returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating workflow template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
