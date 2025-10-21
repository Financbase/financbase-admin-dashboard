import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIFinancialService } from '@/lib/ai/financial-service'

// Mock OpenAI to simulate errors to test fallback behavior
vi.mock('openai', () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			chat: {
				completions: {
					create: vi.fn().mockRejectedValue(new Error('API Error')),
				},
			},
		})),
	}
})

describe('AIFinancialService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('analyzeFinancialData', () => {
		it('should return fallback analysis when API fails', async () => {
			const mockData = {
				revenue: [10000, 12000, 15000],
				expenses: [8000, 9000, 10000],
				transactions: [],
				budget: { total: 20000, categories: [] },
			}

			const result = await AIFinancialService.analyzeFinancialData(mockData)

			// Should return fallback data structure
			expect(result).toHaveProperty('insights')
			expect(result).toHaveProperty('recommendations')
			expect(result).toHaveProperty('riskAssessment')
			expect(result).toHaveProperty('forecast')
			expect(Array.isArray(result.insights)).toBe(true)
			expect(Array.isArray(result.recommendations)).toBe(true)
			expect(result.insights.length).toBeGreaterThan(0)
			expect(result.recommendations.length).toBeGreaterThan(0)
			expect(result.forecast).toHaveProperty('nextMonth')
			expect(result.forecast).toHaveProperty('nextQuarter')
			expect(result.forecast).toHaveProperty('nextYear')
		})
	})

	describe('categorizeTransaction', () => {
		it('should return fallback categorization when API fails', async () => {
			const mockTransaction = {
				description: 'Office Supplies Purchase',
				amount: 150.50,
				type: 'expense',
			}

			const result = await AIFinancialService.categorizeTransaction(mockTransaction)

			// Should return fallback categorization
			expect(result).toHaveProperty('category')
			expect(result).toHaveProperty('confidence')
			expect(result).toHaveProperty('suggestedBudget')
			expect(result.category).toBe('Other')
			expect(result.confidence).toBe(50)
			expect(typeof result.suggestedBudget).toBe('string')
		})
	})

	describe('generateDashboardInsights', () => {
		it('should return fallback insights when API fails', async () => {
			const mockMetrics = {
				totalRevenue: 50000,
				totalExpenses: 30000,
				netIncome: 20000,
				budgetUtilization: 75,
				topExpenseCategory: 'Marketing',
			}

			const result = await AIFinancialService.generateDashboardInsights(mockMetrics)

			// Should return fallback insights as array
			expect(Array.isArray(result)).toBe(true)
			expect(result.length).toBeGreaterThan(0)
			result.forEach(insight => {
				expect(typeof insight).toBe('string')
				expect(insight.length).toBeGreaterThan(0)
			})
		})
	})
})
