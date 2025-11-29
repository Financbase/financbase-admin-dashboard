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
import { IntegrationService } from '@/lib/services/integration-service';

export async function POST(
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

    const connectionId = parseInt(id);
    if (Number.isNaN(connectionId)) {
      return ApiErrorHandler.badRequest('Invalid connection ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { entityTypes, direction, type } = body;

    // Verify connection exists and belongs to user
    const connection = await IntegrationService.getConnection(connectionId, userId);
    if (!connection) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    if (!connection.isActive) {
      return ApiErrorHandler.badRequest('Connection is not active');
    }

    // Create sync operation
    const sync = await IntegrationService.createSync(connectionId, userId, {
      type: type || 'manual',
      direction: direction || 'bidirectional',
      entityTypes,
    });

    return NextResponse.json({
      success: true,
      syncId: sync.syncId,
      message: 'Sync started successfully',
      sync,
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('DATABASE_URL') || error.message.includes('connection'))) {
      return ApiErrorHandler.databaseError(
        'Unable to connect to database. Please check your DATABASE_URL configuration.',
        requestId
      );
    }
    return ApiErrorHandler.handle(error, requestId);
  }
}
