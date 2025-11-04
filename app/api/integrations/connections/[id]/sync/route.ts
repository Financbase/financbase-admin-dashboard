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
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { IntegrationSyncEngine } from '@/lib/services/integrations/integration-sync-engine';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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

    const { entityTypes, direction, filters, forceFullSync } = body;

    // Verify connection exists and belongs to user
    const connection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (connection.length === 0) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    if (!connection[0].isActive) {
      return ApiErrorHandler.badRequest('Connection is not active');
    }

    // Start sync process
    const syncId = await IntegrationSyncEngine.startSync(connectionId, userId, {
      entityTypes,
      direction,
      filters,
      forceFullSync,
    });

    return NextResponse.json({
      success: true,
      syncId,
      message: 'Sync started successfully',
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
