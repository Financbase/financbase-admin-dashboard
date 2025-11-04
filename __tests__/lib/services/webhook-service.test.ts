import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebhookService } from '@/lib/services/webhook-service'
import { db } from '@/lib/db'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('WebhookService', () => {
  let webhookService: WebhookService
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    webhookService = new WebhookService()
    mockDb = db as any
  })

  describe('createWebhook', () => {
    it('should create a new webhook successfully', async () => {
      const webhookData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['invoice.created', 'payment.received'],
        isActive: true,
        secret: 'test-secret',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'webhook-1' }),
      })

      const result = await webhookService.createWebhook(webhookData)

      expect(result.success).toBe(true)
      expect(result.webhookId).toBe('webhook-1')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should validate webhook URL format', async () => {
      const webhookData = {
        name: 'Invalid Webhook',
        url: 'invalid-url',
        events: ['invoice.created'],
        isActive: true,
        secret: 'test-secret',
      }

      const result = await webhookService.createWebhook(webhookData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid URL')
    })
  })

  describe('deliverEvent', () => {
    it('should deliver webhook event successfully', async () => {
      const webhookId = 'webhook-1'
      const eventData = {
        type: 'invoice.created',
        data: { invoiceId: 'INV-001', amount: 100 },
        timestamp: new Date().toISOString(),
      }

      const mockWebhook = {
        id: webhookId,
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'delivery-1' }),
      })

      // Mock successful HTTP response
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      })

      const result = await webhookService.deliverEvent(webhookId, eventData)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Signature': expect.any(String),
          }),
        })
      )
    })

    it('should handle delivery failures with retry logic', async () => {
      const webhookId = 'webhook-1'
      const eventData = {
        type: 'invoice.created',
        data: { invoiceId: 'INV-001', amount: 100 },
        timestamp: new Date().toISOString(),
      }

      const mockWebhook = {
        id: webhookId,
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'delivery-1' }),
      })

      // Mock failed HTTP response
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const result = await webhookService.deliverEvent(webhookId, eventData)

      expect(result.success).toBe(false)
      expect(result.retryable).toBe(true)
    })
  })

  describe('testWebhook', () => {
    it('should test webhook endpoint successfully', async () => {
      const webhookId = 'webhook-1'
      const testPayload = { test: true }

      const mockWebhook = {
        id: webhookId,
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      // Mock successful HTTP response
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      })

      const result = await webhookService.testWebhook(webhookId, testPayload)

      expect(result.success).toBe(true)
      expect(result.responseTime).toBeGreaterThan(0)
    })
  })

  describe('retryDelivery', () => {
    it('should retry failed delivery with exponential backoff', async () => {
      const deliveryId = 'delivery-1'
      const mockDelivery = {
        id: deliveryId,
        webhookId: 'webhook-1',
        url: 'https://api.example.com/webhook',
        payload: { test: true },
        attempts: 1,
        maxAttempts: 3,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockDelivery]),
        }),
      })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      // Mock successful retry
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      })

      const result = await webhookService.retryDelivery(deliveryId)

      expect(result.success).toBe(true)
    })
  })

  describe('generateSignature', () => {
    it('should generate valid HMAC signature', () => {
      const payload = '{"test": true}'
      const secret = 'test-secret'

      const signature = webhookService.generateSignature(payload, secret)

      expect(signature).toMatch(/^sha256=/)
      expect(signature.length).toBeGreaterThan(10)
    })

    it('should generate consistent signatures for same input', () => {
      const payload = '{"test": true}'
      const secret = 'test-secret'

      const signature1 = webhookService.generateSignature(payload, secret)
      const signature2 = webhookService.generateSignature(payload, secret)

      expect(signature1).toBe(signature2)
    })
  })

  describe('verifySignature', () => {
    it('should verify valid signatures correctly', () => {
      const payload = '{"test": true}'
      const secret = 'test-secret'
      const signature = webhookService.generateSignature(payload, secret)

      const isValid = webhookService.verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should reject invalid signatures', () => {
      const payload = '{"test": true}'
      const secret = 'test-secret'
      const invalidSignature = 'sha256=invalid'

      const isValid = webhookService.verifySignature(payload, invalidSignature, secret)

      expect(isValid).toBe(false)
    })
  })
})
