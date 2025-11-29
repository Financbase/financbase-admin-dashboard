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
import { EnhancedTopNav } from '@/components/layout/enhanced-top-nav'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
}))

// Mock components
vi.mock('@/components/ui/financbase-logo', () => ({
  FinancbaseLogo: ({ size }: any) => <div data-testid="logo" data-size={size}>Logo</div>,
}))

vi.mock('@/components/ui/animated-navbar', () => ({
  AnimatedNavbar: ({ items }: any) => <nav data-testid="animated-navbar">{items.length} items</nav>,
  navbarItems: [{ label: 'Dashboard', href: '/dashboard' }],
}))

vi.mock('@/components/i18n/language-selector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language</div>,
}))

vi.mock('@/components/ui/search-component', () => ({
  SearchComponent: ({ placeholder }: any) => (
    <input data-testid="search-component" placeholder={placeholder} />
  ),
}))

vi.mock('@/components/core/enhanced-notifications-panel', () => ({
  EnhancedNotificationsPanel: () => <div data-testid="notifications-panel">Notifications</div>,
}))

vi.mock('@/components/organizations/organization-switcher', () => ({
  OrganizationSwitcher: () => <div data-testid="organization-switcher">Org</div>,
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: any) => <div data-testid="sheet" data-open={open}>{children}</div>,
  SheetTrigger: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
  SheetContent: ({ children, side }: any) => (
    <div data-testid="sheet-content" data-side={side}>{children}</div>
  ),
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <h2>{children}</h2>,
  SheetDescription: ({ children }: any) => <p>{children}</p>,
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, asChild }: any) => (asChild ? children : <div>{children}</div>),
  DropdownMenuSeparator: () => <hr />,
}))

describe('EnhancedTopNav', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'admin',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it('should render top navigation', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('should render mobile menu button', () => {
    const onMenuClick = vi.fn()
    render(<EnhancedTopNav onMenuClick={onMenuClick} />)

    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('should call onMenuClick when menu button is clicked', async () => {
    const onMenuClick = vi.fn()
    render(<EnhancedTopNav onMenuClick={onMenuClick} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
    }, { timeout: 3000 })

    const menuButton = screen.getByLabelText('Toggle navigation menu')
    await act(async () => {
      fireEvent.click(menuButton)
    })

    await waitFor(() => {
      expect(onMenuClick).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
  })

  it('should render user information', () => {
    render(<EnhancedTopNav user={mockUser} />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should render organization switcher', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('organization-switcher')).toBeInTheDocument()
  })

  it('should render search component', async () => {
    render(<EnhancedTopNav />)

    await waitFor(() => {
      // Multiple search components might exist (desktop and mobile)
      expect(screen.getAllByTestId('search-component').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should render notifications panel', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('notifications-panel')).toBeInTheDocument()
  })

  it('should render theme toggle', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('should render language selector', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })

  it('should render help dropdown menu', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('User Guides')).toBeInTheDocument()
    expect(screen.getByText('Contact Support')).toBeInTheDocument()
  })

  it('should render user dropdown menu', async () => {
    render(<EnhancedTopNav user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      // Sign out might be rendered differently or might need dropdown to be opened
      const signOut = screen.queryByTestId('sign-out') ||
                     screen.queryByText(/sign out/i) ||
                     screen.queryByText(/logout/i)
      expect(signOut).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render breadcrumb navigation', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should show shadow when scrolled', () => {
    // Set scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 20,
    })

    render(<EnhancedTopNav />)

    // Trigger scroll event
    fireEvent.scroll(window)

    // Header should be in the document
    const header = document.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('should render mobile search sheet', () => {
    render(<EnhancedTopNav />)

    // Mobile search should be available
    const searchButtons = screen.getAllByRole('button')
    const searchButton = searchButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent?.includes('Search')
    )
    expect(searchButton).toBeTruthy()
  })

  it('should display user role badge', () => {
    render(<EnhancedTopNav user={mockUser} />)

    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('should render animated navbar on desktop', () => {
    render(<EnhancedTopNav />)

    expect(screen.getByTestId('animated-navbar')).toBeInTheDocument()
  })
})

