import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
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

    // Get webhook
    const webhook = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    if (webhook.length === 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const body = await request.json();
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
      return NextResponse.json({
        success: false,
        error: 'Webhook test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
