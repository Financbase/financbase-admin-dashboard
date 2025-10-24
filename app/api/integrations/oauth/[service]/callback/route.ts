import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuthHandler } from '@/lib/oauth/oauth-handler';
import { db } from '@/lib/db';
import { integrationConnections } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';

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
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
       
    // eslint-disable-next-line no-console
    console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=missing_parameters`
      );
    }

    // Get OAuth configuration
    const oauthConfig = getOAuthConfig(service);
    if (!oauthConfig) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_service`
      );
    }

    // Create OAuth handler
    const oauthHandler = createOAuthHandler(service, oauthConfig);

    // Exchange code for token
    const token = await oauthHandler.exchangeCodeForToken(code, state);

    // Parse state to get connection details
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { integrationId, organizationId, returnUrl } = stateData;

    // Get external account information
    const externalAccountInfo = await getExternalAccountInfo(service, token.accessToken);

    // Create or update integration connection
    const connection = await db.insert(integrationConnections).values({
      userId,
      organizationId,
      integrationId,
      name: externalAccountInfo.name || `${service} Account`,
      status: 'active',
      isActive: true,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenExpiresAt: token.expiresAt,
      scope: token.scope,
      externalId: externalAccountInfo.id,
      externalName: externalAccountInfo.name,
      externalData: externalAccountInfo.data || {},
      settings: {},
      mappings: {},
    }).returning();

    // Redirect to success page or return URL
    const redirectUrl = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=true&connection=${connection[0].id}`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=callback_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
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

async function getExternalAccountInfo(service: string, accessToken: string) {
  try {
    switch (service) {
      case 'stripe':
        const stripeResponse = await fetch('https://api.stripe.com/v1/account', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const stripeData = await stripeResponse.json();
        return {
          id: stripeData.id,
          name: stripeData.display_name || stripeData.business_profile?.name,
          data: stripeData,
        };

      case 'slack':
        const slackResponse = await fetch('https://slack.com/api/team.info', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const slackData = await slackResponse.json();
        return {
          id: slackData.team?.id,
          name: slackData.team?.name,
          data: slackData,
        };

      case 'quickbooks':
        const qbResponse = await fetch('https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365306397020/companyinfo/4620816365306397020', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const qbData = await qbResponse.json();
        return {
          id: qbData.CompanyInfo?.Id,
          name: qbData.CompanyInfo?.CompanyName,
          data: qbData,
        };

      case 'xero':
        const xeroResponse = await fetch('https://api.xero.com/connections', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const xeroData = await xeroResponse.json();
        return {
          id: xeroData[0]?.tenantId,
          name: xeroData[0]?.tenantName,
          data: xeroData,
        };

      case 'google':
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const googleData = await googleResponse.json();
        return {
          id: googleData.id,
          name: googleData.name || googleData.email,
          data: googleData,
        };

      case 'microsoft':
        const msResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const msData = await msResponse.json();
        return {
          id: msData.id,
          name: msData.displayName,
          data: msData,
        };

      default:
        return {
          id: 'unknown',
          name: `${service} Account`,
          data: {},
        };
    }
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error(`Failed to get external account info for ${service}:`, error);
    return {
      id: 'unknown',
      name: `${service} Account`,
      data: {},
    };
  }
}
