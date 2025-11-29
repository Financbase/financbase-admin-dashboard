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
import { MarketplaceService } from '@/lib/services/marketplace-service';

export async function POST(
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

    const pluginId = parseInt(id);
    if (Number.isNaN(pluginId)) {
      return ApiErrorHandler.badRequest('Invalid plugin ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { organizationId, settings, permissions } = body;

    try {
      const installation = await MarketplaceService.installPlugin(pluginId, userId, {
        organizationId,
        settings,
        permissions,
      });

      return NextResponse.json({
        success: true,
        installation,
        message: 'Plugin installed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Plugin not found') {
          return ApiErrorHandler.notFound('Plugin not found');
        }
        if (error.message === 'Plugin is not available for installation') {
          return ApiErrorHandler.badRequest('Plugin is not available for installation');
        }
      }
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Plugin not found or already installed
      if (error.message.includes('not found') || error.message.includes('already installed')) {
        return ApiErrorHandler.badRequest(error.message);
      }
      
      // Database errors
      if (error.message.includes('DATABASE_URL') || error.message.includes('connection')) {
        return ApiErrorHandler.databaseError(
          'Unable to connect to database. Please check your DATABASE_URL configuration.',
          requestId
        );
      }
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}
