/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  checkPermission, 
  checkPermissions, 
  checkFinancialAccess,
  checkRoutePermissions,
  getRouteRequiredPermissions
} from '@/lib/auth/financbase-rbac'
import { auth } from '@clerk/nextjs/server'
import { getEffectiveRoleAndPermissions } from '@/lib/services/subscription-rbac.service'
import { canAccessWithSubscription } from '@/lib/utils/subscription-rbac-utils'
import { canAccessRoute, getRoutePermissions } from '@/lib/config/navigation-permissions'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock subscription RBAC service
vi.mock('@/lib/services/subscription-rbac.service', () => ({
  getEffectiveRoleAndPermissions: vi.fn(),
}))

// Mock subscription RBAC utils
vi.mock('@/lib/utils/subscription-rbac-utils', () => ({
  canAccessWithSubscription: vi.fn(),
}))

// Mock navigation permissions
vi.mock('@/lib/config/navigation-permissions', () => ({
  canAccessRoute: vi.fn(),
  getRoutePermissions: vi.fn(),
}))

describe('Financbase RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkPermission', () => {
    it('should return false for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should return true for admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'admin',
            permissions: [],
          },
        },
      } as any)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(true)
    })

    it('should check Clerk metadata permissions', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:invoices', 'create:invoices'],
          },
        },
      } as any)
      vi.mocked(canAccessWithSubscription).mockResolvedValue(false)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(true)
    })

    it('should check subscription permissions when Clerk permission not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:clients'],
          },
        },
      } as any)
      vi.mocked(canAccessWithSubscription).mockResolvedValue(true)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(true)
    })

    it('should return false when no permissions found', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: [],
          },
        },
      } as any)
      vi.mocked(canAccessWithSubscription).mockResolvedValue(false)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should handle missing metadata gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {},
      } as any)

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'))

      const result = await checkPermission('view:invoices' as any)
      expect(result).toBe(false)
    })
  })

  describe('checkPermissions', () => {
    it('should return true when user has all required permissions', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:invoices', 'create:invoices', 'edit:invoices'],
          },
        },
      } as any)
      vi.mocked(canAccessWithSubscription).mockResolvedValue(false)

      const result = await checkPermissions(['view:invoices', 'create:invoices'] as any[])
      expect(result).toBe(true)
    })

    it('should return false when user missing any permission', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:invoices'],
          },
        },
      } as any)
      vi.mocked(canAccessWithSubscription).mockResolvedValue(false)

      const result = await checkPermissions(['view:invoices', 'delete:invoices'] as any[])
      expect(result).toBe(false)
    })

    it('should return true for admin users regardless of permissions', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'admin',
            permissions: [],
          },
        },
      } as any)

      const result = await checkPermissions(['view:invoices', 'delete:invoices'] as any[])
      expect(result).toBe(true)
    })
  })

  describe('checkFinancialAccess', () => {
    it('should return true for users with financial access', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            financialAccess: {
              invoices: true,
              expenses: true,
            },
          },
        },
      } as any)

      const result = await checkFinancialAccess('invoices')
      expect(result).toBe(true)
    })

    it('should return false for users without financial access', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            financialAccess: {
              invoices: false,
              expenses: true,
            },
          },
        },
      } as any)

      const result = await checkFinancialAccess('invoices')
      expect(result).toBe(false)
    })

    it('should return false for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const result = await checkFinancialAccess('invoices')
      expect(result).toBe(false)
    })
  })

  describe('checkRoutePermissions', () => {
    it('should check route access using navigation config', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:dashboard'],
          },
        },
      } as any)
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: [],
      })
      vi.mocked(canAccessRoute).mockReturnValue(true)

      const result = await checkRoutePermissions('/dashboard')
      expect(result).toBe(true)
      expect(canAccessRoute).toHaveBeenCalledWith('/dashboard', 'user', ['view:dashboard'])
    })

    it('should combine Clerk and subscription permissions', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: ['view:dashboard'],
          },
        },
      } as any)
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: ['view:analytics'],
      })
      vi.mocked(canAccessRoute).mockReturnValue(true)

      const result = await checkRoutePermissions('/dashboard')
      expect(result).toBe(true)
      expect(canAccessRoute).toHaveBeenCalledWith(
        '/dashboard',
        'user',
        expect.arrayContaining(['view:dashboard', 'view:analytics'])
      )
    })

    it('should use higher role from subscription', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            role: 'user',
            permissions: [],
          },
        },
      } as any)
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'manager',
        permissions: [],
      })
      vi.mocked(canAccessRoute).mockReturnValue(true)

      const result = await checkRoutePermissions('/dashboard')
      expect(result).toBe(true)
      expect(canAccessRoute).toHaveBeenCalledWith('/dashboard', 'manager', [])
    })

    it('should return false for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const result = await checkRoutePermissions('/dashboard')
      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'))

      const result = await checkRoutePermissions('/dashboard')
      expect(result).toBe(false)
    })
  })

  describe('getRouteRequiredPermissions', () => {
    it('should return required permissions for a route', () => {
      vi.mocked(getRoutePermissions).mockReturnValue(['view:dashboard', 'view:analytics'] as any[])

      const result = getRouteRequiredPermissions('/dashboard')
      expect(result).toEqual(['view:dashboard', 'view:analytics'])
      expect(getRoutePermissions).toHaveBeenCalledWith('/dashboard')
    })
  })
})

