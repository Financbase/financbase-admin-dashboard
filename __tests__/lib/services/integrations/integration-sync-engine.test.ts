import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IntegrationSyncEngine } from '@/lib/services/integrations/integration-sync-engine'
import { db } from '@/lib/db'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
    delete: vi.fn(),
  },
}))

// Mock integration services
vi.mock('@/lib/services/integrations/stripe-integration', () => ({
  StripeIntegration: vi.fn().mockImplementation(() => ({
    syncCustomers: vi.fn(),
    syncInvoices: vi.fn(),
    syncPayments: vi.fn(),
  })),
}))

vi.mock('@/lib/services/integrations/slack-integration', () => ({
  SlackIntegration: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    getChannels: vi.fn(),
  })),
}))

// Don't mock IntegrationSyncEngine - test the actual implementation
// Instead, mock the dependencies (db, integration services)

describe('IntegrationSyncEngine', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('startSync', () => {
    it('should sync Stripe integration successfully', async () => {
      const connectionId = 1
      const userId = 'user-123'
      const mockConnection = {
        id: connectionId,
        userId,
        integration: { slug: 'stripe' },
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isActive: true,
        lastSyncAt: new Date('2024-01-01'),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      })

      const syncId = await IntegrationSyncEngine.startSync(connectionId, userId, { forceFullSync: true })

      expect(syncId).toBeDefined()
      expect(typeof syncId).toBe('string')
      expect(syncId).toContain('sync_')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should handle sync errors gracefully', async () => {
      const connectionId = 1
      const userId = 'user-123'

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No connection found
          }),
        }),
      })

      await expect(
        IntegrationSyncEngine.startSync(connectionId, userId, {})
      ).rejects.toThrow('Connection not found')
    })

    it('should perform incremental sync when specified', async () => {
      const connectionId = 1
      const userId = 'user-123'
      const mockConnection = {
        id: connectionId,
        userId,
        integration: { slug: 'stripe' },
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        isActive: true,
        lastSyncAt: new Date('2024-01-01'),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      })

      const syncId = await IntegrationSyncEngine.startSync(connectionId, userId, { forceFullSync: false })

      expect(syncId).toBeDefined()
      expect(typeof syncId).toBe('string')
    })
  })

  describe('getSyncStatus', () => {
    it('should get sync status successfully', async () => {
      const syncId = 'sync_123'
      const mockSync = {
        syncId,
        status: 'running',
        connectionId: 1,
        userId: 'user-123',
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSync]),
          }),
        }),
      })

      const result = await IntegrationSyncEngine.getSyncStatus(syncId)

      expect(result).toBeDefined()
      expect(result.syncId).toBe(syncId)
      expect(result.status).toBe('running')
    })
  })

  describe('cancelSync', () => {
    it('should cancel sync successfully', async () => {
      const syncId = 'sync_123'

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      await IntegrationSyncEngine.cancelSync(syncId)

      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('getSyncHistory', () => {
    it('should get sync history for a connection', async () => {
      const connectionId = 1
      const userId = 'user-123'
      const mockSyncs = [
        { syncId: 'sync_1', status: 'completed', createdAt: new Date() },
        { syncId: 'sync_2', status: 'failed', createdAt: new Date() },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSyncs),
            }),
          }),
        }),
      })

      const result = await IntegrationSyncEngine.getSyncHistory(connectionId, userId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })
  })

  describe('getSyncStatus', () => {
    it('should return sync status for a sync', async () => {
      const syncId = 'sync_123'
      const mockSync = {
        syncId,
        status: 'running',
        connectionId: 1,
        userId: 'user-123',
        createdAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSync]),
          }),
        }),
      })

      const result = await IntegrationSyncEngine.getSyncStatus(syncId)

      expect(result).toBeDefined()
      expect(result.syncId).toBe(syncId)
      expect(result.status).toBe('running')
    })

    it('should handle missing sync records', async () => {
      const syncId = 'non-existent-sync'

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No sync found
          }),
        }),
      })

      const result = await IntegrationSyncEngine.getSyncStatus(syncId)

      expect(result).toBeDefined()
      // getSyncStatus returns the sync object or null, not a success/error object
      expect(result).toBeNull()
    })
  })
})
