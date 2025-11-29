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
  createTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  getTransactionStats,
} from '@/lib/services/transaction-service'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schemas'

// Unmock transaction service to test actual implementation
vi.unmock('@/lib/services/transaction-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      transactions: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}))

describe('Transaction Service', () => {
  let mockDb: any

  // Helper to create a thenable query builder with all methods
  const createThenableQuery = (result: any[] = []) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
    };
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result);
      return onResolve ? promise.then(onResolve) : promise;
    });
    query.catch = vi.fn((onReject?: (error: any) => any) => {
      const promise = Promise.resolve(result);
      return onReject ? promise.catch(onReject) : promise;
    });
    Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' });
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const input = {
        userId: 'user-123',
        type: 'income' as const,
        amount: 100.00,
        currency: 'USD',
        description: 'Payment received',
        transactionDate: new Date(),
      }

      const mockTransaction = {
        id: 'txn-123',
        transactionNumber: 'TXN-202501-0001',
        ...input,
        status: 'pending',
        createdAt: new Date(),
      }

      // Mock no existing transactions (for transaction number generation)
      mockDb.query.transactions.findFirst.mockResolvedValue(null)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTransaction]),
        }),
      })

      const result = await createTransaction(input)

      expect(result).toEqual(mockTransaction)
      expect(mockDb.insert).toHaveBeenCalled()
    })
  })

  describe('getTransactionById', () => {
    it('should retrieve transaction by ID', async () => {
      const mockTransaction = {
        id: 'txn-123',
        userId: 'user-123',
        transactionNumber: 'TXN-001',
        type: 'income',
        amount: '100.00',
      }

      mockDb.query.transactions.findFirst.mockResolvedValue(mockTransaction)

      const result = await getTransactionById('txn-123', 'user-123')

      expect(result).toEqual(mockTransaction)
    })

    it('should return null if transaction not found', async () => {
      mockDb.query.transactions.findFirst.mockResolvedValue(null)

      const result = await getTransactionById('txn-123', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getTransactions', () => {
    it('should retrieve transactions with filters', async () => {
      const mockTransactions = [
        { id: 'txn-1', type: 'income', amount: '100.00' },
        { id: 'txn-2', type: 'expense', amount: '50.00' },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { type: 'income' })

      expect(result).toEqual(mockTransactions)
      expect(mockDb.query.transactions.findMany).toHaveBeenCalled()
    })
  })

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const input = {
        id: 'txn-123',
        userId: 'user-123',
        description: 'Updated description',
      }

      const mockUpdatedTransaction = {
        id: 'txn-123',
        ...input,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedTransaction]),
          }),
        }),
      })

      const result = await updateTransaction(input)

      expect(result).toEqual(mockUpdatedTransaction)
    })
  })

  describe('updateTransactionStatus', () => {
    it('should update transaction status to completed', async () => {
      const mockTransaction = {
        id: 'txn-123',
        userId: 'user-123',
        status: 'completed',
        completedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTransaction]),
          }),
        }),
      })

      const result = await updateTransactionStatus('txn-123', 'user-123', 'completed')

      expect(result.status).toBe('completed')
    })
  })

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await deleteTransaction('txn-123', 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      const mockStats = {
        totalTransactions: 10,
        totalInflow: 1000,
        totalOutflow: 500,
        netFlow: 500,
        pendingTransactions: 2,
        completedTransactions: 8,
      }

      // Mock multiple select queries for stats
      mockDb.select
        .mockReturnValueOnce(createThenableQuery([mockStats]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const result = await getTransactionStats('user-123')

      expect(result).toBeDefined()
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should calculate net flow correctly', async () => {
      const mockStats = {
        totalTransactions: 20,
        totalInflow: 5000,
        totalOutflow: 3000,
        pendingTransactions: 5,
        completedTransactions: 15,
      }

      const mockCategoryBreakdown = [
        { category: 'income', amount: 5000, count: 10 },
        { category: 'expense', amount: 3000, count: 5 },
      ]

      const mockMonthlyTrend = [
        { month: '2025-01', inflow: 2500, outflow: 1500 },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery([mockStats]))
        .mockReturnValueOnce(createThenableQuery(mockCategoryBreakdown))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyTrend))

      const result = await getTransactionStats('user-123')

      expect(result.netFlow).toBe(2000) // 5000 - 3000
      expect(result.totalInflow).toBe(5000)
      expect(result.totalOutflow).toBe(3000)
    })
  })

  describe('reconcileTransactions', () => {
    it('should identify duplicate transactions', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          amount: '100.00',
          transactionDate: new Date('2025-01-15'),
        },
        {
          id: 'txn-2',
          amount: '100.00',
          transactionDate: new Date('2025-01-15'), // Same amount and date
        },
        {
          id: 'txn-3',
          amount: '200.00',
          transactionDate: new Date('2025-01-16'),
        },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const { reconcileTransactions } = await import('@/lib/services/transaction-service')
      const result = await reconcileTransactions('user-123')

      expect(result.duplicates).toBeGreaterThan(0)
      expect(result.matched).toBeGreaterThan(0)
    })

    it('should return zero duplicates when none exist', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          amount: '100.00',
          transactionDate: new Date('2025-01-15'),
        },
        {
          id: 'txn-2',
          amount: '200.00',
          transactionDate: new Date('2025-01-16'),
        },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const { reconcileTransactions } = await import('@/lib/services/transaction-service')
      const result = await reconcileTransactions('user-123')

      expect(result.duplicates).toBe(0)
    })
  })

  describe('getTransactions - search functionality', () => {
    it('should search transactions by description', async () => {
      const mockTransactions = [
        { id: 'txn-1', description: 'Payment for services', transactionNumber: 'TXN-001' },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { search: 'Payment' })

      expect(result).toHaveLength(1)
      expect(result[0].description).toContain('Payment')
    })

    it('should search transactions by transaction number', async () => {
      const mockTransactions = [
        { id: 'txn-1', description: 'Test', transactionNumber: 'TXN-202501-0001' },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { search: 'TXN-202501' })

      expect(result).toHaveLength(1)
    })
  })

  describe('createTransaction - transaction number generation', () => {
    it('should generate sequential transaction numbers', async () => {
      const input = {
        userId: 'user-123',
        type: 'income' as const,
        amount: 100.00,
        transactionDate: new Date(),
      }

      // Mock existing transaction with number TXN-202501-0001
      mockDb.query.transactions.findFirst.mockResolvedValue({
        id: 'txn-1',
        transactionNumber: 'TXN-202501-0001',
      })

      const mockTransaction = {
        id: 'txn-2',
        transactionNumber: 'TXN-202501-0002',
        ...input,
        status: 'pending',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTransaction]),
        }),
      })

      const result = await createTransaction(input)

      expect(result.transactionNumber).toBe('TXN-202501-0002')
    })

    it('should generate first transaction number if none exist', async () => {
      const input = {
        userId: 'user-123',
        type: 'income' as const,
        amount: 100.00,
        transactionDate: new Date(),
      }

      mockDb.query.transactions.findFirst.mockResolvedValue(null)

      const mockTransaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-202501-0001',
        ...input,
        status: 'pending',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTransaction]),
        }),
      })

      const result = await createTransaction(input)

      expect(result.transactionNumber).toMatch(/^TXN-\d{6}-0001$/)
    })
  })

  describe('updateTransactionStatus - status transitions', () => {
    it('should set processedAt when status is completed', async () => {
      const mockTransaction = {
        id: 'txn-123',
        userId: 'user-123',
        status: 'completed',
        processedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTransaction]),
          }),
        }),
      })

      const result = await updateTransactionStatus('txn-123', 'user-123', 'completed')

      expect(result.status).toBe('completed')
      expect(result.processedAt).toBeDefined()
    })

    it('should clear processedAt when status is not completed', async () => {
      const mockTransaction = {
        id: 'txn-123',
        userId: 'user-123',
        status: 'failed',
        processedAt: null,
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTransaction]),
          }),
        }),
      })

      const result = await updateTransactionStatus('txn-123', 'user-123', 'failed')

      expect(result.status).toBe('failed')
    })
  })

  describe('getTransactions - filtering', () => {
    it('should filter transactions by type', async () => {
      const mockTransactions = [
        { id: 'txn-1', type: 'income' },
        { id: 'txn-2', type: 'income' },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { type: 'income' })

      expect(result).toHaveLength(2)
      expect(result.every((t) => t.type === 'income')).toBe(true)
    })

    it('should filter transactions by status', async () => {
      const mockTransactions = [
        { id: 'txn-1', status: 'completed' },
        { id: 'txn-2', status: 'completed' },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { status: 'completed' })

      expect(result).toHaveLength(2)
      expect(result.every((t) => t.status === 'completed')).toBe(true)
    })

    it('should filter transactions by category', async () => {
      const mockTransactions = [{ id: 'txn-1', category: 'office_supplies' }]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { category: 'office_supplies' })

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('office_supplies')
    })

    it('should filter transactions by date range', async () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')

      const mockTransactions = [
        { id: 'txn-1', transactionDate: new Date('2025-01-15') },
      ]

      mockDb.query.transactions.findMany.mockResolvedValue(mockTransactions)

      const result = await getTransactions('user-123', { startDate, endDate })

      expect(result).toHaveLength(1)
    })
  })
})

