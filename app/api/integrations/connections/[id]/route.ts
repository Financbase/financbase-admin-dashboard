import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
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

    const connectionId = parseInt(id);
    if (Number.isNaN(connectionId)) {
      return ApiErrorHandler.badRequest('Invalid connection ID');
    }

    const connection = await db
      .select()
      .from(integrationConnections)
      .where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
      .limit(1);

    if (connection.length === 0) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    return NextResponse.json(connection[0]);
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
    const updateData: Record<string, unknown> = {};

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.mappings !== undefined) updateData.mappings = body.mappings;

    updateData.updatedAt = new Date();

    const updatedConnection = await db
      .update(integrationConnections)
      .set(updateData)
      .where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
      .returning();

    if (updatedConnection.length === 0) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    return NextResponse.json(updatedConnection[0]);
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

    const deletedConnection = await db
      .delete(integrationConnections)
      .where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
      .returning();

    if (deletedConnection.length === 0) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    return NextResponse.json({ message: 'Connection deleted successfully' });
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
