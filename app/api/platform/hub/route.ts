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
import { integrations, integrationConnections } from '@/lib/db/schemas';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * GET /api/platform/hub
 * Get Platform Hub overview with integrations and connections
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Get available integrations
    const availableIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.isActive, true))
      .orderBy(desc(integrations.isOfficial), desc(integrations.createdAt));

    // Get user's active connections
    const userConnections = await db
      .select({
        connection: integrationConnections,
        integration: integrations,
      })
      .from(integrationConnections)
      .innerJoin(integrations, eq(integrationConnections.integrationId, integrations.id))
      .where(
        organizationId 
          ? and(
              eq(integrationConnections.userId, userId),
              eq(integrationConnections.organizationId, organizationId),
              eq(integrationConnections.isActive, true)
            )
          : and(
              eq(integrationConnections.userId, userId),
              eq(integrationConnections.isActive, true)
            )
      )
      .orderBy(desc(integrationConnections.createdAt));

    // Transform connections data
    const transformedConnections = userConnections.map(({ connection, integration }) => ({
      ...connection,
      integration,
    }));

    // Get integration statistics if requested
    let stats = null;
    if (includeStats) {
      const connectionStats = await db
        .select({
          totalConnections: sql<number>`count(*)`,
          activeConnections: sql<number>`count(case when ${integrationConnections.isActive} = true then 1 end)`,
          categories: sql<string[]>`array_agg(distinct ${integrations.category})`,
        })
        .from(integrationConnections)
        .innerJoin(integrations, eq(integrationConnections.integrationId, integrations.id))
        .where(
          organizationId 
            ? and(
                eq(integrationConnections.userId, userId),
                eq(integrationConnections.organizationId, organizationId)
              )
            : eq(integrationConnections.userId, userId)
        );

      stats = {
        totalIntegrations: availableIntegrations.length,
        totalConnections: connectionStats[0]?.totalConnections || 0,
        activeConnections: connectionStats[0]?.activeConnections || 0,
        categories: connectionStats[0]?.categories || [],
        officialIntegrations: availableIntegrations.filter(i => i.isOfficial).length,
        communityIntegrations: availableIntegrations.filter(i => !i.isOfficial).length,
      };
    }

    return NextResponse.json({
      integrations: availableIntegrations,
      connections: transformedConnections,
      stats,
      metadata: {
        userId,
        organizationId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * POST /api/platform/hub
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

    // Check for existing connection
    const existingConnection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.userId, userId),
        eq(integrationConnections.integrationId, integrationId),
        eq(integrationConnections.externalId, externalId || '')
      ))
      .limit(1);

    if (existingConnection.length > 0) {
      return NextResponse.json({ 
        error: 'Connection already exists for this integration' 
      }, { status: 409 });
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
    logger.error('Error creating integration connection:', error);
    return ApiErrorHandler.handle(error);
  }
}
