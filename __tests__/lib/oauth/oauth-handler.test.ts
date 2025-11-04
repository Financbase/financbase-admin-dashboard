import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OAuthHandler } from '@/lib/oauth/oauth-handler'
import type { OAuthConfig, OAuthState } from '@/lib/oauth/oauth-handler'

// Mock the global fetch with proper typing
global.fetch = vi.fn() as any

// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
}

vi.mock('@/lib/db', () => ({
  db: mockDb,
}))

// Mock crypto
const mockRandomBytes = vi.fn(() => Buffer.from('mock-random-bytes'))
const mockCreateHmac = vi.fn(() => ({
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('mock-hmac-signature'),
}))

vi.mock('crypto', () => ({
  createHmac: mockCreateHmac,
  randomBytes: mockRandomBytes,
}))

// Mock Response class for fetch
class MockResponse {
  constructor(public body: any, public init: ResponseInit = {}) {}

  json() {
    return Promise.resolve(this.body)
  }

  get ok() {
    return this.init.status === undefined || (this.init.status >= 200 && this.init.status < 300)
  }

  get status() {
    return this.init.status || 200
  }
}

describe('OAuthHandler', () => {
  let oauthHandler: OAuthHandler
  const mockConfig: OAuthConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/oauth/callback',
    authorizationUrl: 'https://example.com/oauth/authorize',
    tokenUrl: 'https://example.com/oauth/token',
    scope: ['read', 'write'],
  }
  const stateSecret = 'test-state-secret'
  const mockState: OAuthState = {
    userId: 'user-123',
    organizationId: 'org-456',
    integrationId: 1,
    nonce: 'test-nonce',
    timestamp: Date.now(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    oauthHandler = new OAuthHandler(mockConfig, stateSecret)
    
    // Reset fetch mock
    vi.mocked(global.fetch).mockClear()
  })

  describe('generateAuthUrl', () => {
    it('should generate a valid OAuth authorization URL', () => {
      const authUrl = oauthHandler.generateAuthUrl(mockState)
      
      // Should contain the base authorization URL
      expect(authUrl).toContain('https://example.com/oauth/authorize')
      
      // Should contain required OAuth parameters
      const url = new URL(authUrl)
      expect(url.searchParams.get('client_id')).toBe('test-client-id')
      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/oauth/callback')
      expect(url.searchParams.get('response_type')).toBe('code')
      expect(url.searchParams.get('scope')).toBe('read write')
      
      // Should contain a state parameter
      expect(url.searchParams.get('state')).toBeDefined()
    })
  })

  describe('handleCallback', () => {
    it('should exchange authorization code for access token', async () => {
      const mockCode = 'test-auth-code'
      const mockStateParam = 'test-state-param'
      
      // Mock the fetch response for token exchange
      const mockTokenResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'read write'
      }
      
      // Mock the fetch implementation
      vi.mocked(global.fetch).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse),
          status: 200,
        } as Response)
      )
      
      // Mock the state validation
      vi.spyOn(oauthHandler as any, 'validateState').mockResolvedValueOnce(mockState)
      
      // Mock the database save token function
      const mockSaveToken = vi.spyOn(oauthHandler as any, 'saveToken').mockResolvedValueOnce({})
      
      // Call the method under test
      const result = await oauthHandler.handleCallback(mockCode, mockStateParam)
      
      // Verify the result
      expect(result.success).toBe(true)
      expect(result.tokens?.accessToken).toBe('test-access-token')
      expect(result.tokens?.refreshToken).toBe('test-refresh-token')
      
      // Verify fetch was called with the correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': expect.stringContaining('Basic ')
          }),
          body: expect.stringContaining('grant_type=authorization_code')
        })
      )
      
      // Verify the token was saved
      expect(mockSaveToken).toHaveBeenCalledWith(
        mockState.userId,
        mockState.organizationId,
        mockState.integrationId,
        expect.objectContaining({
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
          scope: 'read write'
        })
      )
    })

    it('should generate valid OAuth authorization URL for Slack', () => {
      const service = 'slack'
      const redirectUri = 'https://app.example.com/oauth/callback'
      const scopes = ['chat:write', 'channels:read']

      const result = oauthHandler.generateAuthorizationUrl(service, redirectUri, scopes)

      expect(result.success).toBe(true)
      expect(result.url).toContain('https://slack.com/oauth/v2/authorize')
      expect(result.url).toContain('client_id=')
      expect(result.url).toContain('scope=chat:write,channels:read')
    })

    it('should handle unsupported services gracefully', () => {
      const service = 'unsupported' as any
      const redirectUri = 'https://app.example.com/oauth/callback'
      const scopes = ['read:data']

      const result = oauthHandler.generateAuthorizationUrl(service, redirectUri, scopes)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported service')
    })
  })

  describe('handleCallback', () => {
    it('should handle successful OAuth callback for Stripe', async () => {
      const service = 'stripe'
      const code = 'test-auth-code'
      const state = 'test-state'
      const redirectUri = 'https://app.example.com/oauth/callback'

      // Mock state verification
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ state, expiresAt: new Date(Date.now() + 60000) }]),
        }),
      })

      // Mock token exchange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          token_type: 'bearer',
          scope: 'read:customers write:invoices',
        }),
      })

      const result = await oauthHandler.handleCallback(service, code, state, redirectUri)

      expect(result.success).toBe(true)
      expect(result.tokens.accessToken).toBe('test-access-token')
      expect(result.tokens.refreshToken).toBe('test-refresh-token')
    })

    it('should handle OAuth callback errors', async () => {
      const service = 'stripe'
      const code = 'invalid-code'
      const state = 'test-state'
      const redirectUri = 'https://app.example.com/oauth/callback'

      // Mock state verification
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ state, expiresAt: new Date(Date.now() + 60000) }]),
        }),
      })

      // Mock failed token exchange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code',
        }),
      })

      const result = await oauthHandler.handleCallback(service, code, state, redirectUri)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid authorization code')
    })

    it('should reject invalid state parameters', async () => {
      const service = 'stripe'
      const code = 'test-auth-code'
      const state = 'invalid-state'
      const redirectUri = 'https://app.example.com/oauth/callback'

      // Mock state verification failure
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await oauthHandler.handleCallback(service, code, state, redirectUri)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid state parameter')
    })
  })

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const service = 'stripe'
      const refreshToken = 'test-refresh-token'

      // Mock successful token refresh
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      })

      const result = await oauthHandler.refreshToken(service, refreshToken)

      expect(result.success).toBe(true)
      expect(result.tokens.accessToken).toBe('new-access-token')
      expect(result.tokens.refreshToken).toBe('new-refresh-token')
    })

    it('should handle token refresh failures', async () => {
      const service = 'stripe'
      const refreshToken = 'invalid-refresh-token'

      // Mock failed token refresh
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token',
        }),
      })

      const result = await oauthHandler.refreshToken(service, refreshToken)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid refresh token')
    })
  })

  describe('validateState', () => {
    it('should validate state parameter correctly', async () => {
      const state = 'test-state'
      const mockStateRecord = {
        state,
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockStateRecord]),
        }),
      })

      const result = await oauthHandler.validateState(state)

      expect(result).toBe(true)
    })

    it('should reject expired state parameters', async () => {
      const state = 'expired-state'
      const mockStateRecord = {
        state,
        expiresAt: new Date(Date.now() - 60000), // 1 minute ago
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockStateRecord]),
        }),
      })

      const result = await oauthHandler.validateState(state)

      expect(result).toBe(false)
    })

    it('should reject non-existent state parameters', async () => {
      const state = 'non-existent-state'

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await oauthHandler.validateState(state)

      expect(result).toBe(false)
    })
  })

  describe('generateState', () => {
    it('should generate unique state parameters', () => {
      const state1 = oauthHandler.generateState()
      const state2 = oauthHandler.generateState()

      expect(state1).toBeDefined()
      expect(state2).toBeDefined()
      expect(state1).not.toBe(state2)
      expect(state1.length).toBeGreaterThan(10)
    })
  })

  describe('getServiceConfig', () => {
    it('should return correct configuration for supported services', () => {
      const stripeConfig = oauthHandler.getServiceConfig('stripe')
      expect(stripeConfig).toBeDefined()
      expect(stripeConfig.authUrl).toContain('connect.stripe.com')

      const slackConfig = oauthHandler.getServiceConfig('slack')
      expect(slackConfig).toBeDefined()
      expect(slackConfig.authUrl).toContain('slack.com')

      const quickbooksConfig = oauthHandler.getServiceConfig('quickbooks')
      expect(quickbooksConfig).toBeDefined()
      expect(quickbooksConfig.authUrl).toContain('appcenter.intuit.com')
    })

    it('should return null for unsupported services', () => {
      const config = oauthHandler.getServiceConfig('unsupported' as any)
      expect(config).toBeNull()
    })
  })
})
