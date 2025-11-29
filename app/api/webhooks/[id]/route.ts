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

    const webhook = await WebhookService.getWebhook(webhookId, userId);
    if (!webhook) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json(webhook);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PUT(
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

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return ApiErrorHandler.badRequest('Invalid URL format');
      }
    }

    const webhook = await WebhookService.updateWebhook(webhookId, userId, body);
    if (!webhook) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json(webhook);
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

    const deleted = await WebhookService.deleteWebhook(webhookId, userId);
    if (!deleted) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
