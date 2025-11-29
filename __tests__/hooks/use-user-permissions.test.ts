/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUserPermissions } from '@/hooks/use-user-permissions'

// Mock Clerk
const mockUser = {
  id: 'user-123',
  publicMetadata: {
    role: 'manager' as const,
    permissions: ['INVOICES_VIEW', 'INVOICES_CREATE'] as any[],
  },
}

const mockUseUser = vi.fn(() => ({
  user: mockUser,
  isLoaded: true,
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}))

// Mock navigation permissions
vi.mock('@/lib/config/navigation-permissions', () => ({
  canAccessRoute: vi.fn((pathname: string, role: string | null, permissions: any[]) => {
    // Simple mock: allow access to most routes
    if (pathname === '/admin' && role !== 'admin') {
      return false
    }
    return true
  }),
}))

describe('useUserPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user role and permissions', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.role).toBe('manager')
    expect(result.current.permissions).toEqual(['INVOICES_VIEW', 'INVOICES_CREATE'])
  })

  it('should return null role when user is not loaded', () => {
    mockUseUser.mockReturnValueOnce({
      user: null,
      isLoaded: false,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.role).toBe(null)
    expect(result.current.permissions).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('should return null role when user has no metadata', () => {
    mockUseUser.mockReturnValueOnce({
      user: { id: 'user-123', publicMetadata: {} },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.role).toBe(null)
    expect(result.current.permissions).toEqual([])
  })

  it('should identify admin users', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isManagerOrAbove).toBe(true)
  })

  it('should identify manager or above', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'manager' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.isManagerOrAbove).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('should check if user has specific permission', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasPermission('INVOICES_VIEW')).toBe(true)
    expect(result.current.hasPermission('INVOICES_DELETE')).toBe(false)
  })

  it('should return true for all permissions if user is admin', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasPermission('INVOICES_VIEW')).toBe(true)
    expect(result.current.hasPermission('INVOICES_DELETE')).toBe(true)
    expect(result.current.hasPermission('ANY_PERMISSION')).toBe(true)
  })

  it('should check if user has any of the permissions', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasAnyPermission(['INVOICES_VIEW', 'INVOICES_DELETE'])).toBe(true)
    expect(result.current.hasAnyPermission(['INVOICES_DELETE', 'EXPENSES_DELETE'])).toBe(false)
  })

  it('should return true for any permission if user is admin', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasAnyPermission(['INVOICES_DELETE', 'EXPENSES_DELETE'])).toBe(true)
  })

  it('should check if user has all permissions', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasAllPermissions(['INVOICES_VIEW', 'INVOICES_CREATE'])).toBe(true)
    expect(result.current.hasAllPermissions(['INVOICES_VIEW', 'INVOICES_DELETE'])).toBe(false)
  })

  it('should return true for all permissions if user is admin', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasAllPermissions(['INVOICES_DELETE', 'EXPENSES_DELETE'])).toBe(true)
  })

  it('should check if user has specific role', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasRole('manager')).toBe(true)
    expect(result.current.hasRole('admin')).toBe(false)
  })

  it('should return true for any role if user is admin', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.hasRole('manager')).toBe(true)
    expect(result.current.hasRole('user')).toBe(true)
  })

  it('should check if user can access route', () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.canAccessRoute('/dashboard')).toBe(true)
    expect(result.current.canAccessRoute('/admin')).toBe(false) // Manager can't access admin
  })

  it('should return true for all routes if user is admin', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'admin' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.canAccessRoute('/admin')).toBe(true)
    expect(result.current.canAccessRoute('/dashboard')).toBe(true)
  })

  it('should handle empty permissions array', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'user' as const,
          permissions: [],
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.permissions).toEqual([])
    expect(result.current.hasPermission('INVOICES_VIEW')).toBe(false)
  })

  it('should handle undefined permissions', () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: 'user-123',
        publicMetadata: {
          role: 'user' as const,
        },
      },
      isLoaded: true,
    })

    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.permissions).toEqual([])
  })
})

