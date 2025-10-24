import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { OAuthHandler } from '@/lib/oauth/oauth-handler'
import { db } from '@/lib/db'

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock crypto
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hmac-signature'),
  })),
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes')),
}))

describe('OAuthHandler', () => {
  let oauthHandler: OAuthHandler
  let mockDb: any

  beforeEach(() => {
    jest.clearAllMocks()
    oauthHandler = new OAuthHandler()
    mockDb = db as any
  })

  describe('generateAuthorizationUrl', () => {
    it('should generate valid OAuth authorization URL for Stripe', () => {
      const service = 'stripe'
      const redirectUri = 'https://app.example.com/oauth/callback'
      const scopes = ['read:customers', 'write:invoices']

      const result = oauthHandler.generateAuthorizationUrl(service, redirectUri, scopes)

      expect(result.success).toBe(true)
      expect(result.url).toContain('https://connect.stripe.com/oauth/authorize')
      expect(result.url).toContain('response_type=code')
      expect(result.url).toContain('client_id=')
      expect(result.url).toContain('redirect_uri=')
      expect(result.url).toContain('scope=')
      expect(result.state).toBeDefined()
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ state, expiresAt: new Date(Date.now() + 60000) }]),
        }),
      })

      // Mock token exchange
      global.fetch = jest.fn().mockResolvedValue({
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ state, expiresAt: new Date(Date.now() + 60000) }]),
        }),
      })

      // Mock failed token exchange
      global.fetch = jest.fn().mockResolvedValue({
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
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
      global.fetch = jest.fn().mockResolvedValue({
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
      global.fetch = jest.fn().mockResolvedValue({
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockStateRecord]),
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockStateRecord]),
        }),
      })

      const result = await oauthHandler.validateState(state)

      expect(result).toBe(false)
    })

    it('should reject non-existent state parameters', async () => {
      const state = 'non-existent-state'

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
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
