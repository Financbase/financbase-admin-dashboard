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
import { WebhookService } from '@/lib/services/webhook-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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

    const webhookId = parseInt(id);
    if (Number.isNaN(webhookId)) {
      return ApiErrorHandler.badRequest('Invalid webhook ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { deliveryId } = body;

    if (!deliveryId) {
      return ApiErrorHandler.badRequest('Delivery ID is required');
    }

    try {
      const delivery = await WebhookService.retryWebhookDelivery(deliveryId, userId);
      if (!delivery) {
        return ApiErrorHandler.notFound('Delivery not found');
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook delivery retry initiated',
        delivery,
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
