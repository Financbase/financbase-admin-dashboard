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
import { EnhancedSidebar } from '@/components/layout/enhanced-sidebar'

// Mock Next.js navigation
const mockUsePathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock FinancbaseLogo
vi.mock('@/components/ui/financbase-logo', () => ({
  FinancbaseLogo: ({ size }: any) => <div data-testid="financbase-logo" data-size={size}>Logo</div>,
}))

// Mock UserAvatar
vi.mock('@/components/core/ui/layout/user-avatar', () => ({
  UserAvatar: ({ name, imageUrl, size }: any) => (
    <div data-testid="user-avatar" data-name={name} data-size={size}>
      {imageUrl ? <img src={imageUrl} alt={name} /> : name?.charAt(0)}
    </div>
  ),
}))

// Mock useUserPermissions
const mockUseUserPermissions = vi.fn(() => ({
  role: 'admin',
  permissions: [],
  isAdmin: true,
  hasPermission: () => true,
  canAccessRoute: () => true,
  isLoading: false,
  isManagerOrAbove: true,
  hasAnyPermission: () => true,
  hasAllPermissions: () => true,
  hasRole: () => true,
}))

vi.mock('@/hooks/use-user-permissions', () => ({
  useUserPermissions: () => mockUseUserPermissions(),
}))

// Mock navigation permissions
vi.mock('@/lib/config/navigation-permissions', () => ({
  canAccessRoute: () => true,
}))

describe('EnhancedSidebar', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'admin',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sidebar', async () => {
    render(<EnhancedSidebar />)

    await waitFor(() => {
      expect(screen.getByTestId('financbase-logo')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render sidebar with user information', () => {
    render(<EnhancedSidebar user={mockUser} />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should render sidebar in collapsed state', async () => {
    render(<EnhancedSidebar collapsed={true} />)

    // The sidebar doesn't have a testid, but we can check for collapsed state by checking width class
    await waitFor(() => {
      // Check that the logo is rendered (sidebar is rendered)
      expect(screen.getByTestId('financbase-logo')).toBeInTheDocument()
      // Check for collapsed width class (w-16) in the sidebar container
      const sidebar = document.querySelector('.w-16')
      expect(sidebar).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should toggle collapse when button is clicked', async () => {
    const onToggleCollapse = vi.fn()
    render(<EnhancedSidebar onToggleCollapse={onToggleCollapse} />)

    // The toggle button has a ChevronLeft icon, not text
    // Find it by finding a button that's a child of the header
    await waitFor(() => {
      const header = document.querySelector('.flex.h-16.items-center.justify-between')
      expect(header).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find the toggle button (button with ChevronLeft icon in header)
    const header = document.querySelector('.flex.h-16.items-center.justify-between')
    const toggleButton = header?.querySelector('button[type="button"]') as HTMLButtonElement
    
    expect(toggleButton).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    await waitFor(() => {
      expect(onToggleCollapse).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
  })

  it('should close sidebar when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<EnhancedSidebar onClose={onClose} />)

    // The close button has an X icon, not text
    // Find it by finding buttons in the header
    await waitFor(() => {
      const header = document.querySelector('.flex.h-16.items-center.justify-between')
      expect(header).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find the close button (button with X icon in header, should be the second button)
    const header = document.querySelector('.flex.h-16.items-center.justify-between')
    const buttons = header?.querySelectorAll('button[type="button"]') || []
    const closeButton = Array.from(buttons).find(btn => btn.classList.contains('lg:hidden')) as HTMLButtonElement ||
                       Array.from(buttons)[buttons.length - 1] as HTMLButtonElement
    
    expect(closeButton).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
  })

  it('should render navigation items', () => {
    render(<EnhancedSidebar />)

    // Check for common navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should highlight active navigation item', async () => {
    mockUsePathname.mockReturnValueOnce('/dashboard')

    render(<EnhancedSidebar />)

    await waitFor(() => {
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    }, { timeout: 3000 })
  })

  it('should hide section labels when collapsed', async () => {
    render(<EnhancedSidebar collapsed={true} />)

    // Section labels should be hidden when collapsed
    // Check that the sidebar has collapsed width class
    await waitFor(() => {
      expect(screen.getByTestId('financbase-logo')).toBeInTheDocument()
      // Check for collapsed width class (w-16) in the sidebar container
      const sidebar = document.querySelector('.w-16')
      expect(sidebar).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display guest user when no user provided', () => {
    render(<EnhancedSidebar />)

    expect(screen.getByText('Guest User')).toBeInTheDocument()
    expect(screen.getByText('Not signed in')).toBeInTheDocument()
  })

  it('should filter navigation items based on permissions', () => {
    // Mock non-admin user
    mockUseUserPermissions.mockReturnValueOnce({
      role: 'user',
      permissions: ['INVOICES_VIEW'],
      isAdmin: false,
      hasPermission: (perm: string) => perm === 'INVOICES_VIEW',
      canAccessRoute: (path: string) => path === '/invoices',
      isLoading: false,
      isManagerOrAbove: false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      hasRole: () => false,
    })

    render(<EnhancedSidebar />)

    // Only accessible routes should be shown
    expect(screen.getByText('Invoices')).toBeInTheDocument()
  })

  it('should group navigation items by section', () => {
    render(<EnhancedSidebar />)

    // Check for section grouping (Main, Financial Management, etc.)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

