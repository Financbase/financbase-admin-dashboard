import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAuthHandler, OAuthConfig, OAuthState } from '@/lib/oauth/oauth-handler';

// Mock the global fetch
const mockFetch = vi.fn();
(global as any).fetch = mockFetch;

// Mock Response object
const mockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
});

// Mock crypto - must be defined inline to avoid hoisting issues
vi.mock('crypto', () => {
  const mockRandomBytes = vi.fn(() => Buffer.from('mock-random-bytes'));
  const mockCreateHmac = vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mock-hmac-signature'),
  }));
  
  return {
    default: {
      createHmac: mockCreateHmac,
      randomBytes: mockRandomBytes,
    },
    createHmac: mockCreateHmac,
    randomBytes: mockRandomBytes,
  };
});

describe('OAuthHandler Integration', () => {
  let oauthHandler: OAuthHandler;
  const mockConfig: OAuthConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/oauth/callback',
    authorizationUrl: 'https://example.com/oauth/authorize',
    tokenUrl: 'https://example.com/oauth/token',
    scope: ['read', 'write'],
  };
  const stateSecret = 'test-state-secret';
  const mockState: OAuthState = {
    userId: 'user-123',
    organizationId: 'org-456',
    integrationId: 1,
    nonce: 'test-nonce',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    oauthHandler = new OAuthHandler(mockConfig, stateSecret);
  });

  describe('generateAuthUrl', () => {
    it('should generate a valid OAuth authorization URL with state', () => {
      // Act
      const authUrl = oauthHandler.generateAuthUrl(mockState);
      
      // Assert
      expect(authUrl).toContain('https://example.com/oauth/authorize');
      
      const url = new URL(authUrl);
      expect(url.searchParams.get('client_id')).toBe('test-client-id');
      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/oauth/callback');
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe('read write');
      expect(url.searchParams.get('state')).toBeDefined();
    });

    it('should include additional parameters when provided', () => {
      // Arrange
      const customConfig = {
        ...mockConfig,
        accessType: 'offline',
        prompt: 'consent'
      };
      const customHandler = new OAuthHandler(customConfig, stateSecret);
      
      // Act
      const authUrl = customHandler.generateAuthUrl(mockState);
      
      // Assert
      const url = new URL(authUrl);
      expect(url.searchParams.get('access_type')).toBe('offline');
      expect(url.searchParams.get('prompt')).toBe('consent');
    });
  });

  describe('handleCallback', () => {
    it('should validate state and exchange code for tokens', async () => {
      // Arrange
      const mockCode = 'test-auth-code';
      const mockStateParam = oauthHandler['encodeState'](mockState);
      
      // Mock the token response
      const mockTokenResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'read write',
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse(mockTokenResponse));
      
      // Act
      const result = await oauthHandler.handleCallback(mockCode, mockStateParam);
      
      // Assert
      expect(result).toEqual({
        success: true,
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
          scope: 'read write',
          expiresAt: expect.any(Date),
        },
      });
      
      // Verify fetch was called with the correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        mockConfig.tokenUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        })
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh an expired access token', async () => {
      // Arrange
      const mockRefreshToken = 'test-refresh-token';
      
      // Mock the token refresh response
      const mockTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'read write',
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse(mockTokenResponse));
      
      // Act
      const result = await oauthHandler.refreshToken(mockRefreshToken);
      
      // Assert
      expect(result).toEqual({
        success: true,
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
          scope: 'read write',
          expiresAt: expect.any(Date),
        },
      });
      
      // Get the actual fetch call arguments
      const call = mockFetch.mock.calls[0];
      const url = call[0] as string;
      const options = call[1] as RequestInit;
      
      // Parse the URL-encoded body
      const bodyParams = new URLSearchParams(options.body as string);
      
      // Verify the fetch was called with the correct URL and method
      expect(url).toBe(mockConfig.tokenUrl);
      expect(options.method).toBe('POST');
      
      // Verify headers
      const headers = new Headers(options.headers as HeadersInit);
      expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect(headers.get('Accept')).toBe('application/json');
      
      // Verify body parameters
      expect(bodyParams.get('grant_type')).toBe('refresh_token');
      expect(bodyParams.get('refresh_token')).toBe(mockRefreshToken);
      expect(bodyParams.get('client_id')).toBe(mockConfig.clientId);
      expect(bodyParams.get('client_secret')).toBe(mockConfig.clientSecret);
    });
  });
});
