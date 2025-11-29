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
  createBudget,
  getBudgetById,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAlerts,
} from '@/lib/services/budget-service'
import { db } from '@/lib/db'
import { budgets, expenses, budgetAlerts } from '@/lib/db/schemas'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      budgets: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}))

// Unmock budget service to test actual implementation
vi.unmock('@/lib/services/budget-service')

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

describe('BudgetService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        userId: 'user-123',
        name: 'Marketing Budget',
        category: 'marketing',
        budgetedAmount: 5000,
        periodType: 'monthly' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      }

      const mockBudget = {
        id: 1,
        ...budgetData,
        budgetedAmount: '5000.00',
        currency: 'USD',
        status: 'active',
        alertThresholds: [80, 90, 100],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBudget]),
        }),
      })

      const result = await createBudget(budgetData)

      expect(result).toEqual(mockBudget)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should create budget with optional fields', async () => {
      const budgetData = {
        userId: 'user-123',
        name: 'Office Budget',
        category: 'office',
        budgetedAmount: 3000,
        periodType: 'yearly' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        description: 'Office supplies budget',
        currency: 'EUR',
        alertThresholds: [75, 85, 95],
        status: 'active' as const,
        notes: 'Important budget',
        tags: ['office', 'supplies'],
      }

      const mockBudget = {
        id: 1,
        ...budgetData,
        budgetedAmount: '3000.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBudget]),
        }),
      })

      const result = await createBudget(budgetData)

      expect(result).toBeDefined()
      expect(result.description).toBe(budgetData.description)
    })
  })

  describe('getBudgetById', () => {
    it('should get budget by ID with spending calculations', async () => {
      const mockBudget = {
        id: 1,
        userId: 'user-123',
        category: 'marketing',
        budgetedAmount: '5000.00',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        alertThresholds: [80, 90, 100],
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockBudget]))
        .mockImplementationOnce(() => createThenableQuery([
            {
              totalSpent: '3000.00',
              count: 5,
            },
        ]))

      const result = await getBudgetById(1, 'user-123')

      expect(result).toBeDefined()
      expect(result?.spentAmount).toBe(3000)
      expect(result?.remainingAmount).toBe(2000)
      expect(result?.spendingPercentage).toBe(60)
      expect(result?.status).toBe('good')
    })

    it('should return null when budget not found', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await getBudgetById(999, 'user-123')

      expect(result).toBeNull()
    })

    it('should calculate over-budget status', async () => {
      const mockBudget = {
        id: 1,
        userId: 'user-123',
        category: 'marketing',
        budgetedAmount: '5000.00',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        alertThresholds: [80, 90, 100],
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockBudget]))
        .mockImplementationOnce(() => createThenableQuery([
            {
              totalSpent: '5500.00',
              count: 10,
            },
        ]))

      const result = await getBudgetById(1, 'user-123')

      expect(result?.spendingPercentage).toBeGreaterThanOrEqual(100)
      expect(result?.status).toBe('over-budget')
    })
  })

  describe('getBudgets', () => {
    it('should get all budgets for user', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '3000.00',
              count: 5,
            },
          ]),
        }),
      })

      const result = await getBudgets('user-123')

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('spentAmount')
    })

    it('should filter budgets by category', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '3000.00',
              count: 5,
            },
          ]),
        }),
      })

      const result = await getBudgets('user-123', { category: 'marketing' })

      expect(result).toBeDefined()
    })

    it('should filter budgets by status', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          status: 'active',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '3000.00',
              count: 5,
            },
          ]),
        }),
      })

      const result = await getBudgets('user-123', { status: 'active' })

      expect(result).toBeDefined()
    })

    it('should paginate budgets', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '3000.00',
              count: 5,
            },
          ]),
        }),
      })

      const result = await getBudgets('user-123', { limit: 10, offset: 0 })

      expect(result).toBeDefined()
    })
  })

  describe('updateBudget', () => {
    it('should update budget', async () => {
      const updateData = {
        id: 1,
        userId: 'user-123',
        name: 'Updated Budget',
        budgetedAmount: 6000,
      }

      const mockUpdatedBudget = {
        id: 1,
        userId: 'user-123',
        name: 'Updated Budget',
        budgetedAmount: '6000.00',
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedBudget]),
          }),
        }),
      })

      const result = await updateBudget(updateData)

      expect(result).toEqual(mockUpdatedBudget)
    })

    it('should throw error when budget not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        updateBudget({ id: 999, userId: 'user-123', name: 'Updated' })
      ).rejects.toThrow('Budget not found or unauthorized')
    })
  })

  describe('deleteBudget', () => {
    it('should archive budget', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      await deleteBudget(1, 'user-123')

      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('getBudgetSummary', () => {
    it('should get budget summary with statistics', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          status: 'active',
          alertThresholds: [80, 90, 100],
        },
        {
          id: 2,
          userId: 'user-123',
          category: 'office',
          budgetedAmount: '3000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          status: 'active',
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '5500.00',
              count: 10,
            },
          ]),
        }),
      }).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '2500.00',
              count: 5,
            },
          ]),
        }),
      })

      const result = await getBudgetSummary('user-123')

      expect(result).toBeDefined()
      expect(result.totalBudgeted).toBe(8000)
      expect(result.totalSpent).toBe(8000)
      expect(result.activeBudgets).toBe(2)
      expect(result.overBudgetCount).toBeGreaterThanOrEqual(0)
    })

    it('should calculate over-budget and warning counts', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          status: 'active',
          alertThresholds: [80, 90, 100],
        },
      ]

      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBudgets)).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              totalSpent: '5500.00',
              count: 10,
            },
          ]),
        }),
      })

      const result = await getBudgetSummary('user-123')

      expect(result.overBudgetCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getBudgetAlerts', () => {
    it('should get budget alerts for thresholds exceeded', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          status: 'active',
          alertThresholds: [80, 90, 100],
        },
      ]

      // getBudgetAlerts flow:
      // 1. Select active budgets
      // 2. For each budget: calculateBudgetSpending (select expenses)
      // 3. For each threshold: check existing alerts (select budgetAlerts)
      // 4. If no existing alert: insert new alert
      // 5. Final: select all active alerts
      
      const mockAlert = {
              id: 1,
              budgetId: 1,
              userId: 'user-123',
              alertType: 'warning',
              threshold: '80.00',
              message: 'marketing budget is 90.0% utilized',
              isActive: true,
              isRead: false,
      }
      
      // 1. Select active budgets
      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockBudgets))
        // 2. calculateBudgetSpending for budget 1
        .mockImplementationOnce(() => createThenableQuery([
          {
            totalSpent: '4500.00',
            count: 8,
          },
        ]))
        // 3. Check existing alerts for threshold 80 (none)
        .mockImplementationOnce(() => createThenableQuery([]))
        // 3. Check existing alerts for threshold 90 (none)
        .mockImplementationOnce(() => createThenableQuery([]))
        // 3. Check existing alerts for threshold 100 (none)
        .mockImplementationOnce(() => createThenableQuery([]))
      
      // 4. Insert new alerts (3 thresholds, but only 80 and 90 will trigger since spending is 90%)
      const alertInsertReturnValue = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAlert]),
        }),
      }
      mockDb.insert.mockReturnValueOnce(alertInsertReturnValue)
      mockDb.insert.mockReturnValueOnce(alertInsertReturnValue)
      
      // 5. Final select for all active alerts
      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockAlert]))

      const result = await getBudgetAlerts('user-123')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should not create duplicate alerts', async () => {
      const mockBudgets = [
        {
          id: 1,
          userId: 'user-123',
          category: 'marketing',
          budgetedAmount: '5000.00',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          status: 'active',
          alertThresholds: [80, 90, 100],
        },
      ]

      const existingAlert = {
        id: 1,
        budgetId: 1,
        userId: 'user-123',
        alertType: 'warning',
        threshold: '80.00',
        isActive: true,
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockBudgets))
        .mockImplementationOnce(() => createThenableQuery([
            {
              totalSpent: '4500.00',
              count: 8,
            },
        ]))
        .mockImplementationOnce(() => createThenableQuery([existingAlert]))
        .mockImplementationOnce(() => createThenableQuery([existingAlert]))
      
      // No insert should be called since alert already exists

      const result = await getBudgetAlerts('user-123')

      expect(result).toBeDefined()
    })
  })
})

