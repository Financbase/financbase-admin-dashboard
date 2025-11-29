/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
  deleteClient,
  getClientStats,
  searchClients,
  getClientInvoiceHistory,
  toggleClientStatus,
  ClientService,
} from '@/lib/services/client-service'
import { db } from '@/lib/db'
import { NotificationHelpers } from '@/lib/services/notification-service'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    query: {
      clients: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      invoices: {
        findMany: vi.fn(),
      },
    },
  },
}))

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    client: {
      created: vi.fn(),
    },
  },
}))

// Unmock client service to test actual implementation
vi.unmock('@/lib/services/client-service')

// Helper to create a thenable query builder
const createThenableQuery = (result: any[]) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
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

describe('ClientService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('createClient', () => {
    it('should create a new client', async () => {
      const clientData = {
        userId: 'user-123',
        companyName: 'Acme Corp',
        email: 'contact@acme.com',
      }

      const mockClient = {
        id: 'client-123',
        ...clientData,
        country: 'US',
        currency: 'USD',
        paymentTerms: 'net30',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClient]),
        }),
      })

      const result = await createClient(clientData)

      expect(result).toEqual(mockClient)
      expect(NotificationHelpers.client.created).toHaveBeenCalledWith('user-123', 'client-123')
    })

    it('should create client with optional fields', async () => {
      const clientData = {
        userId: 'user-123',
        companyName: 'Acme Corp',
        contactName: 'John Doe',
        email: 'contact@acme.com',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        taxId: 'TAX123',
        currency: 'USD',
        paymentTerms: 'net30',
        notes: 'Important client',
        metadata: { source: 'referral' },
      }

      const mockClient = {
        id: 'client-123',
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClient]),
        }),
      })

      const result = await createClient(clientData)

      expect(result).toBeDefined()
      expect(result.contactName).toBe(clientData.contactName)
    })
  })

  describe('getClientById', () => {
    it('should get client by ID', async () => {
      const mockClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Acme Corp',
        email: 'contact@acme.com',
      }

      mockDb.query.clients.findFirst.mockResolvedValue(mockClient)

      const result = await getClientById('client-123', 'user-123')

      expect(result).toEqual(mockClient)
    })

    it('should return null when client not found', async () => {
      mockDb.query.clients.findFirst.mockResolvedValue(null)

      const result = await getClientById('client-999', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getClients', () => {
    it('should get all clients for user', async () => {
      const mockClients = [
        {
          id: 'client-123',
          userId: 'user-123',
          companyName: 'Acme Corp',
          email: 'contact@acme.com',
          isActive: true,
        },
      ]

      mockDb.query.clients.findMany.mockResolvedValue(mockClients)

      const result = await getClients('user-123')

      expect(result).toEqual(mockClients)
    })

    it('should filter clients by search query', async () => {
      const mockClients = [
        {
          id: 'client-123',
          userId: 'user-123',
          companyName: 'Acme Corp',
          email: 'contact@acme.com',
          isActive: true,
        },
      ]

      mockDb.query.clients.findMany.mockResolvedValue(mockClients)

      const result = await getClients('user-123', { search: 'Acme' })

      expect(result).toBeDefined()
    })

    it('should filter clients by active status', async () => {
      const mockClients = [
        {
          id: 'client-123',
          userId: 'user-123',
          companyName: 'Acme Corp',
          email: 'contact@acme.com',
          isActive: true,
        },
      ]

      mockDb.query.clients.findMany.mockResolvedValue(mockClients)

      const result = await getClients('user-123', { isActive: true })

      expect(result).toBeDefined()
    })

    it('should paginate clients', async () => {
      const mockClients = [
        {
          id: 'client-123',
          userId: 'user-123',
          companyName: 'Acme Corp',
          email: 'contact@acme.com',
          isActive: true,
        },
      ]

      mockDb.query.clients.findMany.mockResolvedValue(mockClients)

      const result = await getClients('user-123', { limit: 10, offset: 0 })

      expect(result).toBeDefined()
    })
  })

  describe('updateClient', () => {
    it('should update client', async () => {
      const updateData = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Updated Corp',
        email: 'newemail@acme.com',
      }

      const mockUpdatedClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Updated Corp',
        email: 'newemail@acme.com',
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedClient]),
          }),
        }),
      })

      const result = await updateClient(updateData)

      expect(result).toEqual(mockUpdatedClient)
    })
  })

  describe('deleteClient', () => {
    it('should delete client', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await deleteClient('client-123', 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })

  describe('getClientStats', () => {
    it('should get client statistics', async () => {
      const mockTotalClients = [{ count: 10 }]
      const mockActiveClients = [{ count: 8 }]
      const mockRevenueData = [
        {
          clientId: 'client-123',
          clientName: 'Acme Corp',
          totalAmount: 50000,
          invoiceCount: 5,
        },
        {
          clientId: 'client-456',
          clientName: 'Beta Inc',
          totalAmount: 30000,
          invoiceCount: 3,
        },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalClients))
        .mockReturnValueOnce(createThenableQuery(mockActiveClients))
        .mockReturnValueOnce(createThenableQuery(mockRevenueData))

      const result = await getClientStats('user-123')

      expect(result).toBeDefined()
      expect(result.totalClients).toBe(10)
      expect(result.activeClients).toBe(8)
      expect(result.totalRevenue).toBe(80000)
      expect(result.averageInvoiceValue).toBeGreaterThan(0)
      expect(result.topClients).toHaveLength(2)
    })

    it('should handle empty revenue data', async () => {
      const mockTotalClients = [{ count: 5 }]
      const mockActiveClients = [{ count: 5 }]
      const mockRevenueData: any[] = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalClients))
        .mockReturnValueOnce(createThenableQuery(mockActiveClients))
        .mockReturnValueOnce(createThenableQuery(mockRevenueData))

      const result = await getClientStats('user-123')

      expect(result.totalRevenue).toBe(0)
      expect(result.averageInvoiceValue).toBe(0)
      expect(result.topClients).toHaveLength(0)
    })
  })

  describe('searchClients', () => {
    it('should search clients by query', async () => {
      const mockClients = [
        {
          id: 'client-123',
          userId: 'user-123',
          companyName: 'Acme Corp',
          email: 'contact@acme.com',
        },
      ]

      mockDb.query.clients.findMany.mockResolvedValue(mockClients)

      const result = await searchClients('user-123', 'Acme', 10)

      expect(result).toEqual(mockClients)
    })
  })

  describe('getClientInvoiceHistory', () => {
    it('should get client invoice history', async () => {
      const mockInvoices = [
        {
          id: 1,
          clientId: 'client-123',
          userId: 'user-123',
          invoiceNumber: 'INV-001',
          total: '1000.00',
          status: 'paid',
        },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getClientInvoiceHistory('client-123', 'user-123', 10)

      expect(result).toEqual(mockInvoices)
    })
  })

  describe('toggleClientStatus', () => {
    it('should toggle client active status', async () => {
      const mockUpdatedClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Acme Corp',
        isActive: false,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedClient]),
          }),
        }),
      })

      const result = await toggleClientStatus('client-123', 'user-123', false)

      expect(result.isActive).toBe(false)
    })
  })

  describe('ClientService export', () => {
    it('should export all functions', () => {
      expect(ClientService.create).toBe(createClient)
      expect(ClientService.getById).toBe(getClientById)
      expect(ClientService.getAll).toBe(getClients)
      expect(ClientService.update).toBe(updateClient)
      expect(ClientService.delete).toBe(deleteClient)
      expect(ClientService.getStats).toBe(getClientStats)
      expect(ClientService.search).toBe(searchClients)
      expect(ClientService.getInvoiceHistory).toBe(getClientInvoiceHistory)
      expect(ClientService.toggleStatus).toBe(toggleClientStatus)
    })
  })
})

