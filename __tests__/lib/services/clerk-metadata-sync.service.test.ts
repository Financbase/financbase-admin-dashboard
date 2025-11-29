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
  syncSubscriptionToClerk,
  updateClerkMetadata,
  revertToFreePlan,
  syncCurrentSubscriptionToClerk,
} from '@/lib/services/clerk-metadata-sync.service'
import { clerkClient } from '@clerk/nextjs/server'
import { getEffectiveRoleAndPermissions, getPlanRoleMapping } from '@/lib/services/subscription-rbac.service'
import { db } from '@/lib/db'
import { subscriptionPlans, userSubscriptions } from '@/lib/db/schemas'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}))

// Mock subscription RBAC service
vi.mock('@/lib/services/subscription-rbac.service', () => ({
  getEffectiveRoleAndPermissions: vi.fn(),
  getPlanRoleMapping: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

// Helper to create a thenable query builder
const createThenableQuery = (result: any[]) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  query.then = vi.fn((onResolve?: (value: any[]) => any) => {
    const promise = Promise.resolve(result)
    return onResolve ? promise.then(onResolve) : promise
  })
  query.catch = vi.fn((onReject?: (error: any) => any) => {
    const promise = Promise.resolve(result)
    return onReject ? promise.catch(onReject) : promise
  })
  Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' })
  return query
}

describe('clerk-metadata-sync.service', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    // Reset select mock to use thenable pattern by default
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('syncSubscriptionToClerk', () => {
    it('should sync subscription to Clerk metadata successfully', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'plan-123',
        status: 'active',
        createdAt: new Date(),
      }

      const mockPlan = {
        id: 'plan-123',
        name: 'Pro',
        price: '29.99',
      }

      const mockEffective = {
        role: 'manager' as const,
        permissions: ['invoices:view', 'invoices:edit'],
        financialAccess: {
          viewRevenue: true,
          editInvoices: true,
          approveExpenses: false,
          manageReports: false,
          accessAuditLogs: false,
        },
      }

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue(mockEffective)

      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      const result = await syncSubscriptionToClerk('user-123', mockSubscription as any, mockPlan as any)

      expect(result.success).toBe(true)
      expect(getEffectiveRoleAndPermissions).toHaveBeenCalledWith('user-123')
      expect(mockUpdateUserMetadata).toHaveBeenCalledWith('user-123', {
        publicMetadata: expect.objectContaining({
          role: 'manager',
          permissions: ['invoices:view', 'invoices:edit'],
        }),
      })
    })

    it('should return error if effective role cannot be determined', async () => {
      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue(null)

      const result = await syncSubscriptionToClerk('user-123', {} as any, {} as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Could not determine effective role')
    })

    it('should handle errors and return failure', async () => {
      vi.mocked(getEffectiveRoleAndPermissions).mockRejectedValue(new Error('RBAC error'))

      const result = await syncSubscriptionToClerk('user-123', {} as any, {} as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('updateClerkMetadata', () => {
    it('should update Clerk metadata successfully on first attempt', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {
          organizationId: 'org-123',
          preferences: { theme: 'dark' },
        },
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      const result = await updateClerkMetadata(
        'user-123',
        'manager',
        ['invoices:view'],
        {
          viewRevenue: true,
          editInvoices: false,
          approveExpenses: false,
          manageReports: false,
          accessAuditLogs: false,
        }
      )

      expect(result.success).toBe(true)
      expect(mockUpdateUserMetadata).toHaveBeenCalledWith('user-123', {
        publicMetadata: expect.objectContaining({
          role: 'manager',
          permissions: ['invoices:view'],
          organizationId: 'org-123',
          preferences: { theme: 'dark' },
        }),
      })
    })

    it('should preserve existing metadata fields', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {
          organizationId: 'org-123',
          preferences: { theme: 'light', language: 'en' },
          customField: 'value',
        },
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      await updateClerkMetadata('user-123', 'user', [], {
        viewRevenue: false,
        editInvoices: false,
        approveExpenses: false,
        manageReports: false,
        accessAuditLogs: false,
      })

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith('user-123', {
        publicMetadata: expect.objectContaining({
          organizationId: 'org-123',
          preferences: { theme: 'light', language: 'en' },
        }),
      })
    })

    it('should retry on failure with exponential backoff', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi
        .fn()
        .mockRejectedValueOnce(new Error('Clerk API error'))
        .mockRejectedValueOnce(new Error('Clerk API error'))
        .mockResolvedValueOnce(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      // Use fake timers to speed up retry delays
      vi.useFakeTimers()

      const updatePromise = updateClerkMetadata('user-123', 'user', [], {
        viewRevenue: false,
        editInvoices: false,
        approveExpenses: false,
        manageReports: false,
        accessAuditLogs: false,
      })

      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(3000)

      const result = await updatePromise

      expect(result.success).toBe(true)
      expect(mockUpdateUserMetadata).toHaveBeenCalledTimes(3)

      vi.useRealTimers()
    })

    it('should return error after max retries', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockRejectedValue(new Error('Persistent error'))

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      vi.useFakeTimers()

      const updatePromise = updateClerkMetadata('user-123', 'user', [], {
        viewRevenue: false,
        editInvoices: false,
        approveExpenses: false,
        manageReports: false,
        accessAuditLogs: false,
      })

      await vi.advanceTimersByTimeAsync(10000)

      const result = await updatePromise

      expect(result.success).toBe(false)
      // The error message is the last error's message, not the default
      expect(result.error).toBe('Persistent error')
      expect(mockUpdateUserMetadata).toHaveBeenCalledTimes(3)

      vi.useRealTimers()
    })
  })

  describe('revertToFreePlan', () => {
    it('should revert user to free plan successfully', async () => {
      const mockFreePlan = {
        id: 'plan-free',
        name: 'Free',
        price: '0.00',
      }

      const mockMapping = {
        id: 'mapping-1',
        planId: 'plan-free',
        role: 'user' as const,
        permissions: ['invoices:view'],
        gracePeriodDays: 0,
        isTrialMapping: false,
      }

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockFreePlan]),
          }),
        }),
      } as any)

      vi.mocked(getPlanRoleMapping).mockResolvedValue(mockMapping as any)

      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      const result = await revertToFreePlan('user-123')

      expect(result.success).toBe(true)
      expect(getPlanRoleMapping).toHaveBeenCalledWith('plan-free', false)
      expect(mockUpdateUserMetadata).toHaveBeenCalled()
    })

    it('should return error if free plan not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)

      const result = await revertToFreePlan('user-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Free plan not found')
    })

    it('should return error if free plan mapping not found', async () => {
      const mockFreePlan = {
        id: 'plan-free',
        name: 'Free',
      }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockFreePlan]),
          }),
        }),
      } as any)

      vi.mocked(getPlanRoleMapping).mockResolvedValue(null)

      const result = await revertToFreePlan('user-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Free plan RBAC mapping not found')
    })

    it('should calculate financial access from permissions', async () => {
      const mockFreePlan = {
        id: 'plan-free',
        name: 'Free',
      }

      const mockMapping = {
        id: 'mapping-1',
        planId: 'plan-free',
        role: 'user' as const,
        permissions: ['revenue:view', 'invoices:edit', 'expenses:approve', 'reports:create', 'audit:view'],
        gracePeriodDays: 0,
        isTrialMapping: false,
      }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockFreePlan]),
          }),
        }),
      } as any)

      vi.mocked(getPlanRoleMapping).mockResolvedValue(mockMapping as any)

      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      await revertToFreePlan('user-123')

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith('user-123', {
        publicMetadata: expect.objectContaining({
          financialAccess: expect.objectContaining({
            viewRevenue: true,
            editInvoices: true,
            approveExpenses: true,
            manageReports: true,
            accessAuditLogs: true,
          }),
        }),
      })
    })
  })

  describe('syncCurrentSubscriptionToClerk', () => {
    it('should sync current subscription to Clerk', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'plan-123',
        status: 'active',
        createdAt: new Date(),
      }

      const mockPlan = {
        id: 'plan-123',
        name: 'Pro',
        price: '29.99',
      }

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockSubscription]),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockPlan]),
            }),
          }),
        } as any)

      const mockEffective = {
        role: 'manager' as const,
        permissions: ['invoices:view'],
        financialAccess: {
          viewRevenue: true,
          editInvoices: false,
          approveExpenses: false,
          manageReports: false,
          accessAuditLogs: false,
        },
      }

      vi.mocked(getEffectiveRoleAndPermissions).mockResolvedValue(mockEffective)

      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      const result = await syncCurrentSubscriptionToClerk('user-123')

      expect(result.success).toBe(true)
    })

    it('should revert to free plan if no subscription exists', async () => {
      const mockFreePlan = {
        id: 'plan-free',
        name: 'Free',
      }

      const mockMapping = {
        id: 'mapping-1',
        planId: 'plan-free',
        role: 'user' as const,
        permissions: ['invoices:view'],
        gracePeriodDays: 0,
        isTrialMapping: false,
      }

      // Mock: no subscription found (first select in syncCurrentSubscriptionToClerk)
      // Then revertToFreePlan is called, which needs:
      // 1. Select free plan
      mockDb.select.mockImplementationOnce(() => createThenableQuery([])) // No subscription
        .mockImplementationOnce(() => createThenableQuery([mockFreePlan])) // Free plan lookup

      vi.mocked(getPlanRoleMapping).mockResolvedValue(mockMapping as any)

      const mockGetUser = vi.fn().mockResolvedValue({
        id: 'user-123',
        publicMetadata: {},
      })

      const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          updateUserMetadata: mockUpdateUserMetadata,
        },
      } as any)

      const result = await syncCurrentSubscriptionToClerk('user-123')

      expect(result.success).toBe(true)
      expect(getPlanRoleMapping).toHaveBeenCalled()
    })

    it('should return error if subscription plan not found', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'plan-123',
        status: 'active',
        createdAt: new Date(),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockSubscription]),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // Plan not found
            }),
          }),
        } as any)

      const result = await syncCurrentSubscriptionToClerk('user-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Subscription plan not found')
    })

    it('should handle errors and return failure', async () => {
      vi.mocked(db.select).mockRejectedValue(new Error('Database error'))

      const result = await syncCurrentSubscriptionToClerk('user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

