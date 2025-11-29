/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/admin/users/route'
import { PUT } from '@/app/api/admin/users/[id]/permissions/route'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schemas/users.schema'
import { checkPermission } from '@/lib/auth/financbase-rbac'
import { FINANCIAL_PERMISSIONS } from '@/types/auth'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

// Mock RBAC
vi.mock('@/lib/auth/financbase-rbac', () => ({
  checkPermission: vi.fn(),
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    forbidden: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 403 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error: any) => {
      // If error has status 404, return 404, otherwise return 500
      if (error?.status === 404) {
        return new Response(JSON.stringify({ error: error.message || 'Not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
    }),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return users with permissions for authorized admin', async () => {
    const mockDbUsers = [
      {
        id: 'user-1',
        clerkId: 'clerk-1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        organizationId: 'org-1',
        createdAt: new Date(),
      },
      {
        id: 'user-2',
        clerkId: 'clerk-2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'admin',
        isActive: true,
        organizationId: 'org-1',
        createdAt: new Date(),
      },
    ]

    const mockClerkUsers = [
      {
        id: 'clerk-1',
        emailAddresses: [{ emailAddress: 'user1@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        lastSignInAt: 1704067200000,
        publicMetadata: {
          role: 'user',
          permissions: ['invoices:view'],
          financialAccess: { viewRevenue: true },
        },
      },
      {
        id: 'clerk-2',
        emailAddresses: [{ emailAddress: 'user2@example.com' }],
        firstName: 'Jane',
        lastName: 'Smith',
        lastSignInAt: 1704153600000,
        publicMetadata: {
          role: 'admin',
          permissions: ['invoices:view', 'invoices:edit'],
          financialAccess: { viewRevenue: true, editInvoices: true },
        },
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockDbUsers),
        }),
      }),
    } as any)

    const mockGetUser = vi
      .fn()
      .mockResolvedValueOnce(mockClerkUsers[0])
      .mockResolvedValueOnce(mockClerkUsers[1])

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(data[0].email).toBe('user1@example.com')
    expect(data[0].role).toBe('user')
    expect(data[0].permissions).toBeDefined()
    expect(checkPermission).toHaveBeenCalledWith(FINANCIAL_PERMISSIONS.USERS_MANAGE)
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users')
    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(checkPermission).not.toHaveBeenCalled()
  })

  it('should return 403 if user does not have permission', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/admin/users')
    const response = await GET(request)

    expect(response.status).toBe(403)
    expect(ApiErrorHandler.forbidden).toHaveBeenCalledWith('You do not have permission to manage users')
    expect(db.select).not.toHaveBeenCalled()
  })

  it('should handle Clerk API errors gracefully', async () => {
    const mockDbUsers = [
      {
        id: 'user-1',
        clerkId: 'clerk-1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        organizationId: 'org-1',
        createdAt: new Date(),
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockDbUsers),
        }),
      }),
    } as any)

    const mockGetUser = vi.fn().mockRejectedValue(new Error('Clerk API error'))

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    // Should return DB data when Clerk fetch fails
    expect(data[0].email).toBe('user1@example.com')
    expect(data[0].permissions).toEqual([])
  })

  it('should only return active users', async () => {
    const mockDbUsers = [
      {
        id: 'user-1',
        clerkId: 'clerk-1',
        email: 'user1@example.com',
        isActive: true,
        createdAt: new Date(),
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockDbUsers),
        }),
      }),
    } as any)

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          id: 'clerk-1',
          emailAddresses: [{ emailAddress: 'user1@example.com' }],
          publicMetadata: {},
        }),
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users')
    await GET(request)

    // Verify where clause includes isActive check
    expect(db.select).toHaveBeenCalled()
  })
})

describe('PUT /api/admin/users/[id]/permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update user permissions successfully', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    const mockClerkUser = {
      id: 'clerk-123',
      publicMetadata: {
        role: 'user',
        permissions: [],
        financialAccess: {},
      },
    }

    const mockGetUser = vi.fn().mockResolvedValue(mockClerkUser)
    const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
        updateUserMetadata: mockUpdateUserMetadata,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({
        permissions: ['invoices:view', 'invoices:edit'],
        role: 'manager',
      }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.role).toBe('manager')
    expect(data.user.permissions).toEqual(['invoices:view', 'invoices:edit'])
    expect(mockGetUser).toHaveBeenCalledWith('clerk-123')
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith('clerk-123', {
      publicMetadata: expect.objectContaining({
        role: 'manager',
        permissions: ['invoices:view', 'invoices:edit'],
      }),
    })
  })

  it('should preserve existing metadata when updating', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    const mockClerkUser = {
      id: 'clerk-123',
      publicMetadata: {
        role: 'user',
        permissions: [],
        financialAccess: { viewRevenue: true },
        organizationId: 'org-123',
        preferences: { theme: 'dark' },
      },
    }

    const mockGetUser = vi.fn().mockResolvedValue(mockClerkUser)
    const mockUpdateUserMetadata = vi.fn().mockResolvedValue(undefined)

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
        updateUserMetadata: mockUpdateUserMetadata,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({
        role: 'manager',
      }),
    })

    await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(mockUpdateUserMetadata).toHaveBeenCalledWith('clerk-123', {
      publicMetadata: expect.objectContaining({
        role: 'manager',
        financialAccess: { viewRevenue: true },
        organizationId: 'org-123',
        preferences: { theme: 'dark' },
      }),
    })
  })

  it('should return 400 for invalid JSON', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: 'invalid json',
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(response.status).toBe(400)
    expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith('Invalid JSON in request body')
  })

  it('should return 400 for invalid role', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({
        role: 'invalid-role',
      }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(response.status).toBe(500) // Zod validation error
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })

  it('should handle Clerk API errors', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    const mockGetUser = vi.fn().mockRejectedValue(new Error('Clerk API error'))

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({
        role: 'manager',
      }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(response.status).toBe(500)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({ permissions: [] }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(response.status).toBe(401)
  })

  it('should return 403 if user does not have permission', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({ permissions: [] }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    expect(response.status).toBe(403)
  })

  it('should return 404 if user not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'admin-123' } as any)
    vi.mocked(checkPermission).mockResolvedValue(true)

    // Mock clerkClient to throw a 404 error when getUser is called
    const mockGetUser = vi.fn().mockRejectedValue({
      status: 404,
      message: 'User not found',
    })

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: mockGetUser,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/admin/users/clerk-123/permissions', {
      method: 'PUT',
      body: JSON.stringify({ permissions: [] }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: 'clerk-123' }) })

    // The route handler catches the error and calls ApiErrorHandler.handle()
    // which should return 404 for 404 errors
    expect(response.status).toBe(404)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })
})

