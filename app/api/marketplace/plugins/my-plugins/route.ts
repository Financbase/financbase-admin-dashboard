import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

/**
 * GET /api/marketplace/plugins/my-plugins
 * Get user's submitted plugins
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'

    // Query plugins where manifest.createdBy matches userId
    // Note: Since schema doesn't have userId field, we use manifest.createdBy
    const whereConditions = [
      sql`${marketplacePlugins.manifest}->>'createdBy' = ${userId}`
    ];

    // Filter by status
    if (status === 'pending') {
      whereConditions.push(eq(marketplacePlugins.isApproved, false));
      whereConditions.push(eq(marketplacePlugins.isActive, true));
    } else if (status === 'approved') {
      whereConditions.push(eq(marketplacePlugins.isApproved, true));
      whereConditions.push(eq(marketplacePlugins.isActive, true));
    } else if (status === 'rejected') {
      whereConditions.push(eq(marketplacePlugins.isApproved, false));
      whereConditions.push(eq(marketplacePlugins.isActive, false));
    }
    // 'all' or no status: show all

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
    const userPlugins = await query.limit(limit).offset(offset);

    // Get total count (same conditions)
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplacePlugins)
      .where(and(...whereConditions));
    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      plugins: userPlugins,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
