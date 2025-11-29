/**
 * Feature Flags API Routes
 * 
 * GET /api/feature-flags - List all feature flags (admin only)
 * POST /api/feature-flags - Create new feature flag (admin only)
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

const createFlagSchema = z.object({
  key: z.string().min(1).max(255),
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  targetOrganizations: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
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

    const flags = await FeatureFlagsService.getAllFlags();

    return NextResponse.json({
      success: true,
      data: flags,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const data = createFlagSchema.parse(body);

    const flag = await FeatureFlagsService.createFlag(data);

    return NextResponse.json(
      {
        success: true,
        data: flag,
      },
      { status: 201 }
    );
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
