/**
 * Feature Flag by Key API Routes
 * 
 * GET /api/feature-flags/[key] - Get feature flag and check if enabled for current user
 * PATCH /api/feature-flags/[key] - Update feature flag (admin only)
 * DELETE /api/feature-flags/[key] - Delete feature flag (admin only)
 */

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
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { z } from 'zod';

const updateFlagSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetOrganizations: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { key } = await params;
    
    // Get flag configuration
    const flag = await FeatureFlagsService.getFlag(key);
    
    if (!flag) {
      return ApiErrorHandler.notFound(`Feature flag '${key}' not found`);
    }

    // Extract organization from Clerk auth
    const organizationId = orgId || undefined;

    // Check if enabled for this user
    const isEnabled = await FeatureFlagsService.isEnabled(key, {
      userId,
      organizationId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...flag,
        enabledForUser: isEnabled,
      },
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function PATCH(
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
    const body = await request.json();
    const data = updateFlagSchema.parse(body);

    const flag = await FeatureFlagsService.updateFlag(key, data);

    if (!flag) {
      return ApiErrorHandler.notFound(`Feature flag '${key}' not found`);
    }

    return NextResponse.json({
      success: true,
      data: flag,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function DELETE(
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
    const deleted = await FeatureFlagsService.deleteFlag(key);

    if (!deleted) {
      return ApiErrorHandler.notFound(`Feature flag '${key}' not found`);
    }

    return NextResponse.json({
      success: true,
      message: `Feature flag '${key}' deleted successfully`,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
