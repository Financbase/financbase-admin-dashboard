import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/src/test/test-utils'
import OverviewStats from '@/components/core/overview-stats'

// Mock the dashboard context
vi.mock('@/contexts/dashboard-context', () => {
	const mockUseDashboardDateRange = vi.fn(() => ({
		dateRange: { from: new Date('2024-01-01'), to: new Date('2024-01-31') },
		setDateRange: vi.fn()
	}))
	return {
		useDashboardDateRange: mockUseDashboardDateRange
	}
})

// Mock the dashboard stats hook
vi.mock('@/hooks/use-dashboard-data-optimized', () => {
	const mockUseDashboardStats = vi.fn()
	return {
		useDashboardStats: mockUseDashboardStats
	}
})

// Get the mocked function
import { useDashboardStats } from '@/hooks/use-dashboard-data-optimized'
const mockUseDashboardStats = vi.mocked(useDashboardStats)

// Mock format utils
vi.mock('@/lib/format-utils', () => {
	const mockFormatPercentage = vi.fn((value) => `${value > 0 ? '+' : ''}${value}%`)
	return {
		formatPercentage: mockFormatPercentage
	}
})

describe('OverviewStats', () => {
	const mockStats = {
		revenue: { value: '$45,231.89', change: 20.1, changeType: 'increase' as const },
		orders: { value: '2,350', change: 15.3, changeType: 'increase' as const },
		customers: { value: '1,234', change: -5.2, changeType: 'decrease' as const },
		products: { value: '89', change: 8.7, changeType: 'increase' as const },
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders loading state correctly', () => {
		mockUseDashboardStats.mockReturnValue({
			data: null,
			loading: true,
			error: null
		})

		render(<OverviewStats />)

		// Should show 4 stat cards with skeleton loading
		const statCards = screen.getAllByTestId('stat-card')
		expect(statCards).toHaveLength(4)

		// Each card should have animate-pulse class for loading
		statCards.forEach(card => {
			expect(card.querySelector('.animate-pulse')).toBeInTheDocument()
		})
	})

	it('renders error state correctly', () => {
		mockUseDashboardStats.mockReturnValue({
			data: null,
			loading: false,
			error: 'Failed to fetch dashboard stats'
		})

		render(<OverviewStats />)

		// Should show error message
		expect(screen.getByText('Failed to load stats')).toBeInTheDocument()

		// Should show error description
		expect(screen.getByText('Unable to fetch dashboard statistics. Please try refreshing the page.')).toBeInTheDocument()

		// Should not show stat cards with data
		expect(screen.getAllByTestId('stat-card')).toHaveLength(1)
	})

	it('renders empty state when no data', () => {
		mockUseDashboardStats.mockReturnValue({
			data: null,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		expect(screen.getByText('No data available')).toBeInTheDocument()
		expect(screen.getByText('Dashboard statistics will appear here once you have data.')).toBeInTheDocument()
	})

	it('renders stats correctly when data is available', async () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		await waitFor(() => {
			// Check main stat values
			expect(screen.getByText('$45,231.89')).toBeInTheDocument()
			expect(screen.getByText('2,350')).toBeInTheDocument()
			expect(screen.getByText('1,234')).toBeInTheDocument()
			expect(screen.getByText('89')).toBeInTheDocument()
		})

		// Check stat titles
		expect(screen.getByText('Total Revenue')).toBeInTheDocument()
		expect(screen.getByText('Orders')).toBeInTheDocument()
		expect(screen.getByText('Customers')).toBeInTheDocument()
		expect(screen.getByText('Products')).toBeInTheDocument()
	})

	it('displays change indicators correctly', async () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		await waitFor(() => {
			// Check positive changes
			expect(screen.getByText('+20.1%')).toBeInTheDocument()
			expect(screen.getByText('+15.3%')).toBeInTheDocument()
			expect(screen.getByText('+8.7%')).toBeInTheDocument()

			// Check negative change
			expect(screen.getByText('-5.2%')).toBeInTheDocument()
		})
	})

	it('shows correct trend icons', async () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		await waitFor(() => {
			// Should have trending up icons for increases
			const trendingUpIcons = document.querySelectorAll('.lucide-trending-up')
			expect(trendingUpIcons.length).toBe(3) // revenue, orders, products

			// Should have trending down icon for decrease
			const trendingDownIcons = document.querySelectorAll('.lucide-trending-down')
			expect(trendingDownIcons.length).toBe(1) // customers
		})
	})

	it('has correct accessibility attributes', async () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		await waitFor(() => {
			const statCards = screen.getAllByTestId('stat-card')
			expect(statCards).toHaveLength(4)

			// Check aria-labels
			expect(screen.getByLabelText('Total Revenue statistic')).toBeInTheDocument()
			expect(screen.getByLabelText('Orders statistic')).toBeInTheDocument()
			expect(screen.getByLabelText('Customers statistic')).toBeInTheDocument()
			expect(screen.getByLabelText('Products statistic')).toBeInTheDocument()
		})
	})

	it('applies responsive grid classes', async () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		await waitFor(() => {
			const gridContainer = screen.getByTestId('dashboard-stats')
			expect(gridContainer).toHaveClass('grid-cols-2', 'lg:grid-cols-4')
		})
	})

	it('uses dashboard date range from context', () => {
		mockUseDashboardStats.mockReturnValue({
			data: mockStats,
			loading: false,
			error: null
		})

		render(<OverviewStats />)

		// Component should render with the mocked date range
		expect(screen.getByText('Total Revenue')).toBeInTheDocument()
	})
})