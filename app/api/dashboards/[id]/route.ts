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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const dashboardId = parseInt(id);
    if (isNaN(dashboardId)) {
      return ApiErrorHandler.badRequest('Invalid dashboard ID');
    }

    const dashboard = await DashboardBuilderService.getDashboard(dashboardId, userId);
    if (!dashboard) {
      return ApiErrorHandler.notFound('Dashboard not found');
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const dashboardId = parseInt(id);
    if (isNaN(dashboardId)) {
      return ApiErrorHandler.badRequest('Invalid dashboard ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const updates = {
      name: body.name,
      description: body.description,
      layout: body.layout,
      theme: body.theme,
      colorScheme: body.colorScheme,
      isPublic: body.isPublic,
    };

    const dashboard = await DashboardBuilderService.updateDashboard(
      dashboardId,
      userId,
      updates
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const dashboardId = parseInt(id);
    if (isNaN(dashboardId)) {
      return ApiErrorHandler.badRequest('Invalid dashboard ID');
    }

    await DashboardBuilderService.deleteDashboard(dashboardId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
