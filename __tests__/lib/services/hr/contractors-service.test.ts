/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContractorsService } from '@/lib/services/hr/contractors-service'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { hrContractors } from '@/lib/db/schemas'
import { sql } from 'drizzle-orm'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('ContractorsService', () => {
  let service: ContractorsService
  let mockDb: any

  beforeEach(() => {
    service = new ContractorsService()
    mockDb = db as any
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all contractors for user', async () => {
      const mockContractors = [
        {
          id: 'contractor-1',
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'active',
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockContractors),
          }),
        }),
      })

      const result = await service.getAll()

      expect(result).toHaveLength(1)
      expect(result[0].firstName).toBe('John')
    })

    it('should filter contractors by organization', async () => {
      const mockContractors = [
        {
          id: 'contractor-1',
          organizationId: 'org-123',
          status: 'active',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockContractors),
          }),
        }),
      })

      const result = await service.getAll({ organizationId: 'org-123' })

      expect(result).toHaveLength(1)
    })

    it('should filter contractors by search term', async () => {
      const mockContractors = [
        {
          id: 'contractor-1',
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockContractors),
          }),
        }),
      })

      const result = await service.getAll({ search: 'John' })

      expect(result).toHaveLength(1)
    })

    it('should filter contractors by type', async () => {
      const mockContractors = [
        {
          id: 'contractor-1',
          userId: 'user-123',
          contractorType: '1099',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockContractors),
          }),
        }),
      })

      const result = await service.getAll({ contractorType: '1099' })

      expect(result).toHaveLength(1)
      expect(result[0].contractorType).toBe('1099')
    })

    it('should filter contractors by status', async () => {
      const mockContractors = [
        {
          id: 'contractor-1',
          userId: 'user-123',
          status: 'active',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockContractors),
          }),
        }),
      })

      const result = await service.getAll({ status: 'active' })

      expect(result).toHaveLength(1)
    })
  })

  describe('getById', () => {
    it('should return contractor by ID', async () => {
      const mockContractor = {
        id: 'contractor-1',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contractorType: '1099',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockContractor]),
          }),
        }),
      })

      const result = await service.getById('contractor-1')

      expect(result).toBeDefined()
      expect(result.id).toBe('contractor-1')
      expect(result.firstName).toBe('John')
    })

    it('should throw error if contractor not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(service.getById('contractor-999')).rejects.toThrow('Contractor not found')
    })
  })

  describe('create', () => {
    it('should create a new contractor', async () => {
      const input = {
        userId: 'user-123',
        organizationId: 'org-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contractorType: '1099' as const,
        hourlyRate: '100.00',
        contractStartDate: new Date('2025-01-01'),
      }

      const mockCreatedContractor = {
        id: 'contractor-1',
        ...input,
        status: 'active',
        currency: 'USD',
        paymentTerms: 'net_30',
        timezone: 'UTC',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedContractor]),
        }),
      })

      const result = await service.create(input)

      expect(result).toBeDefined()
      expect(result.firstName).toBe('John')
      expect(result.contractorType).toBe('1099')
      expect(result.status).toBe('active')
    })

    it('should set default values for optional fields', async () => {
      const input = {
        userId: 'user-123',
        organizationId: 'org-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contractStartDate: new Date(),
      }

      const mockCreatedContractor = {
        id: 'contractor-1',
        ...input,
        contractorType: '1099',
        currency: 'USD',
        paymentTerms: 'net_30',
        status: 'active',
        timezone: 'UTC',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedContractor]),
        }),
      })

      const result = await service.create(input)

      expect(result.contractorType).toBe('1099')
      expect(result.currency).toBe('USD')
      expect(result.paymentTerms).toBe('net_30')
    })
  })

  describe('update', () => {
    it('should update contractor successfully', async () => {
      const mockContractor = {
        id: 'contractor-1',
        userId: 'user-123',
        firstName: 'John',
        hourlyRate: '100.00',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockContractor]),
          }),
        }),
      })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...mockContractor,
                hourlyRate: '120.00',
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      })

      const result = await service.update({
        id: 'contractor-1',
        hourlyRate: '120.00',
      })

      expect(result.hourlyRate).toBe('120.00')
    })

    it('should handle tags as JSON string', async () => {
      const mockContractor = {
        id: 'contractor-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockContractor]),
          }),
        }),
      })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...mockContractor,
                tags: JSON.stringify(['senior', 'developer']),
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      })

      const result = await service.update({
        id: 'contractor-1',
        tags: ['senior', 'developer'],
      })

      expect(result).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete contractor successfully', async () => {
      const mockContractor = {
        id: 'contractor-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockContractor]),
          }),
        }),
      })

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      })

      const result = await service.delete('contractor-1')

      expect(result.success).toBe(true)
    })
  })

  describe('getPerformance', () => {
    it('should return contractor performance metrics', async () => {
      const mockContractor = {
        id: 'contractor-1',
        userId: 'user-123',
        firstName: 'John',
      }

      const mockTimeStats = [
        {
          totalHours: 160,
          billableHours: 150,
          totalAmount: 15000,
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockContractor]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockTimeStats),
          }),
        })

      const result = await service.getPerformance('contractor-1')

      expect(result.contractor).toBeDefined()
      expect(result.performance).toBeDefined()
      expect(result.performance.totalHours).toBe(160)
      expect(result.performance.billableHours).toBe(150)
    })
  })

  describe('getAnalytics', () => {
    it('should return contractor analytics', async () => {
      const mockContractors = [
        { id: 'contractor-1', status: 'active' },
        { id: 'contractor-2', status: 'active' },
        { id: 'contractor-3', status: 'inactive' },
        { id: 'contractor-4', status: 'terminated' },
      ]

      const mockTypeStats = [
        { contractorType: '1099', count: 2 },
        { contractorType: 'w2', count: 1 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockContractors),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue(mockTypeStats),
            }),
          }),
        })

      const result = await service.getAnalytics()

      expect(result.total).toBe(4)
      expect(result.active).toBe(2)
      expect(result.inactive).toBe(1)
      expect(result.terminated).toBe(1)
      expect(result.typeBreakdown).toBeDefined()
    })

    it('should filter analytics by organization', async () => {
      const mockContractors = [
        { id: 'contractor-1', organizationId: 'org-123', status: 'active' },
      ]

      const mockTypeStats = [
        { contractorType: '1099', count: 1 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockContractors),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue(mockTypeStats),
            }),
          }),
        })

      const result = await service.getAnalytics('org-123')

      expect(result.total).toBe(1)
    })
  })
})

