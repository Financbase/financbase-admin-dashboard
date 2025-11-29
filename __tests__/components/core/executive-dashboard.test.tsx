/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExecutiveDashboard } from '@/components/core/executive-dashboard'
import { useQuery } from '@tanstack/react-query'
import { createMockUseQueryResult } from '@/src/test/test-utils'

// Note: recharts is mocked globally in __tests__/setup.ts
// Note: @tanstack/react-query is mocked globally in __tests__/setup.ts

// Mock fetch
global.fetch = vi.fn()

describe('ExecutiveDashboard', () => {
  const mockMetrics = {
    totalRevenue: 125000,
    revenueChange: 12.5,
    totalUsers: 1500,
    usersChange: 8.3,
    totalOrders: 450,
    ordersChange: -5.2,
    conversionRate: 3.4,
    avgOrderValue: 277.78,
    topProducts: [
      { name: 'Product A', sales: 100, revenue: 50000 },
      { name: 'Product B', sales: 80, revenue: 40000 },
      { name: 'Product C', sales: 60, revenue: 35000 },
    ],
    userGrowth: [
      { month: 'Jan', users: 1000, newUsers: 100 },
      { month: 'Feb', users: 1200, newUsers: 200 },
      { month: 'Mar', users: 1500, newUsers: 300 },
    ],
    revenueByCategory: [
      { category: 'Category A', revenue: 50000, percentage: 40 },
      { category: 'Category B', revenue: 40000, percentage: 32 },
      { category: 'Category C', revenue: 35000, percentage: 28 },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'order',
        description: 'New order placed',
        timestamp: '2025-01-15 10:30 AM',
        status: 'success',
      },
      {
        id: '2',
        type: 'user',
        description: 'New user registered',
        timestamp: '2025-01-15 10:25 AM',
        status: 'info',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: undefined,
        isLoading: true,
        isPending: true,
        isSuccess: false,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Loading executive dashboard/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render error state', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        isSuccess: false,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load executive metrics/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render dashboard with metrics', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/\$125,000/)).toBeInTheDocument()
      expect(screen.getByText('1,500')).toBeInTheDocument()
      expect(screen.getByText('450')).toBeInTheDocument()
      expect(screen.getByText('3.4%')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render metric cards with trends', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      // Check for revenue change percentage
      expect(screen.getByText(/12\.5% from last month/i)).toBeInTheDocument()
      expect(screen.getByText(/8\.3% from last month/i)).toBeInTheDocument()
      expect(screen.getByText(/5\.2% from last month/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render tabs', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render overview tab content', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
      expect(screen.getByText('Revenue by Category')).toBeInTheDocument()
      expect(screen.getByText('Top Performing Products')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render revenue trend chart', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render revenue by category pie chart', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render top products list', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
      expect(screen.getByText('Product B')).toBeInTheDocument()
      expect(screen.getByText('Product C')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render analytics tab content', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const analyticsTab = screen.getByRole('tab', { name: /analytics/i })
    
    await user.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByText('User Growth Trend')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    await waitFor(() => {
      expect(screen.getByText('Conversion Funnel')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should render user growth line chart', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const analyticsTab = screen.getByRole('tab', { name: /analytics/i })
    
    await user.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should render recent activity', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const activityTab = screen.getByRole('tab', { name: /activity/i })
    
    await user.click(activityTab)

    // Wait for tab content to be visible (not just the tab button)
    await waitFor(() => {
      const activityCards = screen.getAllByText('Recent Activity')
      // Should have at least the CardTitle (not just the tab button)
      expect(activityCards.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
    
    await waitFor(() => {
      expect(screen.getByText('New order placed')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    await waitFor(() => {
      expect(screen.getByText('New user registered')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should render activity status badges', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const activityTab = screen.getByRole('tab', { name: /activity/i })
    await user.click(activityTab)

    await waitFor(() => {
      expect(screen.getByText('order')).toBeInTheDocument()
      expect(screen.getByText('user')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should handle empty metrics gracefully', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: null,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/\$0/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render export button', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render date range button', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockMetrics,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExecutiveDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /last 30 days/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

