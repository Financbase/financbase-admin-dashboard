import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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

    // Verify webhook ownership
    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, webhookId))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(and(
        eq(webhookDeliveries.webhookId, webhookId),
        eq(webhookDeliveries.status, status)
      ));
    }

    if (search) {
      query = query.where(and(
        eq(webhookDeliveries.webhookId, webhookId),
        // Add search functionality for event type or delivery ID
      ));
    }

    const deliveries = await query;

    return NextResponse.json(deliveries);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
