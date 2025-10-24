import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { WebhookService } from '@/lib/services/webhook-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const webhookId = parseInt(resolvedParams.id);
    if (Number.isNaN(webhookId)) {
      return NextResponse.json({ error: 'Invalid webhook ID' }, { status: 400 });
    }

    const body = await request.json();
    const { deliveryId } = body;

    if (!deliveryId) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }

    // Verify webhook ownership
    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    try {
      // Retry webhook delivery
      await WebhookService.retryWebhookDelivery(deliveryId, userId);

      return NextResponse.json({
        success: true,
        message: 'Webhook delivery retry initiated',
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retry webhook delivery',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to retry webhook delivery',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
