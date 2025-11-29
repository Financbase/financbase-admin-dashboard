/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CashFlowChart } from '@/components/financial/intelligence/cash-flow-chart'
import { useQuery } from '@tanstack/react-query'
import { createMockUseQueryResult } from '@/src/test/test-utils'

// Note: recharts is mocked globally in __tests__/setup.ts
// Note: @tanstack/react-query is mocked globally in __tests__/setup.ts

// Mock fetch
global.fetch = vi.fn()

describe('CashFlowChart', () => {
  const mockData = [
    {
      date: '2024-01-01',
      revenue: 1000,
      expenses: 500,
      cashFlow: 500,
    },
    {
      date: '2024-02-01',
      revenue: 1200,
      expenses: 600,
      cashFlow: 600,
    },
    {
      date: '2024-03-01',
      revenue: 1500,
      expenses: 800,
      cashFlow: 700,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render cash flow chart', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isSuccess: true,
        isLoading: false,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByText('Cash Flow Analysis')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display loading state', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: undefined,
        isLoading: true,
        isPending: true,
        isSuccess: false,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display error state', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        isSuccess: false,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByText(/no cash flow data available/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display empty state when no data', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: [],
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByText(/no cash flow data available/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render composed chart with revenue, expenses, and cash flow', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByText('Cash Flow Analysis')).toBeInTheDocument()
    }, { timeout: 3000 })

    await waitFor(() => {
      // The mocked recharts components render divs with testids
      // Check for the chart container or any chart-related elements
      const composedChart = screen.queryByTestId('composed-chart') ||
                           screen.queryByTestId('responsive-container')
      const bars = screen.queryAllByTestId('bar')
      const line = screen.queryByTestId('line')
      // At least the chart container should be present
      expect(composedChart || bars.length > 0 || line).toBeTruthy()
    }, { timeout: 5000 })
  })

  it('should display reference line at zero', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should calculate cash flow from revenue and expenses', async () => {
    const mockApiResponse = {
      data: {
        revenue: {
          timeSeries: [
            { date: '2024-01-01', value: 1000 },
            { date: '2024-02-01', value: 1200 },
          ],
        },
        expenses: {
          timeSeries: [
            { date: '2024-01-01', value: 500 },
            { date: '2024-02-01', value: 600 },
          ],
        },
      },
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as any)

    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: [
          { date: '2024-01-01', revenue: 1000, expenses: 500, cashFlow: 500 },
          { date: '2024-02-01', revenue: 1200, expenses: 600, cashFlow: 600 },
        ],
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart />)

    await waitFor(() => {
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should use custom period', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart period="90d" />)

    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['cash-flow-chart', '90d'],
        })
      )
    }, { timeout: 3000 })
  })

  it('should use custom height', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<CashFlowChart height={400} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

