import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections, integrations } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/platform/hub/connections/[id]
 * Get a specific integration connection
 */
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

    const connectionId = parseInt(id);
    
    if (Number.isNaN(connectionId)) {
      return ApiErrorHandler.badRequest('Invalid connection ID');
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
      return ApiErrorHandler.notFound('Connection not found');
    }

    const { connection: conn, integration: integ } = connection[0];

    return NextResponse.json({
      ...conn,
      integration: integ,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
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
    return ApiErrorHandler.handle(error, requestId);
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
      return ApiErrorHandler.notFound('Connection not found');
    }

    // Delete connection
    await db
      .delete(integrationConnections)
      .where(eq(integrationConnections.id, connectionId));

    return NextResponse.json({
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
