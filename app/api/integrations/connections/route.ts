import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections, integrations } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .select({
        connection: integrationConnections,
        integration: integrations,
      })
      .from(integrationConnections)
      .innerJoin(integrations, eq(integrationConnections.integrationId, integrations.id))
      .where(eq(integrationConnections.userId, userId));

    if (status) {
      query = query.where(and(
        eq(integrationConnections.userId, userId),
        eq(integrationConnections.status, status)
      ));
    }

    const connections = await query
      .orderBy(desc(integrationConnections.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform the data to include integration details
    const transformedConnections = connections.map(({ connection, integration }) => ({
      ...connection,
      integration,
    }));

    return NextResponse.json(transformedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      integrationId, 
      name, 
      organizationId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      scope,
      externalId,
      externalName,
      externalData,
      settings,
      mappings
    } = body;

    if (!integrationId || !name || !accessToken) {
      return NextResponse.json({ 
        error: 'Integration ID, name, and access token are required' 
      }, { status: 400 });
    }

    const newConnection = await db.insert(integrationConnections).values({
      userId,
      organizationId,
      integrationId,
      name,
      status: 'active',
      isActive: true,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      scope,
      externalId,
      externalName,
      externalData: externalData || {},
      settings: settings || {},
      mappings: mappings || {},
    }).returning();

    return NextResponse.json(newConnection[0], { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
