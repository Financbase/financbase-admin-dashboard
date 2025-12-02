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

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get list of webhooks
 *     description: Retrieves a paginated list of webhook endpoints configured for the authenticated user
 *     tags:
 *       - Integrations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter webhooks by name or URL
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter webhooks by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of webhooks to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of webhooks to skip
 *     responses:
 *       200:
 *         description: Webhooks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: webhook_123
 *                   name:
 *                     type: string
 *                     example: Invoice Paid Webhook
 *                   url:
 *                     type: string
 *                     format: uri
 *                     example: https://example.com/webhook
 *                   events:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: [invoice.paid, invoice.created]
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userWebhooks = await WebhookService.getWebhooks(userId, {
      isActive: status ? status === 'active' : undefined,
      search,
      limit,
      offset,
    });

    return NextResponse.json(userWebhooks);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     description: Creates a new webhook endpoint to receive events from the platform
 *     tags:
 *       - Integrations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - events
 *             properties:
 *               name:
 *                 type: string
 *                 example: Invoice Paid Webhook
 *               description:
 *                 type: string
 *                 example: Receive notifications when invoices are paid
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/webhook/invoice-paid
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [invoice.paid, invoice.created]
 *               secret:
 *                 type: string
 *                 description: Webhook secret for signature verification (auto-generated if not provided)
 *               retryPolicy:
 *                 type: object
 *                 properties:
 *                   maxRetries:
 *                     type: integer
 *                     default: 3
 *                   retryDelay:
 *                     type: integer
 *                     default: 1000
 *               headers:
 *                 type: object
 *                 description: Custom headers to include in webhook requests
 *               filters:
 *                 type: object
 *                 description: Event filters
 *               timeout:
 *                 type: integer
 *                 default: 30000
 *                 description: Request timeout in milliseconds
 *               organizationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: webhook_123
 *                 name:
 *                   type: string
 *                 url:
 *                   type: string
 *                 secret:
 *                   type: string
 *                   description: Generated webhook secret for signature verification
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const { 
      name, 
      description, 
      url, 
      events, 
      secret, 
      retryPolicy, 
      headers, 
      filters, 
      timeout,
      organizationId 
    } = body;

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return ApiErrorHandler.badRequest('Name, URL, and events are required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return ApiErrorHandler.badRequest('Invalid URL format');
    }

    const newWebhook = await WebhookService.createWebhook(userId, {
      name,
      description,
      url,
      events,
      organizationId,
      secret,
      retryPolicy,
      headers,
      filters,
      timeout,
    });

    return NextResponse.json(newWebhook, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}