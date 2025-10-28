import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections, integrations } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';

/**
 * GET /api/platform/hub/connections/[id]
 * Get a specific integration connection
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

    // Get connection with integration details
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

    return NextResponse.json({
      ...conn,
      integration: integ,
    });
  } catch (error) {
    console.error('Error fetching integration connection:', error);
    return ApiErrorHandler.handle(error);
  }
}

/**
 * PATCH /api/platform/hub/connections/[id]
 * Update an integration connection
 */
export async function PATCH(
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
      name,
      status,
      isActive,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      scope,
      externalName,
      externalData,
      settings,
      mappings
    } = body;

    // Verify connection exists and belongs to user
    const existingConnection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (existingConnection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Update connection
    const updatedConnection = await db
      .update(integrationConnections)
      .set({
        ...(name && { name }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(tokenExpiresAt && { tokenExpiresAt }),
        ...(scope && { scope }),
        ...(externalName && { externalName }),
        ...(externalData && { externalData }),
        ...(settings && { settings }),
        ...(mappings && { mappings }),
        updatedAt: new Date(),
      })
      .where(eq(integrationConnections.id, connectionId))
      .returning();

    return NextResponse.json({
      connection: updatedConnection[0],
      message: 'Connection updated successfully',
    });
  } catch (error) {
    console.error('Error updating integration connection:', error);
    return ApiErrorHandler.handle(error);
  }
}

/**
 * DELETE /api/platform/hub/connections/[id]
 * Delete an integration connection
 */
export async function DELETE(
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
    const existingConnection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (existingConnection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Delete connection
    await db
      .delete(integrationConnections)
      .where(eq(integrationConnections.id, connectionId));

    return NextResponse.json({
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting integration connection:', error);
    return ApiErrorHandler.handle(error);
  }
}
