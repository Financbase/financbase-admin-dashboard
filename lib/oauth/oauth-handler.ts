import crypto from 'crypto';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scope: string[];
  responseType?: string;
  accessType?: string;
  prompt?: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}

export interface OAuthState {
  userId: string;
  organizationId?: string;
  integrationId: number;
  returnUrl?: string;
  nonce: string;
  timestamp: number;
}

export class OAuthHandler {
  private config: OAuthConfig;
  private stateSecret: string;

  constructor(config: OAuthConfig, stateSecret: string) {
    this.config = config;
    this.stateSecret = stateSecret;
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(state: OAuthState): string {
    const stateParam = this.encodeState(state);
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType || 'code',
      scope: this.config.scope.join(' '),
      state: stateParam,
    });

    // Add optional parameters
    if (this.config.accessType) {
      params.append('access_type', this.config.accessType);
    }
    if (this.config.prompt) {
      params.append('prompt', this.config.prompt);
    }

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<OAuthToken> {
    // Verify state
    const decodedState = this.decodeState(state);
    if (!decodedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenData = {
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code,
    };

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenResponse = await response.json();
    
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
      expiresAt: tokenResponse.expires_in 
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined,
      scope: tokenResponse.scope,
      tokenType: tokenResponse.token_type || 'Bearer',
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    const tokenData = {
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
    };

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const tokenResponse = await response.json();
    
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken,
      expiresIn: tokenResponse.expires_in,
      expiresAt: tokenResponse.expires_in 
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined,
      scope: tokenResponse.scope,
      tokenType: tokenResponse.token_type || 'Bearer',
    };
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<boolean> {
    const revokeData = {
      token,
      token_type_hint: tokenType,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    };

    try {
      const response = await fetch(this.config.tokenUrl.replace('/token', '/revoke'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(revokeData),
      });

      return response.ok;
    } catch (error) {
      console.error('Token revocation failed:', error);
      return false;
    }
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(
    url: string,
    token: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: OAuthToken): boolean {
    if (!token.expiresAt) {
      return false; // No expiration set
    }
    return new Date() >= token.expiresAt;
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTokenExpirationTime(token: OAuthToken): number | null {
    if (!token.expiresAt) {
      return null;
    }
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    return Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
  }

  /**
   * Encode state parameter for OAuth flow
   */
  private encodeState(state: OAuthState): string {
    const stateData = JSON.stringify(state);
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create signature
    const signature = crypto
      .createHmac('sha256', this.stateSecret)
      .update(`${stateData}:${timestamp}:${nonce}`)
      .digest('hex');

    const encodedState = Buffer.from(JSON.stringify({
      data: stateData,
      timestamp,
      nonce,
      signature,
    })).toString('base64');

    return encodedState;
  }

  /**
   * Decode and verify state parameter
   */
  private decodeState(encodedState: string): OAuthState | null {
    try {
      const decoded = JSON.parse(Buffer.from(encodedState, 'base64').toString());
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.stateSecret)
        .update(`${decoded.data}:${decoded.timestamp}:${decoded.nonce}`)
        .digest('hex');

      if (expectedSignature !== decoded.signature) {
        return null;
      }

      // Check timestamp (state should be used within 10 minutes)
      const now = Date.now();
      const stateAge = now - decoded.timestamp;
      if (stateAge > 10 * 60 * 1000) { // 10 minutes
        return null;
      }

      return JSON.parse(decoded.data);
    } catch (error) {
      console.error('Failed to decode state:', error);
      return null;
    }
  }
}

/**
 * OAuth configuration for different services
 */
export const OAUTH_CONFIGS: Record<string, Partial<OAuthConfig>> = {
  stripe: {
    authorizationUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scope: ['read_write'],
    responseType: 'code',
  },
  slack: {
    authorizationUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scope: ['channels:read', 'chat:write', 'files:read'],
    responseType: 'code',
  },
  quickbooks: {
    authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scope: ['com.intuit.quickbooks.accounting'],
    responseType: 'code',
    accessType: 'offline',
  },
  xero: {
    authorizationUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    scope: ['accounting.transactions', 'accounting.contacts.read'],
    responseType: 'code',
  },
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
  },
  microsoft: {
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: ['https://graph.microsoft.com/Mail.Read'],
    responseType: 'code',
  },
};

/**
 * Create OAuth handler for a specific service
 */
export function createOAuthHandler(service: string, config: OAuthConfig): OAuthHandler {
  const serviceConfig = OAUTH_CONFIGS[service];
  if (!serviceConfig) {
    throw new Error(`Unknown OAuth service: ${service}`);
  }

  const mergedConfig = { ...serviceConfig, ...config };
  return new OAuthHandler(mergedConfig as OAuthConfig, process.env.OAUTH_STATE_SECRET || 'default-secret');
}
