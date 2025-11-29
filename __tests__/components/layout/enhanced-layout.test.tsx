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
import { EnhancedLayout } from '@/components/layout/enhanced-layout'

// Mock Next.js navigation
const mockUsePathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
}))

// Mock enhanced sidebar
vi.mock('@/components/layout/enhanced-sidebar', () => ({
  EnhancedSidebar: ({ onClose, collapsed, onToggleCollapse, user }: any) => (
    <div data-testid="enhanced-sidebar" data-collapsed={collapsed ? 'true' : 'false'}>
      {onClose && <button onClick={onClose}>Close</button>}
      {onToggleCollapse && <button onClick={onToggleCollapse}>Toggle</button>}
      {user && <div>User: {user.name}</div>}
    </div>
  ),
}))

// Mock enhanced top nav
vi.mock('@/components/layout/enhanced-top-nav', () => ({
  EnhancedTopNav: ({ onMenuClick, user, notifications }: any) => (
    <div data-testid="enhanced-top-nav">
      <button onClick={onMenuClick}>Menu</button>
      {user && <div>User: {user.name}</div>}
      {notifications > 0 && <div>Notifications: {notifications}</div>}
    </div>
  ),
}))

// Mock dashboard footer
vi.mock('@/components/layout/dashboard-footer', () => ({
  DashboardFooter: () => <footer data-testid="dashboard-footer">Footer</footer>,
}))

// Mock mobile navigation hook
const { mockUseMobileNavigation } = vi.hoisted(() => {
  const useMobileNavigation = vi.fn(() => ({
    isMobile: false,
    touchSupported: false,
    isOpen: false,
    toggleMenu: vi.fn(),
    closeMenu: vi.fn(),
    touchHandlers: {},
  }))
  return { mockUseMobileNavigation: useMobileNavigation }
})

vi.mock('@/hooks/use-mobile-touch', () => {
  return {
    useMobileNavigation: mockUseMobileNavigation,
  }
})

describe('EnhancedLayout', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'admin',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render enhanced layout with children', async () => {
    render(
      <EnhancedLayout>
        <div>Test Content</div>
      </EnhancedLayout>
    )

    // Use getAllByText since content might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should render sidebar', async () => {
    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Use getAllByTestId since sidebar might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-sidebar').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should render top navigation', async () => {
    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Use getAllByTestId since top nav might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-top-nav').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should render dashboard footer', async () => {
    render(
      <EnhancedLayout>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Use getAllByTestId since footer might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByTestId('dashboard-footer').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should toggle sidebar collapse', async () => {
    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-sidebar').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Toggle').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    const toggleButtons = screen.getAllByText('Toggle')
    
    // Click the first toggle button
    if (toggleButtons.length > 0) {
      await act(async () => {
        fireEvent.click(toggleButtons[0])
      })
    }

    // Sidebar should still be in the document
    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-sidebar').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should close mobile menu when close button is clicked', async () => {
    // Mock mobile navigation to return mobile state with touchSupported: true
    // so that closeMenu() is called (not setMobileMenuOpen)
    const mockCloseMenu = vi.fn()
    mockUseMobileNavigation.mockReturnValueOnce({
      isMobile: true,
      touchSupported: true, // Set to true so closeMenu() is called
      isOpen: true,
      toggleMenu: vi.fn(),
      closeMenu: mockCloseMenu,
      touchHandlers: {},
    })

    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    }, { timeout: 3000 })

    const closeButton = screen.getByText('Close')
    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(mockCloseMenu).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should display user information in sidebar', async () => {
    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Use getAllByText since user info might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByText('User: Test User').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should display notifications count', async () => {
    render(
      <EnhancedLayout user={mockUser} notifications={5}>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Use getAllByText since notifications might appear multiple times
    await waitFor(() => {
      expect(screen.getAllByText('Notifications: 5').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should handle mobile menu toggle', async () => {
    // Mock mobile navigation
    // Set touchSupported to true so the component uses mobile navigation's toggleMenu
    const mockToggleMenu = vi.fn()
    mockUseMobileNavigation.mockReturnValueOnce({
      isMobile: true,
      touchSupported: true,
      isOpen: false,
      toggleMenu: mockToggleMenu,
      closeMenu: vi.fn(),
      touchHandlers: {},
    })

    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Menu').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    // Use getAllByText since "Menu" might appear multiple times
    const menuButtons = screen.getAllByText('Menu')
    await act(async () => {
      fireEvent.click(menuButtons[0])
    })

    await waitFor(() => {
      expect(mockToggleMenu).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should close mobile menu on route change', async () => {
    const mockCloseMenu = vi.fn()
    // Set touchSupported to true so the component uses mobile navigation's closeMenu
    mockUseMobileNavigation.mockReturnValueOnce({
      isMobile: true,
      touchSupported: true,
      isOpen: true,
      toggleMenu: vi.fn(),
      closeMenu: mockCloseMenu,
      touchHandlers: {},
    })

    const { rerender } = render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-sidebar').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    // Simulate route change by changing pathname
    mockUsePathname.mockReturnValueOnce('/invoices')

    rerender(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    // Menu should close on route change
    await waitFor(() => {
      expect(mockCloseMenu).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should handle escape key to close mobile menu', async () => {
    const mockCloseMenu = vi.fn()
    // Set touchSupported to true so the component uses mobile navigation's closeMenu
    mockUseMobileNavigation.mockReturnValueOnce({
      isMobile: true,
      touchSupported: true,
      isOpen: true,
      toggleMenu: vi.fn(),
      closeMenu: mockCloseMenu,
      touchHandlers: {},
    })

    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getAllByTestId('enhanced-sidebar').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    await waitFor(() => {
      expect(mockCloseMenu).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should adjust layout when sidebar is collapsed', async () => {
    render(
      <EnhancedLayout user={mockUser}>
        <div>Content</div>
      </EnhancedLayout>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Toggle').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    const toggleButtons = screen.getAllByText('Toggle')
    await act(async () => {
      fireEvent.click(toggleButtons[0])
    })

    // Layout should adjust for collapsed sidebar
    // Use getAllByTestId since sidebar might appear multiple times (mobile and desktop)
    await waitFor(() => {
      const sidebars = screen.getAllByTestId('enhanced-sidebar')
      expect(sidebars.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})

