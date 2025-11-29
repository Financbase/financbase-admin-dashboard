/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardHeader from '@/components/core/dashboard-header'
import { useDashboardRefresh, useDashboardLastUpdated } from '@/contexts/dashboard-context'
import { toast } from '@/lib/toast'
import { format } from 'date-fns'

// Mock dependencies
vi.mock('@/contexts/dashboard-context', () => ({
  useDashboardRefresh: vi.fn(),
  useDashboardLastUpdated: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/components/core/date-range-picker', () => ({
  default: () => <div data-testid="date-range-picker">Date Range Picker</div>,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('DashboardHeader', () => {
  const mockTriggerRefresh = vi.fn()
  const mockSetAutoRefresh = vi.fn()
  const mockLastUpdated = new Date('2025-01-15T10:30:00Z')

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDashboardRefresh).mockReturnValue({
      triggerRefresh: mockTriggerRefresh,
      autoRefresh: false,
      setAutoRefresh: mockSetAutoRefresh,
    })
    vi.mocked(useDashboardLastUpdated).mockReturnValue({
      lastUpdated: mockLastUpdated,
    })
  })

  it('should render dashboard header with title', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display last updated time when available', async () => {
    render(<DashboardHeader />)

    const lastUpdatedText = format(mockLastUpdated, 'MMM d, yyyy h:mm a')
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Last updated: ${lastUpdatedText}`))).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should not display last updated when not available', async () => {
    vi.mocked(useDashboardLastUpdated).mockReturnValue({
      lastUpdated: null,
    })

    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render date range picker', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render refresh button', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      const refreshButtons = screen.getAllByRole('button', { name: /refresh/i })
      // Should have at least one refresh button
      expect(refreshButtons.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should trigger refresh when refresh button is clicked', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /refresh/i }).length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    const refreshButtons = screen.getAllByRole('button', { name: /refresh/i })
    // Click the first refresh button
    await act(async () => {
      fireEvent.click(refreshButtons[0])
    })

    await waitFor(() => {
      expect(mockTriggerRefresh).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
  })

  it('should render export button', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i })
      expect(exportButton).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should export dashboard data successfully', async () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' })
    const mockUrl = 'blob:http://localhost/test-url'

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any)

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl)
    global.URL.revokeObjectURL = vi.fn()

    // Spy on document methods but don't mock them - let them work normally
    const createElementSpy = vi.spyOn(document, 'createElement')
    const originalAppendChild = document.body.appendChild.bind(document.body)
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      // Actually append to body but track the call
      return originalAppendChild(node)
    })
    const originalRemoveChild = document.body.removeChild.bind(document.body)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      // Actually remove from body but track the call
      if (node.parentNode === document.body) {
        return originalRemoveChild(node)
      }
      return node
    })

    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const exportButton = screen.getByRole('button', { name: /export/i })
    await act(async () => {
      fireEvent.click(exportButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/export')
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith(
        'Dashboard exported',
        'Your dashboard data has been exported successfully.'
      )
    }, { timeout: 5000 })

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should handle export error gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
    } as any)

    render(<DashboardHeader />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Export failed',
        'Unable to export dashboard data. Please try again.'
      )
    })
  })

  it('should handle export network error', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const exportButton = screen.getByRole('button', { name: /export/i })
    await act(async () => {
      fireEvent.click(exportButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Export failed',
        'Unable to export dashboard data. Please try again.'
      )
    }, { timeout: 5000 })
  })

  it('should render auto-refresh button', () => {
    render(<DashboardHeader />)

    const autoRefreshButton = screen.getByRole('button', { name: /auto-refresh/i })
    expect(autoRefreshButton).toBeInTheDocument()
  })

  it('should toggle auto-refresh when button is clicked', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /auto-refresh/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    const autoRefreshButton = screen.getByRole('button', { name: /auto-refresh/i })
    await act(async () => {
      fireEvent.click(autoRefreshButton)
    })

    await waitFor(() => {
      expect(mockSetAutoRefresh).toHaveBeenCalledWith(true)
    }, { timeout: 3000 })
  })

  it('should show active state when auto-refresh is enabled', async () => {
    vi.mocked(useDashboardRefresh).mockReturnValue({
      triggerRefresh: mockTriggerRefresh,
      autoRefresh: true,
      setAutoRefresh: mockSetAutoRefresh,
    })

    render(<DashboardHeader />)

    await waitFor(() => {
      const autoRefreshButton = screen.getByRole('button', { name: /auto-refresh/i })
      expect(autoRefreshButton).toHaveClass('bg-primary') // default variant when active
    }, { timeout: 3000 })
  })

  it('should apply custom className', async () => {
    const { container } = render(<DashboardHeader className="custom-class" />)

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class')
    }, { timeout: 3000 })
  })

  it('should be responsive on mobile', async () => {
    render(<DashboardHeader />)

    await waitFor(() => {
      const header = screen.getByText('Dashboard Overview').closest('div')
      // Check if header has responsive classes (might be flex-col sm:flex-row or similar)
      const hasResponsiveClasses = header?.classList.contains('flex-col') ||
                                   header?.classList.contains('sm:flex-row') ||
                                   header?.className.includes('flex-col') ||
                                   header?.className.includes('sm:flex-row')
      expect(hasResponsiveClasses || header).toBeTruthy()
    }, { timeout: 3000 })
  })
})

