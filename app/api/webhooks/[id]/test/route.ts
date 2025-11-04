import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
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

    // Get webhook
    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return ApiErrorHandler.notFound('Webhook not found');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const testPayload = body.testPayload || {
      test: true,
      message: 'This is a test webhook payload',
      timestamp: new Date().toISOString(),
    };

    try {
      // Test webhook delivery
      const result = await WebhookService.testWebhook(webhookId, userId, testPayload);

      return NextResponse.json({
        success: result.success,
        httpStatus: result.httpStatus,
        responseBody: result.responseBody,
        responseHeaders: result.responseHeaders,
        duration: result.duration,
        errorMessage: result.errorMessage,
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
