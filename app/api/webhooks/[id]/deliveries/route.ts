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
import { WebhookService } from '@/lib/services/webhook-service';

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

    const webhookId = parseInt(id);
    if (Number.isNaN(webhookId)) {
      return ApiErrorHandler.badRequest('Invalid webhook ID');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'delivered' | 'failed' | 'retrying' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
      const deliveries = await WebhookService.getWebhookDeliveries(webhookId, userId, {
        status: status || undefined,
        limit,
        offset,
      });

      return NextResponse.json(deliveries);
    } catch (error) {
      if (error instanceof Error && error.message === 'Webhook not found') {
        return ApiErrorHandler.notFound('Webhook not found');
      }
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
