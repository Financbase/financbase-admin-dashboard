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

    // Try as number first, then as slug
    const integrationId = parseInt(id);
    const integration = isNaN(integrationId)
      ? await IntegrationService.getIntegration(id)
      : await IntegrationService.getIntegration(integrationId);

    if (!integration) {
      return ApiErrorHandler.notFound('Integration not found');
    }

    return NextResponse.json(integration);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

