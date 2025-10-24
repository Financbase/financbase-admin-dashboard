import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
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

    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json(webhook[0]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.url !== undefined) {
      // Validate URL
      try {
        new URL(body.url);
        updateData.url = body.url;
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
    }
    if (body.events !== undefined) updateData.events = body.events;
    if (body.secret !== undefined) updateData.secret = body.secret;
    if (body.retryPolicy !== undefined) updateData.retryPolicy = body.retryPolicy;
    if (body.headers !== undefined) updateData.headers = body.headers;
    if (body.filters !== undefined) updateData.filters = body.filters;
    if (body.timeout !== undefined) updateData.timeout = body.timeout;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    updateData.updatedAt = new Date();

    const updatedWebhook = await db
      .update(webhooks)
      .set(updateData)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .returning();

    if (updatedWebhook.length === 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWebhook[0]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const deletedWebhook = await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .returning();

    if (deletedWebhook.length === 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
