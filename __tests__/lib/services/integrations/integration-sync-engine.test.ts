import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { IntegrationSyncEngine } from '@/lib/services/integrations/integration-sync-engine'
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

// Mock integration services
jest.mock('@/lib/services/integrations/stripe-integration', () => ({
  StripeIntegration: jest.fn().mockImplementation(() => ({
    syncCustomers: jest.fn(),
    syncInvoices: jest.fn(),
    syncPayments: jest.fn(),
  })),
}))

jest.mock('@/lib/services/integrations/slack-integration', () => ({
  SlackIntegration: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn(),
    getChannels: jest.fn(),
  })),
}))

describe('IntegrationSyncEngine', () => {
  let syncEngine: IntegrationSyncEngine
  let mockDb: any

  beforeEach(() => {
    jest.clearAllMocks()
    syncEngine = new IntegrationSyncEngine()
    mockDb = db as any
  })

  describe('syncIntegration', () => {
    it('should sync Stripe integration successfully', async () => {
      const connectionId = 'stripe-connection-1'
      const syncType = 'full'
      const mockConnection = {
        id: connectionId,
        service: 'stripe',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isActive: true,
        lastSyncAt: new Date('2024-01-01'),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockConnection]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'sync-1' }),
      })

      const result = await syncEngine.syncIntegration(connectionId, syncType)

      expect(result.success).toBe(true)
      expect(result.syncId).toBe('sync-1')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should handle sync errors gracefully', async () => {
      const connectionId = 'stripe-connection-1'
      const syncType = 'full'

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      })

      const result = await syncEngine.syncIntegration(connectionId, syncType)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should perform incremental sync when specified', async () => {
      const connectionId = 'stripe-connection-1'
      const syncType = 'incremental'
      const mockConnection = {
        id: connectionId,
        service: 'stripe',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isActive: true,
        lastSyncAt: new Date('2024-01-01'),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockConnection]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'sync-1' }),
      })

      const result = await syncEngine.syncIntegration(connectionId, syncType)

      expect(result.success).toBe(true)
      expect(result.syncType).toBe('incremental')
    })
  })

  describe('mapData', () => {
    it('should map Stripe customer data to internal format', () => {
      const stripeCustomer = {
        id: 'cus_stripe123',
        email: 'customer@example.com',
        name: 'John Doe',
        created: 1640995200,
        metadata: { source: 'stripe' },
      }

      const mapping = {
        id: 'stripe_id',
        email: 'email',
        name: 'name',
        created: 'created_at',
        metadata: 'metadata',
      }

      const result = syncEngine.mapData(stripeCustomer, mapping)

      expect(result).toEqual({
        stripe_id: 'cus_stripe123',
        email: 'customer@example.com',
        name: 'John Doe',
        created_at: 1640995200,
        metadata: { source: 'stripe' },
      })
    })

    it('should handle nested object mapping', () => {
      const sourceData = {
        customer: {
          id: 'cus_123',
          email: 'test@example.com',
        },
        invoice: {
          id: 'inv_123',
          amount: 1000,
        },
      }

      const mapping = {
        'customer.id': 'customerId',
        'customer.email': 'customerEmail',
        'invoice.id': 'invoiceId',
        'invoice.amount': 'amount',
      }

      const result = syncEngine.mapData(sourceData, mapping)

      expect(result).toEqual({
        customerId: 'cus_123',
        customerEmail: 'test@example.com',
        invoiceId: 'inv_123',
        amount: 1000,
      })
    })

    it('should handle array mapping', () => {
      const sourceData = {
        items: [
          { id: 'item1', name: 'Product 1', price: 100 },
          { id: 'item2', name: 'Product 2', price: 200 },
        ],
      }

      const mapping = {
        'items[].id': 'productIds',
        'items[].name': 'productNames',
        'items[].price': 'prices',
      }

      const result = syncEngine.mapData(sourceData, mapping)

      expect(result).toEqual({
        productIds: ['item1', 'item2'],
        productNames: ['Product 1', 'Product 2'],
        prices: [100, 200],
      })
    })
  })

  describe('transformData', () => {
    it('should apply data transformations', () => {
      const data = {
        amount: 1000, // cents
        date: '2024-01-01T00:00:00Z',
        status: 'paid',
      }

      const transformations = {
        amount: (value: number) => value / 100, // Convert cents to dollars
        date: (value: string) => new Date(value).toISOString(),
        status: (value: string) => value.toUpperCase(),
      }

      const result = syncEngine.transformData(data, transformations)

      expect(result).toEqual({
        amount: 10, // Converted to dollars
        date: '2024-01-01T00:00:00.000Z',
        status: 'PAID',
      })
    })

    it('should handle missing transformation functions gracefully', () => {
      const data = {
        amount: 1000,
        name: 'Test Item',
      }

      const transformations = {
        amount: (value: number) => value / 100,
        // Missing transformation for 'name'
      }

      const result = syncEngine.transformData(data, transformations)

      expect(result).toEqual({
        amount: 10,
        name: 'Test Item', // Unchanged
      })
    })
  })

  describe('retrySync', () => {
    it('should retry failed sync operations with exponential backoff', async () => {
      const syncId = 'sync-1'
      const maxRetries = 3
      const baseDelay = 1000

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: syncId,
            status: 'failed',
            attempts: 1,
            maxAttempts: maxRetries,
          }]),
        }),
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      })

      const result = await syncEngine.retrySync(syncId)

      expect(result.success).toBe(true)
      expect(result.attempts).toBe(2)
    })

    it('should stop retrying after max attempts', async () => {
      const syncId = 'sync-1'
      const maxRetries = 3

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: syncId,
            status: 'failed',
            attempts: maxRetries,
            maxAttempts: maxRetries,
          }]),
        }),
      })

      const result = await syncEngine.retrySync(syncId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Max retry attempts reached')
    })
  })

  describe('getSyncStatus', () => {
    it('should return sync status for a connection', async () => {
      const connectionId = 'stripe-connection-1'
      const mockSync = {
        id: 'sync-1',
        connectionId,
        status: 'completed',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:05:00Z'),
        recordsProcessed: 100,
        recordsSynced: 95,
        errors: 5,
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([mockSync]),
          }),
        }),
      })

      const result = await syncEngine.getSyncStatus(connectionId)

      expect(result.success).toBe(true)
      expect(result.sync).toEqual(mockSync)
    })

    it('should handle missing sync records', async () => {
      const connectionId = 'non-existent-connection'

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await syncEngine.getSyncStatus(connectionId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No sync records found')
    })
  })

  describe('scheduleSync', () => {
    it('should schedule recurring sync operations', async () => {
      const connectionId = 'stripe-connection-1'
      const interval = 'daily'
      const time = '09:00'

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'schedule-1' }),
      })

      const result = await syncEngine.scheduleSync(connectionId, interval, time)

      expect(result.success).toBe(true)
      expect(result.scheduleId).toBe('schedule-1')
    })

    it('should validate sync intervals', async () => {
      const connectionId = 'stripe-connection-1'
      const interval = 'invalid' as any
      const time = '09:00'

      const result = await syncEngine.scheduleSync(connectionId, interval, time)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid sync interval')
    })
  })
})
