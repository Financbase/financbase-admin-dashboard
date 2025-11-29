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
  createExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  approveExpense,
  rejectExpense,
  deleteExpense,
  getExpenseStats,
  getCategories,
  createCategory,
  ExpenseService,
} from '@/lib/services/expense-service'
import { db } from '@/lib/db'
import { NotificationHelpers } from '@/lib/services/notification-service'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      expenses: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      expenseCategories: {
        findMany: vi.fn(),
      },
    },
  },
}))

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    expense: {
      created: vi.fn(),
      approved: vi.fn(),
      rejected: vi.fn(),
    },
  },
}))

// Unmock expense service to test actual implementation
vi.unmock('@/lib/services/expense-service')

describe('ExpenseService', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        userId: 'user-123',
        description: 'Office supplies',
        amount: 150.50,
        date: new Date('2025-01-15'),
        category: 'office',
      }

      const mockExpense = {
        id: 1,
        ...expenseData,
        amount: '150.50',
        currency: 'USD',
        status: 'pending',
        taxDeductible: true,
        billable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockExpense]),
        }),
      })

      const result = await createExpense(expenseData)

      expect(result).toEqual(mockExpense)
      expect(NotificationHelpers.expense.created).toHaveBeenCalledWith('user-123', '1')
    })

    it('should create expense with optional fields', async () => {
      const expenseData = {
        userId: 'user-123',
        description: 'Client dinner',
        amount: 250.00,
        date: new Date('2025-01-15'),
        category: 'entertainment',
        vendor: 'Restaurant XYZ',
        paymentMethod: 'credit_card',
        receiptUrl: 'https://example.com/receipt.jpg',
        notes: 'Client meeting',
        taxDeductible: true,
        billable: true,
        projectId: 1,
        clientId: 1,
        currency: 'USD',
      }

      const mockExpense = {
        id: 1,
        ...expenseData,
        amount: '250.00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockExpense]),
        }),
      })

      const result = await createExpense(expenseData)

      expect(result).toBeDefined()
      expect(result.vendor).toBe(expenseData.vendor)
    })
  })

  describe('getExpenseById', () => {
    it('should get expense by ID', async () => {
      const mockExpense = {
        id: 1,
        userId: 'user-123',
        description: 'Office supplies',
        amount: '150.50',
        date: new Date('2025-01-15'),
        category: 'office',
      }

      mockDb.query.expenses.findFirst.mockResolvedValue(mockExpense)

      const result = await getExpenseById(1, 'user-123')

      expect(result).toEqual(mockExpense)
    })

    it('should return null when expense not found', async () => {
      mockDb.query.expenses.findFirst.mockResolvedValue(null)

      const result = await getExpenseById(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getExpenses', () => {
    it('should get all expenses for user', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          date: new Date('2025-01-15'),
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123')

      expect(result).toEqual(mockExpenses)
    })

    it('should filter expenses by status', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          date: new Date('2025-01-15'),
          category: 'office',
          status: 'pending',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123', { status: 'pending' })

      expect(result).toBeDefined()
    })

    it('should filter expenses by category', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          date: new Date('2025-01-15'),
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123', { category: 'office' })

      expect(result).toBeDefined()
    })

    it('should filter expenses by date range', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          date: new Date('2025-01-15'),
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      })

      expect(result).toBeDefined()
    })

    it('should filter expenses by billable status', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Client dinner',
          amount: '250.00',
          date: new Date('2025-01-15'),
          category: 'entertainment',
          status: 'approved',
          billable: true,
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123', { billable: true })

      expect(result).toBeDefined()
    })

    it('should paginate expenses', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          date: new Date('2025-01-15'),
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenses('user-123', { limit: 10, offset: 0 })

      expect(result).toBeDefined()
    })
  })

  describe('updateExpense', () => {
    it('should update expense', async () => {
      const updateData = {
        id: 1,
        userId: 'user-123',
        description: 'Updated description',
        amount: 200.00,
      }

      const mockUpdatedExpense = {
        id: 1,
        userId: 'user-123',
        description: 'Updated description',
        amount: '200.00',
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedExpense]),
          }),
        }),
      })

      const result = await updateExpense(updateData)

      expect(result).toEqual(mockUpdatedExpense)
    })
  })

  describe('approveExpense', () => {
    it('should approve expense', async () => {
      const mockApprovedExpense = {
        id: 1,
        userId: 'user-123',
        description: 'Office supplies',
        amount: '150.50',
        status: 'approved',
        approvedBy: 'admin-123',
        approvedAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockApprovedExpense]),
          }),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const result = await approveExpense(1, 'admin-123', 'user-123')

      expect(result.status).toBe('approved')
      expect(NotificationHelpers.expense.approved).toHaveBeenCalled()
    })
  })

  describe('rejectExpense', () => {
    it('should reject expense with reason', async () => {
      const mockRejectedExpense = {
        id: 1,
        userId: 'user-123',
        description: 'Office supplies',
        amount: '150.50',
        status: 'rejected',
        rejectedReason: 'Insufficient documentation',
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockRejectedExpense]),
          }),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const result = await rejectExpense(1, 'admin-123', 'user-123', 'Insufficient documentation')

      expect(result.status).toBe('rejected')
      expect(result.rejectedReason).toBe('Insufficient documentation')
      expect(NotificationHelpers.expense.rejected).toHaveBeenCalled()
    })
  })

  describe('deleteExpense', () => {
    it('should delete expense', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await deleteExpense(1, 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })

  describe('getExpenseStats', () => {
    it('should get expense statistics', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          category: 'office',
          status: 'approved',
        },
        {
          id: 2,
          userId: 'user-123',
          description: 'Client dinner',
          amount: '250.00',
          category: 'entertainment',
          status: 'pending',
        },
        {
          id: 3,
          userId: 'user-123',
          description: 'Travel',
          amount: '500.00',
          category: 'travel',
          status: 'rejected',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenseStats('user-123')

      expect(result).toBeDefined()
      expect(result.total).toBe(3)
      expect(result.approved).toBe(1)
      expect(result.pending).toBe(1)
      expect(result.rejected).toBe(1)
      expect(result.totalAmount).toBe(900.50)
      expect(result.byCategory).toHaveProperty('office')
    })

    it('should get expense statistics for month', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenseStats('user-123', 'month')

      expect(result).toBeDefined()
    })

    it('should get expense statistics for year', async () => {
      const mockExpenses = [
        {
          id: 1,
          userId: 'user-123',
          description: 'Office supplies',
          amount: '150.50',
          category: 'office',
          status: 'approved',
        },
      ]

      mockDb.query.expenses.findMany.mockResolvedValue(mockExpenses)

      const result = await getExpenseStats('user-123', 'year')

      expect(result).toBeDefined()
    })
  })

  describe('getCategories', () => {
    it('should get expense categories', async () => {
      const mockCategories = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Office',
          isActive: true,
        },
        {
          id: 2,
          userId: 'user-123',
          name: 'Travel',
          isActive: true,
        },
      ]

      mockDb.query.expenseCategories.findMany.mockResolvedValue(mockCategories)

      const result = await getCategories('user-123')

      expect(result).toEqual(mockCategories)
    })
  })

  describe('createCategory', () => {
    it('should create expense category', async () => {
      const categoryData = {
        userId: 'user-123',
        name: 'Marketing',
      }

      const mockCategory = {
        id: 1,
        ...categoryData,
        isActive: true,
        taxDeductible: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCategory]),
        }),
      })

      const result = await createCategory('user-123', 'Marketing')

      expect(result).toEqual(mockCategory)
    })

    it('should create category with options', async () => {
      const mockCategory = {
        id: 1,
        userId: 'user-123',
        name: 'Marketing',
        description: 'Marketing expenses',
        color: '#FF0000',
        monthlyBudget: '1000.00',
        taxDeductible: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCategory]),
        }),
      })

      const result = await createCategory('user-123', 'Marketing', {
        description: 'Marketing expenses',
        color: '#FF0000',
        monthlyBudget: 1000,
        taxDeductible: true,
        requiresApproval: true,
      })

      expect(result).toBeDefined()
      expect(result.description).toBe('Marketing expenses')
    })
  })

  describe('ExpenseService export', () => {
    it('should export all functions', () => {
      expect(ExpenseService.create).toBe(createExpense)
      expect(ExpenseService.getById).toBe(getExpenseById)
      expect(ExpenseService.getAll).toBe(getExpenses)
      expect(ExpenseService.update).toBe(updateExpense)
      expect(ExpenseService.approve).toBe(approveExpense)
      expect(ExpenseService.reject).toBe(rejectExpense)
      expect(ExpenseService.delete).toBe(deleteExpense)
      expect(ExpenseService.getStats).toBe(getExpenseStats)
      expect(ExpenseService.getCategories).toBe(getCategories)
      expect(ExpenseService.createCategory).toBe(createCategory)
    })
  })
})

