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
import { integrationConnections, integrations } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { IntegrationSyncEngine } from '@/lib/services/integrations/integration-sync-engine';

/**
 * POST /api/platform/hub/connections/[id]/sync
 * Start synchronization for an integration connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const connectionId = parseInt(id);
    
    if (Number.isNaN(connectionId)) {
      return NextResponse.json({ error: 'Invalid connection ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      entityTypes, 
      direction = 'bidirectional', 
      filters, 
      forceFullSync = false 
    } = body;

    // Verify connection exists and belongs to user
    const connection = await db
      .select({
        connection: integrationConnections,
        integration: integrations,
      })
      .from(integrationConnections)
      .innerJoin(integrations, eq(integrationConnections.integrationId, integrations.id))
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const { connection: conn, integration: integ } = connection[0];

    if (!conn.isActive) {
      return NextResponse.json({ 
        error: 'Connection is not active' 
      }, { status: 400 });
    }

    try {
      // Start sync process
      const syncId = await IntegrationSyncEngine.startSync(connectionId, userId, {
        entityTypes: entityTypes || integ.features || [],
        direction,
        filters: filters || {},
        forceFullSync,
      });

      return NextResponse.json({
        success: true,
        syncId,
        connectionId,
        integration: integ.name,
        message: 'Synchronization started successfully',
        syncOptions: {
          entityTypes: entityTypes || integ.features || [],
          direction,
          filters: filters || {},
          forceFullSync,
        },
      });
    } catch (error) {
      console.error('Error starting sync:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to start synchronization',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return ApiErrorHandler.handle(error);
  }
}

/**
 * GET /api/platform/hub/connections/[id]/sync
 * Get sync status for an integration connection
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const connectionId = parseInt(id);
    
    if (Number.isNaN(connectionId)) {
      return NextResponse.json({ error: 'Invalid connection ID' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    try {
      // Get sync status
      const syncStatus = await IntegrationSyncEngine.getSyncStatus(connectionId, userId);

      return NextResponse.json({
        connectionId,
        syncStatus,
        lastSync: connection[0].lastSyncAt,
        nextSync: connection[0].nextSyncAt,
      });
    } catch (error) {
      console.error('Error getting sync status:', error);
      return NextResponse.json({
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync status endpoint:', error);
    return ApiErrorHandler.handle(error);
  }
}
