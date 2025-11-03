/**
 * Enable Feature Flag
 * POST /api/feature-flags/[key]/enable
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler } from '@/lib/api-error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // TODO: Add admin role check
    // if (!await isAdmin(userId)) {
    //   return ApiErrorHandler.forbidden('Admin access required');
    // }

    const { key } = await params;
    const flag = await FeatureFlagsService.enableFlag(key);

    if (!flag) {
      return ApiErrorHandler.notFound(`Feature flag '${key}' not found`);
    }

    return NextResponse.json({
      success: true,
      data: flag,
      message: `Feature flag '${key}' enabled`,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
