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
import { DashboardBuilderService } from '@/lib/services/dashboard-builder-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const dashboards = await DashboardBuilderService.getUserDashboards(
      userId,
      organizationId || undefined
    );

    return NextResponse.json(dashboards);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const {
      name,
      description,
      organizationId,
      layout,
      theme = 'light',
      colorScheme = 'blue',
      isPublic = false
    } = body;

    if (!name) {
      return ApiErrorHandler.badRequest('Dashboard name is required');
    }

    const dashboard = await DashboardBuilderService.createDashboard(
      userId,
      name,
      description,
      organizationId,
      layout
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
