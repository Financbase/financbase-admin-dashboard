/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions array
    const whereConditions = [eq(webhooks.userId, userId)];

    if (search) {
      whereConditions.push(
        or(
          like(webhooks.name, `%${search}%`),
          like(webhooks.url, `%${search}%`)
        )
      );
    }

    if (status) {
      whereConditions.push(eq(webhooks.isActive, status === 'active'));
    }

    // Apply all conditions at once
    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(and(...whereConditions))
      .orderBy(desc(webhooks.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(userWebhooks);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

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

    // Generate secret if not provided
    const webhookSecret = secret || generateWebhookSecret();

    const newWebhook = await db.insert(webhooks).values({
      userId,
      organizationId,
      name,
      description,
      url,
      secret: webhookSecret,
      events,
      retryPolicy: retryPolicy || {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      headers: headers || {},
      filters: filters || {},
      timeout: timeout || 30000,
      isActive: true,
    }).returning();

    return NextResponse.json(newWebhook[0], { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}