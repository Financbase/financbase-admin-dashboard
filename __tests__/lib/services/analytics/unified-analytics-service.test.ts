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
  getUnifiedAnalytics,
  getCrossModulePerformance,
  getFinancialHealthScore,
} from '@/lib/services/analytics/unified-analytics-service'
import { db } from '@/lib/db'
// Mock these services before importing
vi.mock('@/lib/services/freelance-project-service', () => ({
  getFreelanceProjectStats: vi.fn(),
}))
vi.mock('@/lib/services/property-service', () => ({
  getPropertyStats: vi.fn(),
}))
vi.mock('@/lib/services/adboard-campaign-service', () => ({
  getAdboardCampaignStats: vi.fn(),
}))
import { sql } from 'drizzle-orm'
// Import mocked functions for use in tests
import { getFreelanceProjectStats } from '@/lib/services/freelance-project-service'
import { getPropertyStats } from '@/lib/services/property-service'
import { getAdboardCampaignStats } from '@/lib/services/adboard-campaign-service'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    execute: vi.fn(),
  },
}))

// Module services are mocked above

describe('Unified Analytics Service', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = db as any
    vi.clearAllMocks()
  })

  describe('getUnifiedAnalytics', () => {
    it('should return unified analytics across all modules', async () => {
      const mockFreelanceStats = {
        totalProjects: 10,
        activeProjects: 5,
        completedProjects: 5,
        totalBudget: 100000,
        totalSpent: 60000,
        totalRevenue: 120000,
        averageROI: 20,
      }

      const mockRealEstateStats = {
        totalProperties: 3,
        activeProperties: 2,
        totalValue: 500000,
        totalRentalIncome: 5000,
        totalExpenses: 2000,
        averageCapRate: 7.2,
      }

      const mockAdboardStats = {
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalBudget: 20000,
        totalSpent: 15000,
        totalRevenue: 30000,
        averageRoas: 2.0,
        topPerformingPlatform: 'Google',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      // Mock previous period queries
      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 100000 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 50000 }],
        })
        .mockResolvedValueOnce({
          rows: [
            { month: '2025-01', revenue: 50000 },
            { month: '2025-02', revenue: 60000 },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            { month: '2025-01', expenses: 25000 },
            { month: '2025-02', expenses: 30000 },
          ],
        })

      const result = await getUnifiedAnalytics('user-123')

      expect(result.totalRevenue).toBe(155000) // 120000 + 5000 + 30000
      expect(result.totalExpenses).toBe(77000) // 60000 + 2000 + 15000 (actual calculation)
      expect(result.netIncome).toBe(78000) // 155000 - 77000
      expect(result.profitMargin).toBeCloseTo(50.32, 1) // (78000 / 155000) * 100
      expect(result.freelance.totalProjects).toBe(10)
      expect(result.realEstate.totalProperties).toBe(3)
      expect(result.adboard.totalCampaigns).toBe(5)
      expect(result.topPerformingModule).toBeDefined()
      expect(result.revenueDistribution).toBeDefined()
      expect(result.monthlyTrends).toBeDefined()
    })

    it('should calculate revenue distribution correctly', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 100000,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 50000,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 50000,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [],
        })

      const result = await getUnifiedAnalytics('user-123')

      const totalRevenue = 200000
      expect(result.revenueDistribution.freelance).toBe(50) // 100000 / 200000 * 100
      expect(result.revenueDistribution.realEstate).toBe(25) // 50000 / 200000 * 100
      expect(result.revenueDistribution.adboard).toBe(25) // 50000 / 200000 * 100
    })

    it('should calculate growth metrics', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 0,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 100000 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 50000 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [],
        })

      const result = await getUnifiedAnalytics('user-123', new Date('2025-01-01'), new Date('2025-01-31'))

      expect(result.revenueGrowth).toBeDefined()
      expect(result.expenseGrowth).toBeDefined()
      expect(result.profitGrowth).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(getFreelanceProjectStats).mockRejectedValue(new Error('Service error'))

      await expect(getUnifiedAnalytics('user-123')).rejects.toThrow('Failed to fetch unified analytics')
    })
  })

  describe('getCrossModulePerformance', () => {
    it('should return cross-module performance comparison', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 50000,
        totalRevenue: 100000,
        averageROI: 100,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 50000,
        totalExpenses: 20000,
        averageCapRate: 6,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 10000,
        totalRevenue: 20000,
        averageRoas: 2,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      const result = await getCrossModulePerformance('user-123')

      expect(result.modules).toHaveLength(3)
      expect(result.modules[0].name).toBe('Freelance')
      expect(result.modules[0].roi).toBe(100)
      expect(result.bestPerforming).toBe('Freelance')
      expect(result.worstPerforming).toBeDefined()
    })

    it('should calculate module growth', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 100000,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 0,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      const result = await getCrossModulePerformance(
        'user-123',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )

      expect(result.modules[0].growth).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(getFreelanceProjectStats).mockRejectedValue(new Error('Service error'))

      await expect(getCrossModulePerformance('user-123')).rejects.toThrow('Failed to fetch cross-module performance')
    })
  })

  describe('getFinancialHealthScore', () => {
    it('should return financial health score', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 0,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [],
        })

      const result = await getFinancialHealthScore('user-123')

      expect(result.score).toBeDefined()
      expect(result.grade).toBeDefined()
      expect(result.recommendations).toBeDefined()
      expect(result.metrics).toBeDefined()
      expect(result.metrics.revenueStability).toBeDefined()
      expect(result.metrics.expenseControl).toBeDefined()
      expect(result.metrics.profitability).toBeDefined()
      expect(result.metrics.growth).toBeDefined()
    })

    it('should assign correct grade based on score', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 100000,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 0,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [],
        })

      const result = await getFinancialHealthScore('user-123')

      expect(['A+', 'A', 'B', 'C', 'D', 'F']).toContain(result.grade)
    })

    it('should generate recommendations based on metrics', async () => {
      const mockFreelanceStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageROI: 0,
      }

      const mockRealEstateStats = {
        totalProperties: 0,
        activeProperties: 0,
        totalValue: 0,
        totalRentalIncome: 0,
        totalExpenses: 0,
        averageCapRate: 0,
      }

      const mockAdboardStats = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue: 0,
        averageRoas: 0,
        topPerformingPlatform: '',
      }

      vi.mocked(getFreelanceProjectStats).mockResolvedValue(mockFreelanceStats)
      vi.mocked(getPropertyStats).mockResolvedValue(mockRealEstateStats)
      vi.mocked(getAdboardCampaignStats).mockResolvedValue(mockAdboardStats)

      mockDb.execute
        .mockResolvedValueOnce({
          rows: [{ total_revenue: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ total_expenses: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [],
        })

      const result = await getFinancialHealthScore('user-123')

      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(getFreelanceProjectStats).mockRejectedValue(new Error('Service error'))

      await expect(getFinancialHealthScore('user-123')).rejects.toThrow('Failed to calculate financial health score')
    })
  })
})

