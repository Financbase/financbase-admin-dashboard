import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { IntegrationSyncEngine } from '@/lib/services/integrations/integration-sync-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connectionId = parseInt(id);
    if (Number.Number.isNaN(connectionId)) {
      return NextResponse.json({ error: 'Invalid connection ID' }, { status: 400 });
    }

    const body = await request.json();
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
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (!connection[0].isActive) {
      return NextResponse.json({ error: 'Connection is not active' }, { status: 400 });
    }

    try {
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
      return NextResponse.json({
        success: false,
        error: 'Failed to start sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('Error starting sync:', error);
    return NextResponse.json({ 
      error: 'Failed to start sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
