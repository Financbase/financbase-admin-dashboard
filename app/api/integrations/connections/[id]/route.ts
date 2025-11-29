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

    const connection = await IntegrationService.getConnection(connectionId, userId);
    if (!connection) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    return NextResponse.json(connection);
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

    const connection = await IntegrationService.updateConnection(connectionId, userId, body);
    if (!connection) {
      return ApiErrorHandler.notFound('Connection not found');
    }

    return NextResponse.json(connection);
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

    const deleted = await IntegrationService.deleteConnection(connectionId, userId);
    if (!deleted) {
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
