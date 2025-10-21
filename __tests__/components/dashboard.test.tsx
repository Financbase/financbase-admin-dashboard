import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/src/test/test-utils'
import DashboardPage from '@/app/(dashboard)/dashboard/page'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('DashboardPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Mock successful AI analysis response
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				success: true,
				data: {
					insights: [
						'Revenue growth is consistent with business plan',
						'Expense management shows good discipline',
					],
					recommendations: [
						'Consider increasing marketing spend for growth',
						'Review vendor contracts for better rates',
					],
					riskAssessment: 'Low - Strong financial position',
					forecast: {
						nextMonth: 22000,
						nextQuarter: 66000,
						nextYear: 264000,
					},
				},
			}),
		})
	})

	it('renders dashboard with correct title', async () => {
		render(<DashboardPage />)

		expect(screen.getByText('Financial Dashboard')).toBeInTheDocument()
		expect(screen.getByText('AI-powered financial insights and analytics')).toBeInTheDocument()
	})

	it('displays key financial metrics', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText('$45,231.89')).toBeInTheDocument() // Total Revenue
			expect(screen.getByText('12')).toBeInTheDocument() // Active Clients
			expect(screen.getByText('$2,350.00')).toBeInTheDocument() // Expenses
		})
	})

	it('shows quick action buttons', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText('Create New Invoice')).toBeInTheDocument()
			expect(screen.getByText('Add Expense')).toBeInTheDocument()
			expect(screen.getByText('Add Client')).toBeInTheDocument()
		})
	})

	it('displays AI insights section', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText('AI Insights')).toBeInTheDocument()
		})
	})

	it('shows recent activity section', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText('Recent Activity')).toBeInTheDocument()
			expect(screen.getByText('Invoice #INV-001')).toBeInTheDocument()
		})
	})

	it('displays migration status', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText(/Migration Status: Core Infrastructure Complete/)).toBeInTheDocument()
		})
	})
})
