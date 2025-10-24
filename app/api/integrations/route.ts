import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schemas';
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(integrations).where(eq(integrations.isActive, true));

    if (category && category !== 'all') {
      query = query.where(and(
        eq(integrations.isActive, true),
        eq(integrations.category, category)
      ));
    }

    if (search) {
      query = query.where(and(
        eq(integrations.isActive, true),
        or(
          like(integrations.name, `%${search}%`),
          like(integrations.description, `%${search}%`)
        )
      ));
    }

    const availableIntegrations = await query
      .orderBy(desc(integrations.isOfficial), desc(integrations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(availableIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}