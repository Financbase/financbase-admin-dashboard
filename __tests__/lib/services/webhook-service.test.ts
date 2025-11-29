/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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

// Unmock webhook service to test actual implementation
vi.unmock('@/lib/services/webhook-service')

// Mock fetch
global.fetch = vi.fn()

// Helper to create a thenable query builder
const createThenableQuery = (result: any[]) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
  }
  query.then = vi.fn((onResolve?: (value: any[]) => any) => {
    const promise = Promise.resolve(result)
    return onResolve ? promise.then(onResolve) : promise
  })
  query.catch = vi.fn((onReject?: (error: any) => any) => {
    const promise = Promise.resolve(result)
    return onReject ? promise.catch(onReject) : promise
  })
  Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' })
  return query
}

describe('WebhookService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    // Reset select mock to use thenable pattern by default
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('generateWebhookSecret', () => {
    it('should generate a secure webhook secret', () => {
      const secret = WebhookService.generateWebhookSecret()

      expect(secret).toBeDefined()
      expect(typeof secret).toBe('string')
      expect(secret.length).toBe(64) // 32 bytes = 64 hex characters
    })

    it('should generate unique secrets', () => {
      const secret1 = WebhookService.generateWebhookSecret()
      const secret2 = WebhookService.generateWebhookSecret()

      expect(secret1).not.toBe(secret2)
    })
  })

  describe('getWebhooks', () => {
    it('should get all webhooks for user', async () => {
      const mockWebhooks = [
        { id: 1, userId: 'user-123', name: 'Webhook 1', url: 'https://example.com/webhook' },
        { id: 2, userId: 'user-123', name: 'Webhook 2', url: 'https://example.com/webhook2' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWebhooks))

      const result = await WebhookService.getWebhooks('user-123')

      expect(result).toEqual(mockWebhooks)
    })

    it('should filter webhooks by organization', async () => {
      const mockWebhooks = [
        { id: 1, userId: 'user-123', organizationId: 'org-1', name: 'Webhook 1' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWebhooks))

      const result = await WebhookService.getWebhooks('user-123', {
        organizationId: 'org-1',
      })

      expect(result).toEqual(mockWebhooks)
    })

    it('should filter webhooks by isActive', async () => {
      const mockWebhooks = [
        { id: 1, userId: 'user-123', isActive: true, name: 'Active Webhook' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWebhooks))

      const result = await WebhookService.getWebhooks('user-123', {
        isActive: true,
      })

      expect(result).toEqual(mockWebhooks)
    })

    it('should search webhooks by name or URL', async () => {
      const mockWebhooks = [
        { id: 1, userId: 'user-123', name: 'Invoice Webhook', url: 'https://example.com' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWebhooks))

      const result = await WebhookService.getWebhooks('user-123', {
        search: 'Invoice',
      })

      expect(result).toEqual(mockWebhooks)
    })

    it('should paginate webhooks', async () => {
      const mockWebhooks = [
        { id: 1, userId: 'user-123', name: 'Webhook 1' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWebhooks))

      const result = await WebhookService.getWebhooks('user-123', {
        limit: 10,
        offset: 0,
      })

      expect(result).toEqual(mockWebhooks)
    })
  })

  describe('getWebhook', () => {
    it('should get webhook by ID', async () => {
      const mockWebhook = {
        id: 1,
        userId: 'user-123',
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      const result = await WebhookService.getWebhook(1, 'user-123')

      expect(result).toEqual(mockWebhook)
    })

    it('should return null when webhook not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WebhookService.getWebhook(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('createWebhook', () => {
    it('should create a new webhook successfully', async () => {
      const webhookData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['invoice.created', 'payment.received'],
      }

      const mockWebhook = {
        id: 1,
        userId: 'user-123',
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        secret: 'generated-secret',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      const result = await WebhookService.createWebhook('user-123', webhookData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe(webhookData.name)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should generate secret if not provided', async () => {
      const webhookData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['invoice.created'],
      }

      const mockWebhook = {
        id: 1,
        userId: 'user-123',
        ...webhookData,
        secret: 'generated-secret',
        isActive: true,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      const result = await WebhookService.createWebhook('user-123', webhookData)

      expect(result.secret).toBeDefined()
    })

    it('should create webhook with optional fields', async () => {
      const webhookData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['invoice.created'],
        description: 'Test description',
        organizationId: 'org-1',
        retryPolicy: {
          maxRetries: 5,
          retryDelay: 2000,
          backoffMultiplier: 2,
        },
        headers: { 'X-Custom-Header': 'value' },
        timeout: 60000,
      }

      const mockWebhook = {
        id: 1,
        userId: 'user-123',
        ...webhookData,
        isActive: true,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      const result = await WebhookService.createWebhook('user-123', webhookData)

      expect(result).toBeDefined()
      expect(result.description).toBe(webhookData.description)
    })
  })

  describe('updateWebhook', () => {
    it('should update webhook', async () => {
      const updateData = {
        name: 'Updated Webhook',
        isActive: false,
      }

      const mockUpdatedWebhook = {
        id: 1,
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedWebhook]),
          }),
        }),
      })

      const result = await WebhookService.updateWebhook(1, 'user-123', updateData)

      expect(result).toEqual(mockUpdatedWebhook)
    })

    it('should return null when webhook not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WebhookService.updateWebhook(999, 'user-123', {
        name: 'Updated',
      })

      expect(result).toBeNull()
    })
  })

  describe('deleteWebhook', () => {
    it('should delete webhook', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      })

      const result = await WebhookService.deleteWebhook(1, 'user-123')

      expect(result).toBe(true)
    })

    it('should return false when webhook not found', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await WebhookService.deleteWebhook(999, 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('getWebhookDeliveries', () => {
    it('should get webhook deliveries', async () => {
      const mockDeliveries = [
        {
          id: 1,
          webhookId: 1,
          deliveryId: 'del-123',
          status: 'delivered',
          eventType: 'invoice.created',
        },
      ]

      // Mock getWebhook first
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 1, userId: 'user-123' }]),
          }),
        }),
      }).mockReturnValueOnce(createThenableQuery(mockDeliveries))

      const result = await WebhookService.getWebhookDeliveries(1, 'user-123')

      expect(result).toEqual(mockDeliveries)
    })

    it('should filter deliveries by status', async () => {
      const mockDeliveries = [
        {
          id: 1,
          webhookId: 1,
          deliveryId: 'del-123',
          status: 'failed',
        },
      ]

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 1, userId: 'user-123' }]),
          }),
        }),
      }).mockReturnValueOnce(createThenableQuery(mockDeliveries))

      const result = await WebhookService.getWebhookDeliveries(1, 'user-123', {
        status: 'failed',
      })

      expect(result).toEqual(mockDeliveries)
    })

    it('should throw error when webhook not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        WebhookService.getWebhookDeliveries(999, 'user-123')
      ).rejects.toThrow('Webhook not found')
    })
  })

  describe('createWebhookDelivery', () => {
    it('should create webhook delivery', async () => {
      const deliveryData = {
        eventType: 'invoice.created',
        eventId: 'event-123',
        payload: { invoiceId: 1, amount: 1000 },
      }

      const mockDelivery = {
        id: 1,
        webhookId: 1,
        userId: 'user-123',
        deliveryId: 'del_123',
        ...deliveryData,
        status: 'pending',
        attemptCount: 1,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockDelivery]),
        }),
      })

      const result = await WebhookService.createWebhookDelivery(1, 'user-123', deliveryData)

      expect(result).toBeDefined()
      expect(result.deliveryId).toBeDefined()
      expect(result.status).toBe('pending')
    })
  })

  describe('updateWebhookDelivery', () => {
    it('should update webhook delivery status', async () => {
      const updateData = {
        status: 'delivered' as const,
        httpStatus: 200,
        deliveredAt: new Date(),
      }

      const mockUpdatedDelivery = {
        id: 1,
        deliveryId: 'del-123',
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedDelivery]),
          }),
        }),
      })

      const result = await WebhookService.updateWebhookDelivery('del-123', 'user-123', updateData)

      expect(result).toEqual(mockUpdatedDelivery)
    })

    it('should return null when delivery not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WebhookService.updateWebhookDelivery('del-999', 'user-123', {
        status: 'delivered',
      })

      expect(result).toBeNull()
    })
  })

  describe('testWebhook', () => {
    it('should test webhook endpoint successfully', async () => {
      const webhookId = 1
      const mockWebhook = {
        id: webhookId,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
        timeout: 30000,
        headers: null,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      // Mock successful HTTP response
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
      })

      const result = await WebhookService.testWebhook(webhookId, 'user-123')

      expect(result.success).toBe(true)
      expect(result.httpStatus).toBe(200)
      expect(result.duration).toBeDefined()
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'webhook.test',
            'X-Webhook-Id': '1',
          }),
        })
      )
    })

    it('should handle webhook test failures', async () => {
      const webhookId = 1
      const mockWebhook = {
        id: webhookId,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
        timeout: 30000,
        headers: null,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      // Mock failed HTTP response
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal Server Error'),
      })

      const result = await WebhookService.testWebhook(webhookId, 'user-123')

      expect(result.success).toBe(false)
      expect(result.httpStatus).toBe(500)
      expect(result.duration).toBeDefined()
    })

    it('should handle network errors', async () => {
      const webhookId = 1
      const mockWebhook = {
        id: webhookId,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        secret: 'test-secret',
        isActive: true,
        timeout: 30000,
        headers: null,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      // Mock network error
      ;(global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'))

      const result = await WebhookService.testWebhook(webhookId, 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.duration).toBeDefined()
    })

    it('should use custom test payload', async () => {
      const webhookId = 1
      const mockWebhook = {
        id: webhookId,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        isActive: true,
        timeout: 30000,
        headers: null,
      }

      const testPayload = {
        event: 'custom.test',
        data: { custom: 'data' },
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
      })

      await WebhookService.testWebhook(webhookId, 'user-123', testPayload)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/webhook',
        expect.objectContaining({
          body: JSON.stringify(testPayload),
        })
      )
    })

    it('should include custom headers', async () => {
      const webhookId = 1
      const mockWebhook = {
        id: webhookId,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        isActive: true,
        timeout: 30000,
        headers: { 'X-Custom-Header': 'value' },
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
      })

      await WebhookService.testWebhook(webhookId, 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/webhook',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'value',
          }),
        })
      )
    })

    it('should throw error when webhook not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        WebhookService.testWebhook(999, 'user-123')
      ).rejects.toThrow('Webhook not found')
    })

    it('should throw error when webhook is not active', async () => {
      const mockWebhook = {
        id: 1,
        userId: 'user-123',
        url: 'https://api.example.com/webhook',
        isActive: false,
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      await expect(
        WebhookService.testWebhook(1, 'user-123')
      ).rejects.toThrow('Webhook is not active')
    })
  })

  describe('retryWebhookDelivery', () => {
    it('should retry failed delivery with exponential backoff', async () => {
      const deliveryId = 'delivery-1'
      const userId = 'user-123'
      const mockDelivery = {
        deliveryId,
        webhookId: 1,
        userId,
        attemptCount: 1,
        status: 'failed',
      }

      const mockWebhook = {
        id: 1,
        userId,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockDelivery]),
          }),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockDelivery, status: 'retrying', attemptCount: 2 }]),
          }),
        }),
      })

      const result = await WebhookService.retryWebhookDelivery(deliveryId, userId)

      expect(result).toBeDefined()
      expect(result?.status).toBe('retrying')
      expect(result?.attemptCount).toBe(2)
    })

    it('should mark as failed when max retries exceeded', async () => {
      const deliveryId = 'delivery-1'
      const userId = 'user-123'
      const mockDelivery = {
        deliveryId,
        webhookId: 1,
        userId,
        attemptCount: 3, // Already at max retries
        status: 'failed',
      }

      const mockWebhook = {
        id: 1,
        userId,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockDelivery]),
          }),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhook]),
          }),
        }),
      })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockDelivery, status: 'failed', errorMessage: 'Max retries exceeded' }]),
          }),
        }),
      })

      const result = await WebhookService.retryWebhookDelivery(deliveryId, userId)

      expect(result?.status).toBe('failed')
      expect(result?.errorMessage).toBe('Max retries exceeded')
    })

    it('should return null when delivery not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WebhookService.retryWebhookDelivery('del-999', 'user-123')

      expect(result).toBeNull()
    })
    })
  })
