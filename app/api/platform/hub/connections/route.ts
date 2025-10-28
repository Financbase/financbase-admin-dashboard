import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationConnections, integrations } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';

/**
 * GET /api/platform/hub/connections
 * Get all integration connections for the user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = [eq(integrationConnections.userId, userId)];

    if (organizationId) {
      whereConditions.push(eq(integrationConnections.organizationId, organizationId));
    }

    if (status) {
      whereConditions.push(eq(integrationConnections.status, status));
    }

    // Get connections with integration details
    let query = db
      .select({
        connection: integrationConnections,
        integration: integrations,
      })
      .from(integrationConnections)
      .innerJoin(integrations, eq(integrationConnections.integrationId, integrations.id))
      .where(and(...whereConditions));

    // Filter by category if provided
    if (category) {
      query = query.where(and(
        ...whereConditions,
        eq(integrations.category, category)
      ));
    }

    const connections = await query
      .orderBy(desc(integrationConnections.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedConnections = connections.map(({ connection, integration }) => ({
      ...connection,
      integration,
    }));

    return NextResponse.json({
      connections: transformedConnections,
      pagination: {
        limit,
        offset,
        total: transformedConnections.length,
      },
    });
  } catch (error) {
    console.error('Error fetching integration connections:', error);
    return ApiErrorHandler.handle(error);
  }
}

/**
 * POST /api/platform/hub/connections
 * Create a new integration connection
 */
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

    // Validate required fields
    if (!integrationId || !name || !accessToken) {
      return NextResponse.json({ 
        error: 'Integration ID, name, and access token are required' 
      }, { status: 400 });
    }

    // Verify integration exists and is active
    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.id, integrationId),
        eq(integrations.isActive, true)
      ))
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json({ 
        error: 'Integration not found or inactive' 
      }, { status: 404 });
    }

    // Create new connection
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

    return NextResponse.json({
      connection: newConnection[0],
      integration: integration[0],
      message: 'Integration connection created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating integration connection:', error);
    return ApiErrorHandler.handle(error);
  }
}
