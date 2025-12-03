/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/marketplace/plugins/pending
 * List pending plugins (admin only)
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return ApiErrorHandler.forbidden('Admin access required');
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

    // Build query with sorting and pagination
    const baseQuery = db
      .select()
      .from(marketplacePlugins)
      .where(and(...whereConditions));

    // Apply sorting and pagination
    const pendingPlugins = sort === 'oldest'
      ? await baseQuery.orderBy(asc(marketplacePlugins.createdAt)).limit(limit).offset(offset)
      : await baseQuery.orderBy(desc(marketplacePlugins.createdAt)).limit(limit).offset(offset);

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
    return ApiErrorHandler.handle(error, requestId);
  }
}
