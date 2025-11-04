import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { WebhookService } from '@/lib/services/webhook-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const resolvedParams = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const webhookId = parseInt(resolvedParams.id);
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

    // Verify webhook ownership
    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    // Verify delivery ownership
    const delivery = await db
      .select()
      .from(webhookDeliveries)
      .where(and(
        eq(webhookDeliveries.deliveryId, deliveryId),
        eq(webhookDeliveries.webhookId, webhookId),
        eq(webhookDeliveries.userId, userId)
      ))
      .limit(1);

    if (delivery.length === 0) {
      return ApiErrorHandler.notFound('Delivery not found');
    }

    try {
      // Retry webhook delivery
      await WebhookService.retryWebhookDelivery(deliveryId, userId);

      return NextResponse.json({
        success: true,
        message: 'Webhook delivery retry initiated',
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
