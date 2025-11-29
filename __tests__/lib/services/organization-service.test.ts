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
  getUserOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  isUserMemberOfOrganization,
  getUserRoleInOrganization,
  hasPermission,
  getActiveOrganizationId,
  switchOrganization,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
} from '@/lib/services/organization.service'
import { db } from '@/lib/db'
import { organizations, organizationMembers, organizationSettings } from '@/lib/db/schemas'
import { eq, and, or } from 'drizzle-orm'

// Unmock organization service to test actual implementation
vi.unmock('@/lib/services/organization.service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

// Don't mock crypto - use real implementation to avoid default export issues
// The tests will use actual randomBytes which is fine for testing

describe('Organization Service', () => {
  let mockDb: any

  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
    };
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result);
      return onResolve ? promise.then(onResolve) : promise;
    });
    query.catch = vi.fn((onReject?: (error: any) => any) => {
      const promise = Promise.resolve(result);
      return onReject ? promise.catch(onReject) : promise;
    });
    Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' });
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    // Reset select mock to use default implementation
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('getUserOrganizations', () => {
    it('should retrieve all organizations for a user', async () => {
      const mockOrganizations = [
        {
          organization: { id: 'org-1', name: 'Org 1', slug: 'org-1', isActive: true },
          membership: { role: 'owner', userId: 'user-123', joinedAt: new Date() },
        },
        {
          organization: { id: 'org-2', name: 'Org 2', slug: 'org-2', isActive: true },
          membership: { role: 'member', userId: 'user-123', joinedAt: new Date() },
        },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockOrganizations))

      const result = await getUserOrganizations('user-123')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })
  })

  describe('getOrganizationById', () => {
    it('should retrieve organization by ID with membership info', async () => {
      const mockOrg = {
        organization: {
          id: 'org-123',
          name: 'Test Org',
          isActive: true,
        },
        membership: {
          role: 'owner',
          userId: 'user-123',
        },
      }

      mockDb.select
        .mockImplementationOnce(() => createThenableQuery([mockOrg]))
        .mockImplementationOnce(() => createThenableQuery([{ count: 5 }]))

      const result = await getOrganizationById('org-123', 'user-123')

      expect(result).toBeDefined()
      expect(result?.id).toBe('org-123')
      expect(result?.role).toBe('owner')
    })

    it('should return null if organization not found', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await getOrganizationById('org-123', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('createOrganization', () => {
    it('should create organization successfully', async () => {
      const input = {
        name: 'New Organization',
        description: 'Test organization',
      }

      const mockOrganization = {
        id: 'org-123',
        ...input,
        slug: 'new-organization',
        ownerId: 'user-123',
        isActive: true,
        createdAt: new Date(),
      }

      // Mock slug uniqueness check
      mockDb.select.mockImplementationOnce(() => createThenableQuery([])) // No existing org with this slug

      // Mock organization insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrganization]),
        }),
      })

      // Mock member insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      })

      // Mock settings insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const result = await createOrganization(input, 'user-123')

      expect(result).toEqual(mockOrganization)
      expect(mockDb.insert).toHaveBeenCalledTimes(3) // org, member, settings
    })

    it('should generate unique slug if provided slug exists', async () => {
      const input = {
        name: 'Test Org',
        slug: 'test-org',
      }

      const mockOrganization = {
        id: 'org-123',
        ...input,
        slug: 'test-org-abcd1234', // Modified slug
        ownerId: 'user-123',
        isActive: true,
      }

      // Mock slug exists
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ slug: 'test-org' }])) // Slug exists

      // Mock organization insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrganization]),
        }),
      })

      // Mock member and settings inserts
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const result = await createOrganization(input, 'user-123')

      expect(result.slug).toContain('test-org')
      expect(result.slug).not.toBe('test-org') // Should be modified
    })
  })

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      const input = {
        id: 'org-123',
        name: 'Updated Name',
        description: 'Updated description',
      }

      const mockMembership = {
        role: 'owner',
        userId: 'user-123',
      }

      const mockUpdatedOrg = {
        id: 'org-123',
        ...input,
        updatedAt: new Date(),
      }

      // Mock membership check
      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockMembership]))

      // Mock update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedOrg]),
          }),
        }),
      })

      const result = await updateOrganization(input, 'user-123')

      expect(result.name).toBe('Updated Name')
      expect(result.description).toBe('Updated description')
    })

    it('should throw error if user lacks permission', async () => {
      const input = {
        id: 'org-123',
        name: 'Updated Name',
      }

      // Mock no membership (or member role, not admin/owner)
      mockDb.select.mockImplementationOnce(() => createThenableQuery([])) // No admin/owner membership

      await expect(updateOrganization(input, 'user-123')).rejects.toThrow(
        'Insufficient permissions'
      )
    })
  })

  describe('deleteOrganization', () => {
    it('should soft delete organization if user is owner', async () => {
      const mockMembership = {
        role: 'owner',
        userId: 'user-123',
      }

      // Mock membership check
      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockMembership]))

      // Mock soft delete
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      await deleteOrganization('org-123', 'user-123')

      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should throw error if user is not owner', async () => {
      // Mock no owner membership
      mockDb.select.mockImplementationOnce(() => createThenableQuery([])) // No owner membership

      await expect(deleteOrganization('org-123', 'user-123')).rejects.toThrow(
        'Only organization owners'
      )
    })
  })

  describe('isUserMemberOfOrganization', () => {
    it('should return true if user is member', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ userId: 'user-123' }]))

      const result = await isUserMemberOfOrganization('user-123', 'org-123')

      expect(result).toBe(true)
    })

    it('should return false if user is not member', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await isUserMemberOfOrganization('user-123', 'org-123')

      expect(result).toBe(false)
    })
  })

  describe('getUserRoleInOrganization', () => {
    it('should return user role in organization', async () => {
      const mockMembership = {
        role: 'admin',
        userId: 'user-123',
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockMembership]))

      const result = await getUserRoleInOrganization('user-123', 'org-123')

      expect(result).toBe('admin')
    })

    it('should return null if user is not member', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await getUserRoleInOrganization('user-123', 'org-123')

      expect(result).toBeNull()
    })
  })

  describe('hasPermission', () => {
    it('should return true for owner role', async () => {
      // hasPermission calls getUserRoleInOrganization which returns just the role string
      // But getUserRoleInOrganization does a select query that returns an object with role
      const mockMembership = {
        role: 'owner',
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockMembership]))

      const result = await hasPermission('user-123', 'org-123', 'owner')

      expect(result).toBe(true) // Owners have all permissions
    })

    it('should check permission based on role', async () => {
      const mockMembership = {
        role: 'admin',
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockMembership]))

      const result = await hasPermission('user-123', 'org-123', 'member')

      expect(result).toBe(true) // Admins can do member-level actions
    })
  })

  describe('getOrganizationMembers', () => {
    it('should retrieve organization members', async () => {
      // getOrganizationMembers expects objects with member and user properties
      const mockMembers = [
        {
          member: { id: 'member-1', userId: 'user-1', role: 'admin' },
          user: { id: 'user-1', email: 'user1@test.com', firstName: 'User', lastName: 'One' },
        },
        {
          member: { id: 'member-2', userId: 'user-2', role: 'member' },
          user: { id: 'user-2', email: 'user2@test.com', firstName: 'User', lastName: 'Two' },
        },
      ]

      // Mock permission check (hasPermission calls getUserRoleInOrganization)
      // First call: getUserRoleInOrganization for permission check
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ role: 'admin' }]))

      // Mock members query - returns objects with member and user
      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockMembers))

      const result = await getOrganizationMembers('org-123', 'user-123')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const mockUpdatedMember = {
        id: 'member-123',
        role: 'admin',
        userId: 'user-456',
      }

      // Mock permission checks (hasPermission -> getUserRoleInOrganization)
      // First: getUserRoleInOrganization for requester (returns owner)
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ role: 'owner' }]))

      // Mock member update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedMember]),
          }),
        }),
      })

      const result = await updateMemberRole('org-123', 'user-123', 'user-456', 'admin')

      expect(result.role).toBe('admin')
    })
  })

  describe('removeMember', () => {
    it('should remove member from organization', async () => {
      // Mock permission checks (hasPermission -> getUserRoleInOrganization)
      // First: getUserRoleInOrganization for requester (returns owner)
      mockDb.select.mockImplementationOnce(() => createThenableQuery([{ role: 'owner' }]))

      // Mock member deletion
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await removeMember('org-123', 'user-123', 'user-456')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })
})

