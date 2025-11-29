/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { canAccessWithSubscription, getSubscriptionStatus, hasSubscriptionFeature, isSubscriptionActive } from '@/lib/utils/subscription-rbac-utils'
import { db } from '@/lib/db'
import { getEffectiveRoleAndPermissions, getPlanRoleMapping } from '@/lib/services/subscription-rbac.service'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

// Mock subscription RBAC service
vi.mock('@/lib/services/subscription-rbac.service', () => ({
  getEffectiveRoleAndPermissions: vi.fn(),
  getPlanRoleMapping: vi.fn(),
}))

describe('Subscription RBAC Utils', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('canAccessWithSubscription', () => {
    it('should return false for invalid userId', async () => {
      const result = await canAccessWithSubscription('', 'view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should check subscription permissions via getSubscriptionStatus', async () => {
      // Mock getSubscriptionStatus to return status with permissions
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: ['view:invoices', 'create:invoices'],
      })

      // Mock database queries for getSubscriptionStatus
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'active' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: {} },
              ]),
            }),
          }),
        })

      const result = await canAccessWithSubscription('user-123', 'view:invoices' as any)
      expect(result).toBe(true)
    })

    it('should return false when user does not have permission', async () => {
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: ['view:clients'], // Different permission
      })

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'active' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: {} },
              ]),
            }),
          }),
        })

      const result = await canAccessWithSubscription('user-123', 'view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should return false when no subscription found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // No subscription
            }),
          }),
        }),
      })

      // Mock free plan lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: 'plan-free', name: 'Free', features: {} },
            ]),
          }),
        }),
      })

      vi.mocked(getPlanRoleMapping).mockResolvedValue({
        role: 'viewer',
        permissions: [],
      })

      const result = await canAccessWithSubscription('user-123', 'view:invoices' as any)
      expect(result).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error('Database error')),
            }),
          }),
        }),
      })

      const result = await canAccessWithSubscription('user-123', 'view:invoices' as any)
      expect(result).toBe(false)
    })
  })

  describe('getSubscriptionStatus', () => {
    it('should return subscription status for active user', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'active' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: {} },
              ]),
            }),
          }),
        })

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: ['view:invoices'],
      })

      const { getSubscriptionStatus } = await import('@/lib/utils/subscription-rbac-utils')
      const result = await getSubscriptionStatus('user-123')

      expect(result).toBeTruthy()
      expect(result?.subscription).toBeTruthy()
      expect(result?.plan).toBeTruthy()
      expect(result?.effectiveRole).toBe('user')
      expect(result?.effectivePermissions).toContain('view:invoices')
    })
  })

  describe('hasSubscriptionFeature', () => {
    it('should check if user has a subscription feature', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'active' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: { advanced_analytics: true } },
              ]),
            }),
          }),
        })

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: [],
      })

      const { hasSubscriptionFeature } = await import('@/lib/utils/subscription-rbac-utils')
      const result = await hasSubscriptionFeature('user-123', 'advanced_analytics')

      expect(result).toBe(true)
    })
  })

  describe('isSubscriptionActive', () => {
    it('should return true for active subscriptions', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'active' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: {} },
              ]),
            }),
          }),
        })

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: [],
        isInGracePeriod: false,
      })

      const { isSubscriptionActive } = await import('@/lib/utils/subscription-rbac-utils')
      const result = await isSubscriptionActive('user-123')

      expect(result).toBe(true)
    })

    it('should return false for cancelled subscriptions', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  { id: 'sub-1', userId: 'user-123', planId: 'plan-1', status: 'cancelled' },
                ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 'plan-1', name: 'Pro', features: {} },
              ]),
            }),
          }),
        })

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue({
        role: 'user',
        permissions: [],
        isInGracePeriod: false,
      })

      const { isSubscriptionActive } = await import('@/lib/utils/subscription-rbac-utils')
      const result = await isSubscriptionActive('user-123')

      expect(result).toBe(false)
    })
  })
})

