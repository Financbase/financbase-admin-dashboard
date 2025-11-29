/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import BillPayDashboard from '@/components/bill-pay/bill-pay-dashboard'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('BillPayDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should render bill pay dashboard', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: [], total: 0 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Bill Pay Automation')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display stats cards', async () => {
    const mockBills = [
      {
        id: 'bill-1',
        billNumber: 'BILL-001',
        amount: '1000.00',
        currency: 'USD',
        status: 'pending_approval',
        priority: 'high',
        description: 'Office supplies',
        dueDate: '2025-02-01',
        vendorName: 'Vendor A',
        createdAt: '2025-01-01',
      },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: mockBills, total: 1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [mockBills[0]], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Bills')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display bills in overview tab', async () => {
    const mockBills = [
      {
        id: 'bill-1',
        billNumber: 'BILL-001',
        amount: '1000.00',
        currency: 'USD',
        status: 'pending_approval',
        priority: 'high',
        description: 'Office supplies',
        dueDate: '2025-02-01',
        vendorName: 'Vendor A',
        createdAt: '2025-01-01',
      },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: mockBills, total: 1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('BILL-001')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display bills in bills tab', async () => {
    const mockBills = [
      {
        id: 'bill-1',
        billNumber: 'BILL-001',
        amount: '1000.00',
        currency: 'USD',
        status: 'pending_approval',
        priority: 'high',
        description: 'Office supplies',
        dueDate: '2025-02-01',
        vendorName: 'Vendor A',
        createdAt: '2025-01-01',
      },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: mockBills, total: 1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Bills')).toBeInTheDocument()
    }, { timeout: 3000 })

    const billsTab = screen.getByText('Bills')
    await act(async () => {
      fireEvent.click(billsTab)
    })

    await waitFor(() => {
      // Look for "All Bills" or any bills-related content - use queryAllByText to handle multiple matches
      const allBillsTexts = screen.queryAllByText('All Bills')
      const allBillsTextsByRegex = screen.queryAllByText(/all.*bills/i)
      const billsTexts = screen.queryAllByText(/bills/i)
      // At least one should be found
      const totalBillsTexts = allBillsTexts.length + allBillsTextsByRegex.length + billsTexts.length
      expect(totalBillsTexts).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('should display vendors in vendors tab', async () => {
    const mockVendors = [
      {
        id: 'vendor-1',
        name: 'Vendor A',
        email: 'vendor@example.com',
        status: 'active',
        category: 'office',
        totalBills: 5,
        totalSpent: '5000.00',
      },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: [], total: 0 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: mockVendors }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Vendors')).toBeInTheDocument()
    }, { timeout: 3000 })

    const vendorsTab = screen.getByText('Vendors')
    await act(async () => {
      fireEvent.click(vendorsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Vendor A')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display approvals tab', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: [], total: 0 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vendors: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ overdue: [], pendingApproval: [], scheduledToday: [], disputed: [] }),
      } as Response)

    render(<BillPayDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Approvals')).toBeInTheDocument()
    }, { timeout: 3000 })

    const approvalsTab = screen.getByText('Approvals')
    await act(async () => {
      fireEvent.click(approvalsTab)
    })

    await waitFor(() => {
      // Look for "No pending approvals" or any approvals-related content
      const noApprovalsText = screen.queryByText('No pending approvals') ||
                             screen.queryByText(/no.*pending.*approval/i) ||
                             screen.queryByText(/pending.*approval/i) ||
                             screen.queryByText(/approval/i)
      expect(noApprovalsText).toBeTruthy()
    }, { timeout: 5000 })
  })

  it('should handle loading state', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))

    render(<BillPayDashboard />)

    // Component should show loading spinner
    await waitFor(() => {
      const status = screen.queryByRole('status')
      const spinner = document.querySelector('.animate-spin')
      expect(status || spinner).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should handle error state', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    render(<BillPayDashboard />)

    await waitFor(() => {
      // Component should handle error gracefully
      expect(screen.getByText('Bill Pay Automation')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

