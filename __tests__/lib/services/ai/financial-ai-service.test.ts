/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FinancialAIService } from '@/lib/services/ai/financial-ai-service'
import { db } from '@/lib/db'
import OpenAI from 'openai'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn(),
        },
      }
      },
  }
})

// Unmock financial AI service to test actual implementation
vi.unmock('@/lib/services/ai/financial-ai-service')

// Helper to create a thenable query builder
const createThenableQuery = (result: any[]) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
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

describe('FinancialAIService', () => {
  let service: FinancialAIService
  let mockDb: any
  let mockOpenAI: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    // Set default thenable query for select
    mockDb.select.mockReturnValue(createThenableQuery([]))
    service = new FinancialAIService()
    mockOpenAI = (service as any).openai
  })

  describe('generateFinancialAnalysis', () => {
    it('should generate comprehensive financial analysis', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, date: new Date() },
      ]
      const mockProjectData = []
      const mockPropertyData = []
      const mockCampaignData = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery(mockProjectData))
        .mockReturnValueOnce(createThenableQuery(mockPropertyData))
        .mockReturnValueOnce(createThenableQuery(mockCampaignData))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: [{ title: 'Test Insight', description: 'Test' }],
                predictions: [],
                healthScore: { overall: 75 },
                recommendations: [],
                summary: { keyFindings: [] },
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.generateFinancialAnalysis('user-123', {
        type: 'comprehensive',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.processingTime).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      mockDb.select.mockRejectedValue(new Error('Database error'))

      const result = await service.generateFinancialAnalysis('user-123', {
        type: 'comprehensive',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should update usage stats on success', async () => {
      const mockIncomeData = []
      const mockExpenseData = []
      const mockProjectData = []
      const mockPropertyData = []
      const mockCampaignData = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery(mockProjectData))
        .mockReturnValueOnce(createThenableQuery(mockPropertyData))
        .mockReturnValueOnce(createThenableQuery(mockCampaignData))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: [],
                predictions: [],
                healthScore: { overall: 75 },
                recommendations: [],
                summary: { keyFindings: [] },
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      await service.generateFinancialAnalysis('user-123', {
        type: 'comprehensive',
      })

      const stats = service.getUsageStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.successfulRequests).toBe(1)
    })

    it('should update usage stats on failure', async () => {
      mockDb.select.mockRejectedValue(new Error('Database error'))

      await service.generateFinancialAnalysis('user-123', {
        type: 'comprehensive',
      })

      const stats = service.getUsageStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.failedRequests).toBe(1)
    })
  })

  describe('predictCashFlow', () => {
    it('should predict cash flow', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, date: new Date() },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                predictions: [{ date: '2025-02-01', value: 1000 }],
                confidence: 0.85,
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.predictCashFlow('user-123', '3_months')

      expect(result).toBeDefined()
      expect(result.predictions).toBeDefined()
    })

    it('should throw error when AI response is empty', async () => {
      const mockIncomeData = []
      const mockExpenseData = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [{ message: {} }],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      await expect(service.predictCashFlow('user-123', '3_months')).rejects.toThrow(
        'No response from AI service'
      )
    })
  })

  describe('predictRevenue', () => {
    it('should predict revenue', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = []

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                predictions: [{ date: '2025-02-01', value: 2000 }],
                confidence: 0.9,
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.predictRevenue('user-123', '6_months')

      expect(result).toBeDefined()
      expect(result.predictions).toBeDefined()
    })
  })

  describe('predictExpenses', () => {
    it('should predict expenses', async () => {
      const mockIncomeData = []
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, category: 'office', date: new Date() },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                predictions: [{ date: '2025-02-01', value: 600 }],
                confidence: 0.8,
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.predictExpenses('user-123', '12_months')

      expect(result).toBeDefined()
      expect(result.predictions).toBeDefined()
    })
  })

  describe('predictProfitability', () => {
    it('should predict profitability', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, date: new Date() },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                predictions: [{ date: '2025-02-01', margin: 0.5 }],
                confidence: 0.85,
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.predictProfitability('user-123', '3_months')

      expect(result).toBeDefined()
      expect(result.predictions).toBeDefined()
    })
  })

  describe('calculateFinancialHealthScore', () => {
    it('should calculate financial health score', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, date: new Date() },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                overall: 75,
                cashFlow: 80,
                revenue: 70,
                expenses: 75,
                profitability: 80,
                debt: 60,
                budget: 70,
                trend: 'improving',
                riskLevel: 'low',
                breakdown: [],
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.calculateFinancialHealthScore('user-123')

      expect(result).toBeDefined()
      expect(result.overall).toBe(75)
      expect(result.trend).toBe('improving')
    })
  })

  describe('generateRecommendations', () => {
    it('should generate AI recommendations', async () => {
      const mockIncomeData = [
        { id: 1, userId: 'user-123', amount: 1000, date: new Date() },
      ]
      const mockExpenseData = [
        { id: 1, userId: 'user-123', amount: 500, date: new Date() },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockIncomeData))
        .mockReturnValueOnce(createThenableQuery(mockExpenseData))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))
        .mockReturnValueOnce(createThenableQuery([]))

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  id: 'rec-1',
                  type: 'optimization',
                  title: 'Optimize Expenses',
                  description: 'Reduce spending',
                  impact: 'high',
                  confidence: 0.9,
                },
              ]),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockAIResponse as any)

      const result = await service.generateRecommendations('user-123')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('title')
      }
    })
  })

  describe('getUsageStats', () => {
    it('should return usage statistics', () => {
      const stats = service.getUsageStats()

      expect(stats).toBeDefined()
      expect(stats).toHaveProperty('totalRequests')
      expect(stats).toHaveProperty('successfulRequests')
      expect(stats).toHaveProperty('failedRequests')
      expect(stats).toHaveProperty('averageResponseTime')
    })
  })

  describe('resetUsageStats', () => {
    it('should reset usage statistics', () => {
      // First, increment some stats
      ;(service as any).usageStats.totalRequests = 10
      ;(service as any).usageStats.successfulRequests = 8

      service.resetUsageStats()

      const stats = service.getUsageStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.successfulRequests).toBe(0)
      expect(stats.failedRequests).toBe(0)
    })
  })
})

