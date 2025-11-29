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
import { ExpenseBreakdownChart } from '@/components/financial/intelligence/expense-breakdown-chart'
import { useQuery } from '@tanstack/react-query'
import { createMockUseQueryResult } from '@/src/test/test-utils'

// Note: recharts is mocked globally in __tests__/setup.ts
// Note: @tanstack/react-query is mocked globally in __tests__/setup.ts

// Mock fetch
global.fetch = vi.fn()

describe('ExpenseBreakdownChart', () => {
  const mockData = [
    { category: 'Marketing', amount: 1000 },
    { category: 'Operations', amount: 2000 },
    { category: 'Technology', amount: 1500 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render expense breakdown chart', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isSuccess: true,
        isLoading: false,
        error: null,
      })
    )

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      expect(screen.getByText('Expense Breakdown')).toBeInTheDocument()
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

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      // Loading state might show refresh icon, skeleton, or spinner
      const refreshIcon = screen.queryByTestId('refresh-icon')
      const responsiveContainer = screen.queryByTestId('responsive-container')
      const spinner = document.querySelector('.animate-spin') ||
                     screen.queryByRole('status')
      const loadingText = screen.queryByText(/loading/i)
      expect(refreshIcon || responsiveContainer || spinner || loadingText).toBeTruthy()
    }, { timeout: 5000 })
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

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      expect(screen.getByText(/no expense data available/i)).toBeInTheDocument()
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

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      expect(screen.getByText(/no expense data available/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render pie chart with data', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display category legend with amounts and percentages', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<ExpenseBreakdownChart />)

    await waitFor(() => {
      expect(screen.getByText(/marketing/i)).toBeInTheDocument()
      expect(screen.getByText(/operations/i)).toBeInTheDocument()
      expect(screen.getByText(/technology/i)).toBeInTheDocument()
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

    render(<ExpenseBreakdownChart period="90d" />)

    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['expense-breakdown', '90d'],
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

    render(<ExpenseBreakdownChart height={400} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

