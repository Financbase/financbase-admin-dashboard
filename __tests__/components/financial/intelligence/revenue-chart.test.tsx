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
import { RevenueChart } from '@/components/financial/intelligence/revenue-chart'
import { useQuery } from '@tanstack/react-query'
import { createMockUseQueryResult } from '@/src/test/test-utils'

// Note: recharts is mocked globally in __tests__/setup.ts
// Note: @tanstack/react-query is mocked globally in __tests__/setup.ts

// Mock fetch
global.fetch = vi.fn()

describe('RevenueChart', () => {
  const mockData = [
    { date: '2024-01-01', value: 1000 },
    { date: '2024-02-01', value: 1200 },
    { date: '2024-03-01', value: 1500 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render revenue chart', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isSuccess: true,
        isLoading: false,
        error: null,
      })
    )

    render(<RevenueChart />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
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

    render(<RevenueChart />)

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

    render(<RevenueChart />)

    await waitFor(() => {
      expect(screen.getByText(/no revenue data available/i)).toBeInTheDocument()
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

    render(<RevenueChart />)

    await waitFor(() => {
      expect(screen.getByText(/no revenue data available/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render chart with data', async () => {
    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: mockData,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<RevenueChart />)

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show prediction line when showPrediction is true', async () => {
    const dataWithPrediction = mockData.map(item => ({
      ...item,
      predicted: item.value * 1.1,
    }))

    vi.mocked(useQuery).mockReturnValue(
      createMockUseQueryResult({
        data: dataWithPrediction,
        isLoading: false,
        isSuccess: true,
        error: null,
      })
    )

    render(<RevenueChart showPrediction={true} />)

    await waitFor(() => {
      expect(screen.getByTestId('line')).toBeInTheDocument()
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

    render(<RevenueChart period="90d" />)

    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['revenue-chart', '90d'],
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

    render(<RevenueChart height={400} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

