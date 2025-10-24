import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let query = db
      .select()
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.isActive, true));

    // Filter by category
    if (category !== 'all') {
      query = query.where(and(
        eq(marketplacePlugins.isActive, true),
        eq(marketplacePlugins.category, category)
      ));
    }

    // Filter by search term
    if (search) {
      query = query.where(and(
        eq(marketplacePlugins.isActive, true),
        category !== 'all' ? eq(marketplacePlugins.category, category) : undefined,
        sql`(
          ${marketplacePlugins.name} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.description} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.tags}::text ILIKE ${`%${search}%`}
        )`
      ));
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.orderBy(desc(marketplacePlugins.createdAt));
        break;
      case 'rating':
        query = query.orderBy(desc(marketplacePlugins.rating));
        break;
      case 'downloads':
        query = query.orderBy(desc(marketplacePlugins.downloadCount));
        break;
      case 'name':
        query = query.orderBy(asc(marketplacePlugins.name));
        break;
      case 'popular':
      default:
        query = query.orderBy(desc(marketplacePlugins.installCount));
        break;
    }

    // Apply pagination
    const plugins = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.isActive, true));

    return NextResponse.json({
      plugins,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount[0]?.count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace plugins:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch plugins',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}