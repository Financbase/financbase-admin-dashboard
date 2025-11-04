/**
 * Disable Feature Flag
 * POST /api/feature-flags/[key]/disable
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { isAdmin } from '@/lib/auth/financbase-rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check admin access
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return ApiErrorHandler.forbidden('Admin access required');
    }

    const { key } = await params;
    const flag = await FeatureFlagsService.disableFlag(key);

    if (!flag) {
      return ApiErrorHandler.notFound(`Feature flag '${key}' not found`);
    }

    return NextResponse.json({
      success: true,
      data: flag,
      message: `Feature flag '${key}' disabled`,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
