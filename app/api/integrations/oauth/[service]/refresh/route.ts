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
import { createOAuthHandler } from '@/lib/oauth/oauth-handler';
import { db } from '@/lib/db';
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    // Get connection details
    const connection = await db
      .select()
      .from(integrationConnections)
      .where(and(
        eq(integrationConnections.id, connectionId),
        eq(integrationConnections.userId, userId)
      ))
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const connectionData = connection[0];

    if (!connectionData.refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 400 });
    }

    // Get OAuth configuration
    const oauthConfig = getOAuthConfig(service);
    if (!oauthConfig) {
      return NextResponse.json({ error: 'OAuth configuration not found' }, { status: 400 });
    }

    // Create OAuth handler
    const oauthHandler = createOAuthHandler(service, oauthConfig);

    // Refresh the token
    const newToken = await oauthHandler.refreshAccessToken(connectionData.refreshToken);

    // Update connection with new token
    await db
      .update(integrationConnections)
      .set({
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken || connectionData.refreshToken,
        tokenExpiresAt: newToken.expiresAt,
        scope: newToken.scope,
        updatedAt: new Date(),
      })
      .where(eq(integrationConnections.id, connectionId));

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: newToken.expiresAt,
    });

  } catch (error) {
     
    // eslint-disable-next-line no-console
    logger.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Token refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getOAuthConfig(service: string) {
  const configs: Record<string, any> = {
    stripe: {
      clientId: process.env.STRIPE_CLIENT_ID,
      clientSecret: process.env.STRIPE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/stripe/callback`,
    },
    slack: {
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/slack/callback`,
    },
    quickbooks: {
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/quickbooks/callback`,
    },
    xero: {
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/xero/callback`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/google/callback`,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/microsoft/callback`,
    },
  };

  const config = configs[service];
  if (!config || !config.clientId || !config.clientSecret) {
    return null;
  }

  return config;
}
