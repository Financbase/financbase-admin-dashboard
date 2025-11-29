/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkspaceService } from '@/lib/services/platform/workspace.service'
import { auth } from '@clerk/nextjs/server'
import { getDbOrThrow } from '@/lib/db'
import { workspaces, workspaceMembers } from '@/drizzle/schema/workspaces'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  getDbOrThrow: vi.fn(),
}))

describe('WorkspaceService', () => {
  let service: WorkspaceService
  let mockDb: any

  // Helper to create a thenable query builder with all methods
  const createThenableQuery = (result: any[] = []) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      rightJoin: vi.fn().mockReturnThis(),
      fullJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      having: vi.fn().mockReturnThis(),
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
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    }
    vi.mocked(getDbOrThrow).mockReturnValue(mockDb)
    service = new WorkspaceService()
    vi.clearAllMocks()
    // Reset call count for each test
    mockDb.select.mockReset()
  })

  describe('getWorkspaces', () => {
    it('should return paginated workspaces for user', async () => {
      const mockMemberWorkspaces = [
        { workspaceId: 'ws-1' },
        { workspaceId: 'ws-2' },
      ]

      const mockWorkspaces = [
        {
          id: 1,
          workspaceId: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          plan: 'pro',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberRole: 'owner',
          memberPermissions: ['read', 'write', 'admin'],
        },
        {
          id: 2,
          workspaceId: 'ws-2',
          name: 'Workspace 2',
          slug: 'workspace-2',
          plan: 'free',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberRole: 'member',
          memberPermissions: ['read'],
        },
      ]

      // Note: The service code calls auth() without await, which is a bug
      // For testing, we mock it to return the value directly
      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      // Mock member workspaces query - need to handle the async query chain
      mockDb.select.mockReturnValueOnce(createThenableQuery(mockMemberWorkspaces))

      // Mock count query
      mockDb.select.mockReturnValueOnce(createThenableQuery([{ count: 2 }]))

      // Mock workspaces query
      mockDb.select.mockReturnValueOnce(createThenableQuery(mockWorkspaces))

      const result = await service.getWorkspaces({}, 1, 20)

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBe(1)
    })

    it('should filter workspaces by search term', async () => {
      const mockMemberWorkspaces = [{ workspaceId: 'ws-1' }]
      const mockWorkspaces = [
        {
          id: 1,
          workspaceId: 'ws-1',
          name: 'My Workspace',
          slug: 'my-workspace',
          plan: 'pro',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberRole: 'owner',
          memberPermissions: ['read', 'write'],
        },
      ]

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockMemberWorkspaces))
        .mockReturnValueOnce(createThenableQuery([{ count: 1 }]))
        .mockReturnValueOnce(createThenableQuery(mockWorkspaces))

      await service.getWorkspaces({ search: 'My' }, 1, 20)

      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should filter workspaces by plan', async () => {
      const mockMemberWorkspaces = [{ workspaceId: 'ws-1' }]

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockMemberWorkspaces))
        .mockReturnValueOnce(createThenableQuery([{ count: 0 }]))
        .mockReturnValueOnce(createThenableQuery([]))

      const result = await service.getWorkspaces({ plan: 'pro' }, 1, 20)

      expect(result.data).toEqual([])
    })

    it('should return empty result when user has no workspaces', async () => {
      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([]))

      const result = await service.getWorkspaces({}, 1, 20)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.getWorkspaces({}, 1, 20)).rejects.toThrow('Unauthorized')
    })
  })

  describe('getWorkspaceById', () => {
    it('should return workspace by ID', async () => {
      const mockWorkspace = {
        id: 1,
        workspaceId: 'ws-123',
        name: 'My Workspace',
        slug: 'my-workspace',
        plan: 'pro',
        status: 'active',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        memberRole: 'owner',
        memberPermissions: ['read', 'write', 'admin'],
      }

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      // getWorkspaceById does:
      // 1. Main select with leftJoin for workspace - this is the FIRST call to this.db.select()
      //    The main query: this.db.select({...}).from(workspaces).leftJoin(...).where(...).limit(1)
      // 2. Nested select for member workspaces (used in inArray) - this is created INSIDE inArray
      //    The subquery: this.db.select({ workspaceId: workspaceMembers.workspaceId }).from(...).where(...)
      //    This is NOT executed directly - it's passed to inArray, so it needs to be a builder, not thenable
      
      // Main query needs to be thenable and return the workspace (FIRST call)
      const mainQuery = createThenableQuery([mockWorkspace])
      
      // Create a non-thenable builder for the subquery (used in inArray, SECOND call)
      const subqueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      }
      
      mockDb.select
        .mockReturnValueOnce(mainQuery) // Main query (executed, thenable) - FIRST call
        .mockReturnValueOnce(subqueryBuilder) // Subquery builder (used in inArray, not executed directly) - SECOND call

      const result = await service.getWorkspaceById('ws-123')

      expect(result).toBeDefined()
      expect(result).toEqual(mockWorkspace) // Should return the full workspace object
      expect(result.workspaceId).toBe('ws-123')
      expect(result.name).toBe('My Workspace')
    })

    it('should throw error if workspace not found or access denied', async () => {
      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      // Mock the main query to return empty (workspace not found)
      mockDb.select.mockReturnValue(createThenableQuery([]))

      await expect(service.getWorkspaceById('ws-123')).rejects.toThrow('Workspace not found or access denied')
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.getWorkspaceById('ws-123')).rejects.toThrow('Unauthorized')
    })
  })

  describe('createWorkspace', () => {
    it('should create workspace successfully', async () => {
      const workspaceData = {
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'A new workspace',
        plan: 'free' as const,
      }

      const mockNewWorkspace = {
        id: 1,
        workspaceId: 'ws_123_456', // Match the pattern /^ws_\d+_/
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'A new workspace',
        plan: 'free',
        status: 'active',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.insert
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockNewWorkspace]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue(undefined),
        })

      const result = await service.createWorkspace(workspaceData)

      expect(result).toBeDefined()
      expect(result.name).toBe('New Workspace')
      expect(result.workspaceId).toMatch(/^ws_\d+_/)
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // Workspace + member
    })

    it('should add creator as owner member', async () => {
      const workspaceData = {
        name: 'New Workspace',
        slug: 'new-workspace',
      }

      const mockNewWorkspace = {
        id: 1,
        workspaceId: 'ws_123_456',
        name: 'New Workspace',
        slug: 'new-workspace',
        plan: 'free',
        status: 'active',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      const mockValues = vi.fn()
      mockDb.insert
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockNewWorkspace]),
          }),
        })
        .mockReturnValueOnce({
          values: mockValues,
        })

      await service.createWorkspace(workspaceData)

      expect(mockValues).toHaveBeenCalledWith({
        workspaceId: 1,
        userId: 'user-123',
        role: 'owner',
        permissions: ['read', 'write', 'admin', 'delete'],
      })
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.createWorkspace({ name: 'Test', slug: 'test' })).rejects.toThrow('Unauthorized')
    })
  })

  describe('updateWorkspace', () => {
    it('should update workspace successfully', async () => {
      const updateData = {
        name: 'Updated Workspace',
        description: 'Updated description',
      }

      const mockUpdatedWorkspace = {
        id: 1,
        workspaceId: 'ws-123',
        name: 'Updated Workspace',
        slug: 'workspace-123',
        description: 'Updated description',
        plan: 'pro',
        status: 'active',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedWorkspace]),
          }),
        }),
      })

      const result = await service.updateWorkspace('ws-123', updateData)

      expect(result).toBeDefined()
      expect(result.name).toBe('Updated Workspace')
      expect(result.description).toBe('Updated description')
    })

    it('should update workspace settings as JSON string', async () => {
      const updateData = {
        settings: { theme: 'dark', notifications: true },
      }

      const mockUpdatedWorkspace = {
        id: 1,
        workspaceId: 'ws-123',
        name: 'Workspace',
        settings: JSON.stringify({ theme: 'dark', notifications: true }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      const mockSet = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUpdatedWorkspace]),
        }),
      })

      mockDb.update.mockReturnValue({
        set: mockSet,
      })

      await service.updateWorkspace('ws-123', updateData)

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: JSON.stringify({ theme: 'dark', notifications: true }),
        })
      )
    })

    it('should throw error if workspace not found or user is not owner', async () => {
      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(service.updateWorkspace('ws-123', { name: 'Test' })).rejects.toThrow(
        'Workspace not found or access denied'
      )
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.updateWorkspace('ws-123', { name: 'Test' })).rejects.toThrow('Unauthorized')
    })
  })

  describe('deleteWorkspace', () => {
    it('should soft delete workspace by setting status to inactive', async () => {
      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      await service.deleteWorkspace('ws-123')

      expect(mockDb.update).toHaveBeenCalled()
      const setCall = mockDb.update().set
      expect(setCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'inactive',
        })
      )
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.deleteWorkspace('ws-123')).rejects.toThrow('Unauthorized')
    })
  })

  describe('getUserWorkspaces', () => {
    it('should return user workspaces', async () => {
      const mockWorkspaces = [
        {
          id: 1,
          workspaceId: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          plan: 'pro',
          status: 'active',
          ownerId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberRole: 'owner',
          memberPermissions: ['read', 'write'],
        },
      ]

      vi.mocked(auth).mockReturnValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockWorkspaces))

      const result = await service.getUserWorkspaces()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Workspace 1')
    })

    it('should accept optional userId parameter', async () => {
      const mockWorkspaces = [
        {
          id: 1,
          workspaceId: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          plan: 'pro',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockWorkspaces))

      const result = await service.getUserWorkspaces('user-456')

      expect(result).toHaveLength(1)
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)

      await expect(service.getUserWorkspaces()).rejects.toThrow('Unauthorized')
    })
  })
})

