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

    const { id } = await params;
    const connectionId = parseInt(id);
    if (Number.isNaN(connectionId)) {
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
    console.error('Error fetching connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection error
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while fetching the connection'
      },
      { status: 500 }
    );
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

    const { id } = await params;
    const connectionId = parseInt(id);
    if (Number.isNaN(connectionId)) {
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
    console.error('Error updating connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection error
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while updating the connection'
      },
      { status: 500 }
    );
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

    const { id } = await params;
    const connectionId = parseInt(id);
    if (Number.isNaN(connectionId)) {
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
    console.error('Error deleting connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection error
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while deleting the connection'
      },
      { status: 500 }
    );
  }
}
