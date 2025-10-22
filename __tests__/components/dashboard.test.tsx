import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@/src/test/test-utils'
import DashboardPage from '@/app/(dashboard)/dashboard/page'

// Mock useQuery and QueryClient
vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(),
	QueryClient: vi.fn().mockImplementation(() => ({
		getQueryData: vi.fn(),
		setQueryData: vi.fn(),
		invalidateQueries: vi.fn(),
		refetchQueries: vi.fn(),
	})),
	QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('DashboardPage', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Get the mocked useQuery function
		const { useQuery } = await import('@tanstack/react-query')
		const mockUseQuery = vi.mocked(useQuery)

		// Mock useQuery to return successful data
		mockUseQuery.mockImplementation(({ queryKey }) => {
			if (queryKey[0] === 'dashboard-overview') {
				return {
					data: {
						overview: {
							revenue: { total: 45231.89, thisMonth: 18000, lastMonth: 15000, growth: 20.1 },
							clients: { total: 50, active: 12, newThisMonth: 2 },
							invoices: { total: 25, pending: 8, overdue: 2, totalAmount: 12450 },
							expenses: { total: 15000, thisMonth: 2350, lastMonth: 2500, growth: -5.2 },
							netIncome: { thisMonth: 15650, lastMonth: 12500, growth: 25.2 },
						},
					},
					isLoading: false,
					error: null,
				}
			}
			if (queryKey[0] === 'dashboard-activity') {
				return {
					data: {
						activities: [
							{ id: '1', type: 'invoice', description: 'Invoice #INV-001', amount: 1500, status: 'Paid', createdAt: '2024-01-15' },
							{ id: '2', type: 'expense', description: 'Office Supplies', amount: 45, status: 'Approved', createdAt: '2024-01-14' },
						],
					},
					isLoading: false,
					error: null,
				}
			}
			if (queryKey[0] === 'dashboard-insights') {
				return {
					data: {
						insights: [
							{ type: 'success', title: 'Revenue Growth', description: 'Your revenue is growing consistently', action: 'View Details' },
							{ type: 'warning', title: 'Expense Alert', description: 'Consider reviewing your expense categories', action: 'Review' },
						],
					},
					isLoading: false,
					error: null,
				}
			}
			return { data: null, isLoading: false, error: null }
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
			expect(screen.getByText('$15,650')).toBeInTheDocument() // Net Income
		}, { timeout: 5000 })
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
			expect(screen.getByText('Revenue Growth')).toBeInTheDocument()
			expect(screen.getByText('Expense Alert')).toBeInTheDocument()
		}, { timeout: 5000 })
	})

	it('shows recent activity section', async () => {
		render(<DashboardPage />)

		await waitFor(() => {
			expect(screen.getByText('Recent Activity')).toBeInTheDocument()
			expect(screen.getByText('Invoice #INV-001')).toBeInTheDocument()
			expect(screen.getByText('Office Supplies')).toBeInTheDocument()
		}, { timeout: 5000 })
	})

	it('displays loading state when data is loading', async () => {
		// Get the mocked useQuery function
		const { useQuery } = await import('@tanstack/react-query')
		const mockUseQuery = vi.mocked(useQuery)

		// Mock loading state
		mockUseQuery.mockImplementation(({ queryKey }) => {
			if (queryKey[0] === 'dashboard-overview') {
				return {
					data: null,
					isLoading: true,
					error: null,
				}
			}
			return { data: null, isLoading: false, error: null }
		})

		render(<DashboardPage />)

		// Should show loading spinner - look for the Loader2 component by class
		await waitFor(() => {
			expect(document.querySelector('.lucide-loader-circle')).toBeInTheDocument()
		}, { timeout: 2000 })
	})
})

