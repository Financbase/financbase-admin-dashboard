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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { getUserFromDatabase } from '@/lib/db/rls-context';

/**
 * GET /api/auth/me
 * Get current authenticated user's database information including organizationId
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return ApiErrorHandler.unauthorized();
    }

    const user = await getUserFromDatabase(clerkId);
    if (!user) {
      return ApiErrorHandler.notFound('User not found in database');
    }

    return NextResponse.json({
      id: user.id,
      clerkId: user.clerk_id,
      organizationId: user.organization_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

