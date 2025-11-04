import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
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

    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json(webhook[0]);
  } catch (error) {
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
        return ApiErrorHandler.badRequest('Invalid URL format');
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
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json(updatedWebhook[0]);
  } catch (error) {
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

    const webhookId = parseInt(id);
    if (Number.isNaN(webhookId)) {
      return ApiErrorHandler.badRequest('Invalid webhook ID');
    }

    const deletedWebhook = await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .returning();

    if (deletedWebhook.length === 0) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
