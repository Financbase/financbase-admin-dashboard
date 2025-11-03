import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schemas';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
      return NextResponse.json({ 
        error: 'Name, URL, and events are required' 
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ 
        error: 'Invalid URL format' 
      }, { status: 400 });
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
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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