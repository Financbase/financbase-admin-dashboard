/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { IntegrationService } from '@/lib/services/integration-service';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'inactive' | 'error' | 'expired' | null;
    const integrationId = searchParams.get('integrationId') ? parseInt(searchParams.get('integrationId')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const connections = await IntegrationService.getConnections(userId, {
      status: status || undefined,
      integrationId,
      limit,
      offset,
    });

    // Enrich with integration details
    const enrichedConnections = await Promise.all(
      connections.map(async (connection) => {
        const integration = await IntegrationService.getIntegration(connection.integrationId);
        return {
          ...connection,
          integration,
        };
      })
    );

    return NextResponse.json(enrichedConnections);
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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
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
      return ApiErrorHandler.badRequest('Integration ID, name, and access token are required');
    }

    const newConnection = await IntegrationService.createConnection(userId, {
      integrationId,
      name,
      organizationId,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
      scope,
      externalId,
      externalName,
      externalData,
      settings,
      mappings,
    });

    return NextResponse.json(newConnection, { status: 201 });
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
