import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';

/**
 * GET /api/marketplace/plugins/pending
 * List pending plugins (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest

    // Get pending plugins (isApproved: false, isActive: true)
    const whereConditions = [
      eq(marketplacePlugins.isApproved, false),
      eq(marketplacePlugins.isActive, true),
    ];

    let query = db
      .select()
      .from(marketplacePlugins)
      .where(and(...whereConditions));

    // Apply sorting
    if (sort === 'oldest') {
      query = query.orderBy(asc(marketplacePlugins.createdAt));
    } else {
      query = query.orderBy(desc(marketplacePlugins.createdAt));
    }

    // Apply pagination
    const pendingPlugins = await query.limit(limit).offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplacePlugins)
      .where(and(...whereConditions));
    
    const total = Number(totalCount[0]?.count || 0);

    return NextResponse.json({
      success: true,
      plugins: pendingPlugins,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching pending plugins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch pending plugins',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
