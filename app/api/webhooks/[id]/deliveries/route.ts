import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhookId = parseInt(id);
    if (Number.isNaN(webhookId)) {
      return NextResponse.json({ error: 'Invalid webhook ID' }, { status: 400 });
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
    // eslint-disable-next-line no-console
    console.error('Error fetching webhook deliveries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
