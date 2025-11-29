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
  getRevenueAnalytics,
  getExpenseAnalytics,
  getClientAnalytics,
  getPerformanceMetrics,
  AnalyticsService,
} from '@/lib/services/analytics/analytics-service'
import { db } from '@/lib/db'
import { invoices, expenses, clients, transactions } from '@/lib/db/schemas'
import { sql } from 'drizzle-orm'

// Unmock analytics service to test actual implementation
vi.unmock('@/lib/services/analytics/analytics-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    query: vi.fn(),
  },
}))

describe('AnalyticsService', () => {
  let mockDb: any

  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };
    // Make it thenable - when awaited, returns the result
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
    mockDb = db as any
    vi.clearAllMocks()
  })

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics', async () => {
      const mockTotalRevenue = [{ totalRevenue: 50000 }]
      const mockMonthlyRevenue = [
        { month: '2025-01', revenue: 10000 },
        { month: '2025-02', revenue: 15000 },
        { month: '2025-03', revenue: 25000 },
      ]
      const mockRevenueByClient = [
        { clientName: 'Client A', revenue: 30000, invoiceCount: 5 },
        { clientName: 'Client B', revenue: 20000, invoiceCount: 3 },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalRevenue))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyRevenue))
        .mockReturnValueOnce(createThenableQuery(mockRevenueByClient))

      const result = await getRevenueAnalytics('user-123')

      expect(result.totalRevenue).toBe(50000)
      expect(result.monthlyRevenue).toHaveLength(3)
      expect(result.monthlyRevenue[0].revenue).toBe(10000)
      expect(result.revenueByClient).toHaveLength(2)
      expect(result.revenueGrowth).toBeDefined()
    })

    it('should calculate month-over-month growth', async () => {
      const mockTotalRevenue = [{ totalRevenue: 50000 }]
      const mockMonthlyRevenue = [
        { month: '2025-01', revenue: 10000 },
        { month: '2025-02', revenue: 15000 },
      ]
      const mockRevenueByClient = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalRevenue))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyRevenue))
        .mockReturnValueOnce(createThenableQuery(mockRevenueByClient))

      const result = await getRevenueAnalytics('user-123')

      expect(result.monthlyRevenue[1].growth).toBe(50) // 50% growth from 10k to 15k
    })

    it('should handle empty revenue data', async () => {
      const mockTotalRevenue = [{ totalRevenue: null }]
      const mockMonthlyRevenue = []
      const mockRevenueByClient = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalRevenue))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyRevenue))
        .mockReturnValueOnce(createThenableQuery(mockRevenueByClient))

      const result = await getRevenueAnalytics('user-123')

      expect(result.totalRevenue).toBe(0)
      expect(result.monthlyRevenue).toHaveLength(0)
    })
  })

  describe('getExpenseAnalytics', () => {
    it('should return expense analytics', async () => {
      const mockTotalExpenses = [{ totalExpenses: 30000 }]
      const mockMonthlyExpenses = [
        { month: '2025-01', expenses: 8000 },
        { month: '2025-02', expenses: 10000 },
        { month: '2025-03', expenses: 12000 },
      ]
      const mockExpensesByCategory = [
        { category: 'Office Supplies', amount: 10000 },
        { category: 'Travel', amount: 15000 },
        { category: 'Software', amount: 5000 },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalExpenses))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyExpenses))
        .mockReturnValueOnce(createThenableQuery(mockExpensesByCategory))

      const result = await getExpenseAnalytics('user-123')

      expect(result.totalExpenses).toBe(30000)
      expect(result.monthlyExpenses).toHaveLength(3)
      expect(result.expensesByCategory).toHaveLength(3)
      expect(result.expensesByCategory[0].percentage).toBeGreaterThan(0)
    })

    it('should calculate expense percentages by category', async () => {
      const mockTotalExpenses = [{ totalExpenses: 30000 }]
      const mockMonthlyExpenses = []
      const mockExpensesByCategory = [
        { category: 'Office Supplies', amount: 10000 },
        { category: 'Travel', amount: 20000 },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockTotalExpenses))
        .mockReturnValueOnce(createThenableQuery(mockMonthlyExpenses))
        .mockReturnValueOnce(createThenableQuery(mockExpensesByCategory))

      const result = await getExpenseAnalytics('user-123')

      expect(result.expensesByCategory[0].percentage).toBeCloseTo(33.33, 1)
      expect(result.expensesByCategory[1].percentage).toBeCloseTo(66.67, 1)
    })
  })

  describe('getClientAnalytics', () => {
    it('should return client analytics', async () => {
      const mockClientStats = [{ totalClients: 10, activeClients: 8 }]
      const mockNewClients = [
        { month: '2025-01', count: 2 },
        { month: '2025-02', count: 3 },
      ]
      const mockTopClients = [
        {
          clientName: 'Client A',
          revenue: 30000,
          invoiceCount: 5,
          lastInvoice: '2025-01-15',
        },
      ]
      const mockSatisfactionData = [
        {
          avgInvoiceValue: 5000,
          recentActivity: 8,
          paidInvoices: 20,
          totalInvoices: 25,
        },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockClientStats))
        .mockReturnValueOnce(createThenableQuery(mockNewClients))
        .mockReturnValueOnce(createThenableQuery(mockTopClients))
        .mockReturnValueOnce(createThenableQuery(mockSatisfactionData))

      const result = await getClientAnalytics('user-123')

      expect(result.totalClients).toBe(10)
      expect(result.activeClients).toBe(8)
      expect(result.clientRetention).toBe(80)
      expect(result.satisfactionScore).toBeGreaterThan(0)
      expect(result.topClients).toHaveLength(1)
    })

    it('should calculate client retention rate', async () => {
      const mockClientStats = [{ totalClients: 20, activeClients: 15 }]
      const mockNewClients = []
      const mockTopClients = []
      const mockSatisfactionData = [
        {
          avgInvoiceValue: 0,
          recentActivity: 0,
          paidInvoices: 0,
          totalInvoices: 0,
        },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockClientStats))
        .mockReturnValueOnce(createThenableQuery(mockNewClients))
        .mockReturnValueOnce(createThenableQuery(mockTopClients))
        .mockReturnValueOnce(createThenableQuery(mockSatisfactionData))

      const result = await getClientAnalytics('user-123')

      expect(result.clientRetention).toBe(75) // 15/20 * 100
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', async () => {
      const mockRevenueData = [{ revenue: 50000 }]
      const mockExpenseData = [{ totalExpenses: 30000 }] // Changed from expenses to totalExpenses
      const mockCashFlowData = [{ inflow: 50000, outflow: 30000 }]
      const mockAvgInvoiceData = [{ averageValue: 5000 }]
      const mockPaymentData = [{ totalInvoices: 25, paidInvoices: 20 }]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockRevenueData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery(mockCashFlowData))
        .mockReturnValueOnce(createThenableQuery(mockAvgInvoiceData))
        .mockReturnValueOnce(createThenableQuery(mockPaymentData))

      const result = await getPerformanceMetrics('user-123')

      expect(result.profitMargin).toBe(40) // (50000 - 30000) / 50000 * 100
      expect(result.cashFlow).toBe(20000) // 50000 - 30000
      expect(result.averageInvoiceValue).toBe(5000)
      expect(result.paymentSuccessRate).toBe(80) // 20/25 * 100
    })

    it('should calculate profit margin correctly', async () => {
      const mockRevenueData = [{ revenue: 100000 }]
      const mockExpenseData = [{ totalExpenses: 60000 }] // Changed from expenses to totalExpenses
      const mockCashFlowData = [{ inflow: 100000, outflow: 60000 }]
      const mockAvgInvoiceData = [{ averageValue: 0 }]
      const mockPaymentData = [{ totalInvoices: 0, paidInvoices: 0 }]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockRevenueData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery(mockCashFlowData))
        .mockReturnValueOnce(createThenableQuery(mockAvgInvoiceData))
        .mockReturnValueOnce(createThenableQuery(mockPaymentData))

      const result = await getPerformanceMetrics('user-123')

      expect(result.profitMargin).toBe(40) // (100000 - 60000) / 100000 * 100
    })

    it('should handle zero revenue gracefully', async () => {
      const mockRevenueData = [{ revenue: 0 }]
      const mockExpenseData = [{ totalExpenses: 0 }] // Changed from expenses to totalExpenses
      const mockCashFlowData = [{ inflow: 0, outflow: 0 }]
      const mockAvgInvoiceData = [{ averageValue: null }]
      const mockPaymentData = [{ totalInvoices: 0, paidInvoices: 0 }]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockRevenueData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery(mockCashFlowData))
        .mockReturnValueOnce(createThenableQuery(mockAvgInvoiceData))
        .mockReturnValueOnce(createThenableQuery(mockPaymentData))

      const result = await getPerformanceMetrics('user-123')

      expect(result.profitMargin).toBe(0)
      expect(result.cashFlow).toBe(0)
      expect(result.paymentSuccessRate).toBe(0)
    })
  })

  describe('AnalyticsService export', () => {
    it('should export all functions', () => {
      // AnalyticsService is an object that contains the functions
      expect(AnalyticsService).toBeDefined()
      expect(typeof AnalyticsService.getRevenueAnalytics).toBe('function')
      expect(typeof AnalyticsService.getExpenseAnalytics).toBe('function')
      expect(typeof AnalyticsService.getClientAnalytics).toBe('function')
      expect(typeof AnalyticsService.getPerformanceMetrics).toBe('function')
      // Verify they're the same functions
      expect(AnalyticsService.getRevenueAnalytics).toBe(getRevenueAnalytics)
      expect(AnalyticsService.getExpenseAnalytics).toBe(getExpenseAnalytics)
      expect(AnalyticsService.getClientAnalytics).toBe(getClientAnalytics)
      expect(AnalyticsService.getPerformanceMetrics).toBe(getPerformanceMetrics)
    })
  })
})

