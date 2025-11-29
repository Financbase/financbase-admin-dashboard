/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IntegrationService } from '@/lib/services/integration-service'
import { db } from '@/lib/db'
import { integrations, integrationConnections, integrationSyncs } from '@/lib/db/schemas'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Unmock integration service to test actual implementation
vi.unmock('@/lib/services/integration-service')

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

describe('IntegrationService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('getIntegrations', () => {
    it('should get all integrations', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Stripe', category: 'payment', isActive: true },
        { id: 2, name: 'Slack', category: 'communication', isActive: true },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockIntegrations))

      const result = await IntegrationService.getIntegrations()

      expect(result).toEqual(mockIntegrations)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should filter integrations by category', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Stripe', category: 'payment', isActive: true },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockIntegrations))

      const result = await IntegrationService.getIntegrations({ category: 'payment' })

      expect(result).toEqual(mockIntegrations)
    })

    it('should filter integrations by isActive', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Stripe', category: 'payment', isActive: true },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockIntegrations))

      const result = await IntegrationService.getIntegrations({ isActive: true })

      expect(result).toEqual(mockIntegrations)
    })

    it('should search integrations by name or description', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Stripe', description: 'Payment processing', isActive: true },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockIntegrations))

      const result = await IntegrationService.getIntegrations({ search: 'Stripe' })

      expect(result).toEqual(mockIntegrations)
    })

    it('should paginate integrations', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Stripe', isActive: true },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockIntegrations))

      const result = await IntegrationService.getIntegrations({ limit: 10, offset: 0 })

      expect(result).toEqual(mockIntegrations)
    })
  })

  describe('getIntegration', () => {
    it('should get integration by ID', async () => {
      const mockIntegration = { id: 1, name: 'Stripe', slug: 'stripe' }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockIntegration]),
          }),
        }),
      })

      const result = await IntegrationService.getIntegration(1)

      expect(result).toEqual(mockIntegration)
    })

    it('should get integration by slug', async () => {
      const mockIntegration = { id: 1, name: 'Stripe', slug: 'stripe' }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockIntegration]),
          }),
        }),
      })

      const result = await IntegrationService.getIntegration('stripe')

      expect(result).toEqual(mockIntegration)
    })

    it('should return null when integration not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await IntegrationService.getIntegration(999)

      expect(result).toBeNull()
    })
  })

  describe('getConnections', () => {
    it('should get user connections', async () => {
      const mockConnections = [
        { id: 1, userId: 'user-123', integrationId: 1, status: 'active' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockConnections))

      const result = await IntegrationService.getConnections('user-123')

      expect(result).toEqual(mockConnections)
    })

    it('should filter connections by organization', async () => {
      const mockConnections = [
        { id: 1, userId: 'user-123', organizationId: 'org-1', status: 'active' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockConnections))

      const result = await IntegrationService.getConnections('user-123', {
        organizationId: 'org-1',
      })

      expect(result).toEqual(mockConnections)
    })

    it('should filter connections by status', async () => {
      const mockConnections = [
        { id: 1, userId: 'user-123', status: 'active' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockConnections))

      const result = await IntegrationService.getConnections('user-123', {
        status: 'active',
      })

      expect(result).toEqual(mockConnections)
    })

    it('should filter connections by integration ID', async () => {
      const mockConnections = [
        { id: 1, userId: 'user-123', integrationId: 1, status: 'active' },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockConnections))

      const result = await IntegrationService.getConnections('user-123', {
        integrationId: 1,
      })

      expect(result).toEqual(mockConnections)
    })
  })

  describe('getConnection', () => {
    it('should get connection by ID', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        status: 'active',
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      const result = await IntegrationService.getConnection(1, 'user-123')

      expect(result).toEqual(mockConnection)
    })

    it('should return null when connection not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await IntegrationService.getConnection(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('createConnection', () => {
    it('should create a new connection', async () => {
      const connectionData = {
        integrationId: 1,
        name: 'Stripe Connection',
        accessToken: 'token-123',
      }

      const mockConnection = {
        id: 1,
        userId: 'user-123',
        ...connectionData,
        status: 'active',
        isActive: true,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockConnection]),
        }),
      })

      const result = await IntegrationService.createConnection('user-123', connectionData)

      expect(result).toEqual(mockConnection)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should create connection with optional fields', async () => {
      const connectionData = {
        integrationId: 1,
        name: 'Stripe Connection',
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        tokenExpiresAt: new Date('2025-12-31'),
        organizationId: 'org-1',
        settings: { autoSync: true },
      }

      const mockConnection = {
        id: 1,
        userId: 'user-123',
        ...connectionData,
        status: 'active',
        isActive: true,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockConnection]),
        }),
      })

      const result = await IntegrationService.createConnection('user-123', connectionData)

      expect(result).toEqual(mockConnection)
    })
  })

  describe('updateConnection', () => {
    it('should update connection', async () => {
      const updateData = {
        name: 'Updated Connection',
        status: 'inactive' as const,
      }

      const mockUpdatedConnection = {
        id: 1,
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedConnection]),
          }),
        }),
      })

      const result = await IntegrationService.updateConnection(1, 'user-123', updateData)

      expect(result).toEqual(mockUpdatedConnection)
    })

    it('should return null when connection not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await IntegrationService.updateConnection(999, 'user-123', {
        name: 'Updated',
      })

      expect(result).toBeNull()
    })
  })

  describe('deleteConnection', () => {
    it('should delete connection', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      })

      const result = await IntegrationService.deleteConnection(1, 'user-123')

      expect(result).toBe(true)
    })

    it('should return false when connection not found', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await IntegrationService.deleteConnection(999, 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('getSyncs', () => {
    it('should get sync history for connection', async () => {
      const mockSyncs = [
        {
          id: 1,
          connectionId: 1,
          syncId: 'sync-123',
          status: 'completed',
          type: 'full',
        },
      ]

      // Mock getConnection first
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 1, userId: 'user-123' }]),
          }),
        }),
      }).mockReturnValueOnce(createThenableQuery(mockSyncs))

      const result = await IntegrationService.getSyncs(1, 'user-123')

      expect(result).toEqual(mockSyncs)
    })

    it('should filter syncs by status', async () => {
      const mockSyncs = [
        {
          id: 1,
          connectionId: 1,
          syncId: 'sync-123',
          status: 'completed',
        },
      ]

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 1, userId: 'user-123' }]),
          }),
        }),
      }).mockReturnValueOnce(createThenableQuery(mockSyncs))

      const result = await IntegrationService.getSyncs(1, 'user-123', {
        status: 'completed',
      })

      expect(result).toEqual(mockSyncs)
    })

    it('should throw error when connection not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        IntegrationService.getSyncs(999, 'user-123')
      ).rejects.toThrow('Connection not found')
    })
  })

  describe('createSync', () => {
    it('should create a new sync operation', async () => {
      const syncData = {
        type: 'full' as const,
        direction: 'import' as const,
        entityTypes: ['invoices', 'payments'],
      }

      const mockSync = {
        id: 1,
        connectionId: 1,
        userId: 'user-123',
        syncId: 'sync_123',
        ...syncData,
        status: 'pending',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSync]),
        }),
      })

      const result = await IntegrationService.createSync(1, 'user-123', syncData)

      expect(result).toBeDefined()
      expect(result.syncId).toBeDefined()
      expect(result.status).toBe('pending')
    })
  })

  describe('updateSync', () => {
    it('should update sync status', async () => {
      const updateData = {
        status: 'completed' as const,
        recordsProcessed: 100,
        completedAt: new Date(),
      }

      const mockUpdatedSync = {
        id: 1,
        syncId: 'sync-123',
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedSync]),
          }),
        }),
      })

      const result = await IntegrationService.updateSync('sync-123', 'user-123', updateData)

      expect(result).toEqual(mockUpdatedSync)
    })

    it('should return null when sync not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await IntegrationService.updateSync('sync-999', 'user-123', {
        status: 'completed',
      })

      expect(result).toBeNull()
    })
  })

  describe('checkConnectionHealth', () => {
    it('should return healthy status for valid connection', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        status: 'active',
        tokenExpiresAt: new Date(Date.now() + 86400000), // Future date
        syncStatus: 'success',
        lastSyncAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      const result = await IntegrationService.checkConnectionHealth(1, 'user-123')

      expect(result.healthy).toBe(true)
      expect(result.status).toBe('active')
    })

    it('should return unhealthy status for expired token', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        status: 'active',
        tokenExpiresAt: new Date(Date.now() - 86400000), // Past date
        lastSyncAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      const result = await IntegrationService.checkConnectionHealth(1, 'user-123')

      expect(result.healthy).toBe(false)
      expect(result.status).toBe('expired')
      expect(result.error).toBe('Access token has expired')
    })

    it('should return unhealthy status for failed sync', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        status: 'active',
        syncStatus: 'failed',
        syncError: 'Sync failed',
        lastSyncAt: new Date(),
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      })

      const result = await IntegrationService.checkConnectionHealth(1, 'user-123')

      expect(result.healthy).toBe(false)
      expect(result.status).toBe('error')
      expect(result.error).toBe('Sync failed')
    })

    it('should throw error when connection not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        IntegrationService.checkConnectionHealth(999, 'user-123')
      ).rejects.toThrow('Connection not found')
    })
  })

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        accessToken: 'token-123',
      }

      const mockIntegration = {
        id: 1,
        name: 'Stripe',
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockIntegration]),
          }),
        }),
      })

      const result = await IntegrationService.testConnection(1, 'user-123')

      expect(result.success).toBe(true)
      expect(result.message).toBe('Connection test successful')
    })

    it('should fail test when no access token', async () => {
      const mockConnection = {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        accessToken: null,
      }

      const mockIntegration = {
        id: 1,
        name: 'Stripe',
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockConnection]),
          }),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockIntegration]),
          }),
        }),
      })

      const result = await IntegrationService.testConnection(1, 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No access token found')
    })

    it('should throw error when connection not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        IntegrationService.testConnection(999, 'user-123')
      ).rejects.toThrow('Connection not found')
    })
  })

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const providers = IntegrationService.getAvailableProviders()

      expect(providers).toBeInstanceOf(Array)
      expect(providers.length).toBeGreaterThan(0)
      expect(providers[0]).toHaveProperty('name')
      expect(providers[0]).toHaveProperty('slug')
      expect(providers[0]).toHaveProperty('category')
      expect(providers[0]).toHaveProperty('description')
    })

    it('should include Stripe provider', () => {
      const providers = IntegrationService.getAvailableProviders()
      const stripe = providers.find(p => p.slug === 'stripe')

      expect(stripe).toBeDefined()
      expect(stripe?.name).toBe('Stripe')
      expect(stripe?.category).toBe('payment')
    })

    it('should include Slack provider', () => {
      const providers = IntegrationService.getAvailableProviders()
      const slack = providers.find(p => p.slug === 'slack')

      expect(slack).toBeDefined()
      expect(slack?.name).toBe('Slack')
      expect(slack?.category).toBe('communication')
    })
  })
})

