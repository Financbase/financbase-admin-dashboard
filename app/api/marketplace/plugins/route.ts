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
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check if user is admin
    const adminStatus = await isAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions array
    // Regular users: only show approved and active plugins
    // Admins: can see all active plugins (including pending)
    const whereConditions = [eq(marketplacePlugins.isActive, true)];
    
    // For regular users, only show approved plugins
    if (!adminStatus) {
      whereConditions.push(eq(marketplacePlugins.isApproved, true));
    }

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
    
    // Apply same approval filter for count
    if (!adminStatus) {
      countConditions.push(eq(marketplacePlugins.isApproved, true));
    }
    
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
    logger.info('Marketplace Plugins API:', {
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
    // Check if it's a database connection error and return appropriate status
    if (error instanceof Error && (error.message.includes('DATABASE_URL') || error.message.includes('connection'))) {
      return ApiErrorHandler.databaseError(error, requestId);
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}