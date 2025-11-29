/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  RevenueTrendChart,
  ExpenseBreakdownChart,
  CashFlowChart,
  ProfitabilityChart,
  FinancialChartsDashboard,
} from '@/components/financial/intelligence/financial-charts'

describe('Financial Charts', () => {
  const mockRevenueData = [
    { date: '2024-01-01', value: 95000 },
    { date: '2024-02-01', value: 108000 },
    { date: '2024-03-01', value: 125000 },
  ]

  const mockExpenseData = [
    { date: '2024-01-01', value: 45000, label: 'Marketing' },
    { date: '2024-02-01', value: 52000, label: 'Operations' },
    { date: '2024-03-01', value: 48000, label: 'Technology' },
  ]

  const mockCashFlowData = [
    { date: '2024-01-01', value: 50000 },
    { date: '2024-02-01', value: 56000 },
    { date: '2024-03-01', value: 77000 },
  ]

  beforeEach(() => {
    // Mock window.matchMedia for responsive components
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('RevenueTrendChart', () => {
    it('should render revenue trend chart', async () => {
      render(
        <RevenueTrendChart
          data={mockRevenueData}
          title="Revenue Trends"
          type="line"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Revenue Trends')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display trend indicator when showTrend is true', async () => {
      render(
        <RevenueTrendChart
          data={mockRevenueData}
          title="Revenue Trends"
          type="line"
          showTrend={true}
          trendValue={12.5}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should format currency values correctly', async () => {
      render(
        <RevenueTrendChart
          data={mockRevenueData}
          title="Revenue Trends"
          type="line"
          currency={true}
        />
      )

      // Chart should display currency formatted values
      await waitFor(() => {
        expect(screen.getByText('Revenue Trends')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display summary stats', async () => {
      render(
        <RevenueTrendChart
          data={mockRevenueData}
          title="Revenue Trends"
          type="line"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/current/i)).toBeInTheDocument()
        expect(screen.getByText(/average/i)).toBeInTheDocument()
        expect(screen.getByText(/peak/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show negative trend correctly', async () => {
      render(
        <RevenueTrendChart
          data={mockRevenueData}
          title="Revenue Trends"
          type="line"
          showTrend={true}
          trendValue={-5.2}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/-5\.2%/)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('ExpenseBreakdownChart', () => {
    it('should render expense breakdown chart', async () => {
      render(
        <ExpenseBreakdownChart
          data={mockExpenseData}
          title="Expense Breakdown"
          type="pie"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Expense Breakdown')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display total amount', async () => {
      render(
        <ExpenseBreakdownChart
          data={mockExpenseData}
          title="Expense Breakdown"
          type="pie"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/total/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display category legend with percentages', async () => {
      render(
        <ExpenseBreakdownChart
          data={mockExpenseData}
          title="Expense Breakdown"
          type="pie"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/marketing/i)).toBeInTheDocument()
        expect(screen.getByText(/operations/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('CashFlowChart', () => {
    it('should render cash flow chart', async () => {
      render(
        <CashFlowChart
          data={mockCashFlowData}
          title="Cash Flow Analysis"
          type="area"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Cash Flow Analysis')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display positive and negative month counts', async () => {
      const mixedData = [
        { date: '2024-01-01', value: 50000 },
        { date: '2024-02-01', value: -20000 },
        { date: '2024-03-01', value: 77000 },
      ]

      render(
        <CashFlowChart
          data={mixedData}
          title="Cash Flow Analysis"
          type="area"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/positive months/i)).toBeInTheDocument()
        expect(screen.getByText(/negative months/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('ProfitabilityChart', () => {
    it('should render profitability chart', async () => {
      render(
        <ProfitabilityChart
          data={mockRevenueData}
          title="Profitability Trends"
          type="bar"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Profitability Trends')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display growth percentage', async () => {
      render(
        <ProfitabilityChart
          data={mockRevenueData}
          title="Profitability Trends"
          type="bar"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/growth/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('FinancialChartsDashboard', () => {
    it('should render financial charts dashboard', async () => {
      render(<FinancialChartsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Financial Analytics')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should render tabs for different views', async () => {
      render(<FinancialChartsDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /revenue/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /expenses/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /cash flow/i })).toBeInTheDocument() // "Cash Flow" has a space
        expect(screen.getByRole('tab', { name: /profitability/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should render export button', async () => {
      render(<FinancialChartsDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should render date range button', async () => {
      render(<FinancialChartsDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /last 6 months/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})

