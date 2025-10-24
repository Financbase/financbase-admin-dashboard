import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
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

    const connection = await db
      .select()
      .from(integrationConnections)
      .where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json(connection[0]);
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('Error fetching connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json(updatedConnection[0]);
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const deletedConnection = await db
      .delete(integrationConnections)
      .where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
      .returning();

    if (deletedConnection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
