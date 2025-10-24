import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuthHandler } from '@/lib/oauth/oauth-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');
    const organizationId = searchParams.get('organizationId');
    const returnUrl = searchParams.get('returnUrl');

    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    // Get OAuth configuration from environment
    const oauthConfig = getOAuthConfig(service);
    if (!oauthConfig) {
      return NextResponse.json({ error: 'OAuth configuration not found' }, { status: 400 });
    }

    // Create OAuth handler
    const oauthHandler = createOAuthHandler(service, oauthConfig);

    // Create state parameter
    const state = {
      userId,
      organizationId: organizationId || undefined,
      integrationId: parseInt(integrationId),
      returnUrl: returnUrl || undefined,
      nonce: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    };

    // Generate authorization URL
    const authUrl = oauthHandler.generateAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('OAuth authorization error:', error);
    return NextResponse.json({ 
      error: 'OAuth authorization failed',
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
