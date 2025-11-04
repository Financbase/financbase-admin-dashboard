/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schemas';
import { eq, desc, and, like, or } from 'drizzle-orm';
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
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions array
    const whereConditions = [eq(integrations.isActive, true)];

    if (category && category !== 'all') {
      whereConditions.push(eq(integrations.category, category));
    }

    if (search) {
      whereConditions.push(
        or(
          like(integrations.name, `%${search}%`),
          like(integrations.description, `%${search}%`)
        )
      );
    }

    // Apply all conditions at once
    const availableIntegrations = await db
      .select()
      .from(integrations)
      .where(and(...whereConditions))
      .orderBy(desc(integrations.isOfficial), desc(integrations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(availableIntegrations);
  } catch (error) {
    // Check if it's a database connection error
    if (error instanceof Error && (error.message.includes('DATABASE_URL') || error.message.includes('connection'))) {
      return ApiErrorHandler.databaseError(error, requestId);
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}