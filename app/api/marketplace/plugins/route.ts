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

    // Build where conditions array
    const whereConditions = [eq(marketplacePlugins.isActive, true)];

    // Filter by category
    if (category !== 'all') {
      whereConditions.push(eq(marketplacePlugins.category, category));
    }

    // Filter by search term
    if (search) {
      whereConditions.push(
        sql`(
          ${marketplacePlugins.name} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.description} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.tags}::text ILIKE ${`%${search}%`}
        )`
      );
    }

    // Build query with all conditions
    let query = db
      .select()
      .from(marketplacePlugins)
      .where(and(...whereConditions));

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

    // Get total count for pagination (matching the same where conditions)
    const countConditions = [eq(marketplacePlugins.isActive, true)];
    if (category !== 'all') {
      countConditions.push(eq(marketplacePlugins.category, category));
    }
    if (search) {
      countConditions.push(
        sql`(
          ${marketplacePlugins.name} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.description} ILIKE ${`%${search}%`} OR
          ${marketplacePlugins.tags}::text ILIKE ${`%${search}%`}
        )`
      );
    }
    
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplacePlugins)
      .where(and(...countConditions));

    const total = totalCount[0]?.count || 0;
    
    // Debug logging
    console.log('Marketplace Plugins API:', {
      queryParams: { category, search, sort, limit, offset },
      pluginsReturned: plugins.length,
      totalPlugins: total,
      hasMore: offset + limit < total
    });

    return NextResponse.json({
      plugins,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace plugins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection error
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch plugins',
        message: 'An error occurred while fetching marketplace plugins',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}