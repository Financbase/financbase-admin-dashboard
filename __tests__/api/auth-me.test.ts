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
import { GET } from '@/app/api/auth/me/route'
import { auth } from '@clerk/nextjs/server'
import { getUserFromDatabase } from '@/lib/db/rls-context'
import { ApiErrorHandler } from '@/lib/api-error-handler'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schemas'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

// Mock getUserFromDatabase
vi.mock('@/lib/db/rls-context', () => ({
  getUserFromDatabase: vi.fn(),
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user information when user exists', async () => {
    const mockUser = {
      id: 'user-123',
      clerk_id: 'clerk-123',
      organization_id: 'org-123',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('user-123')
    expect(data.clerkId).toBe('clerk-123')
    expect(data.email).toBe('user@example.com')
    expect(getUserFromDatabase).toHaveBeenCalledWith('clerk-123')
  })

  it('should auto-sync user if not found in database', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
    }

    const mockNewUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      organizationId: 'org-123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const mockOrg = {
      id: 'org-123',
      name: 'Default Organization',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase)
      .mockResolvedValueOnce(null) // First call: user not found
      .mockResolvedValueOnce(mockNewUser as any) // After sync: user found

    // Mock currentUser import
    const { currentUser } = await import('@clerk/nextjs/server')
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock organization query
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockOrg]),
        }),
      }),
    } as any)

    // Mock user insert
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockNewUser]),
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('user-123')
    expect(db.insert).toHaveBeenCalled()
  })

  it('should create default organization if it does not exist', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
    }

    const mockNewOrg = {
      id: 'org-123',
      name: 'Default Organization',
    }

    const mockNewUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      organizationId: 'org-123',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockNewUser as any)

    const { currentUser } = await import('@clerk/nextjs/server')
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock organization query - no existing org
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    // Mock organization insert
    vi.mocked(db.insert)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewOrg]),
        }),
      } as any)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewUser]),
        }),
      } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)

    expect(response.status).toBe(200)
    // Should create organization first, then user
    expect(db.insert).toHaveBeenCalledTimes(2)
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(getUserFromDatabase).not.toHaveBeenCalled()
  })

  it('should return 404 if user not found and sync fails', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase).mockResolvedValue(null)

    const { currentUser } = await import('@clerk/nextjs/server')
    vi.mocked(currentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)

    expect(response.status).toBe(404)
    expect(ApiErrorHandler.notFound).toHaveBeenCalled()
  })

  it('should handle sync errors gracefully', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null) // Still not found after sync attempt

    const { currentUser } = await import('@clerk/nextjs/server')
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock organization query
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    // Mock insert to throw error
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('Database error')),
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)

    // Should return 404 after failed sync
    expect(response.status).toBe(404)
  })

  it('should handle duplicate user error during sync', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
    }

    const mockExistingUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(getUserFromDatabase)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockExistingUser as any) // Found after duplicate error

    const { currentUser } = await import('@clerk/nextjs/server')
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock organization query
    vi.mocked(db.select)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingUser]),
          }),
        }),
      } as any)

    // Mock insert to throw duplicate error
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23505' }), // Unique constraint violation
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/me')
    const response = await GET(request)

    // Should successfully return user after handling duplicate error
    expect(response.status).toBe(200)
  })
})

