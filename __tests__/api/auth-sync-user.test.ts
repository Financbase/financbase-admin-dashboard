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
import { GET, POST } from '@/app/api/auth/sync-user/route'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schemas'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// Helper to create a thenable query builder
const createThenableQuery = (result: any[] = []) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
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

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn((message?: string) =>
      new Response(JSON.stringify({ error: message || 'Unauthorized' }), { status: 401 })
    ),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
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

describe('POST /api/auth/sync-user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sync new user successfully', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
    }

    const mockOrg = {
      id: 'org-123',
      name: 'Default Organization',
    }

    const mockNewUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      organizationId: 'org-123',
      firstName: 'John',
      lastName: 'Doe',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock user check - not found
    vi.mocked(db.select).mockReturnValueOnce(createThenableQuery([]))

    // Mock organization query
    vi.mocked(db.select).mockReturnValueOnce(createThenableQuery([mockOrg]))

    // Mock user insert
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockNewUser]),
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.id).toBe('user-123')
    expect(data.user.email).toBe('user@example.com')
  })

  it('should return existing user if already synced', async () => {
    const mockExistingUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      organizationId: 'org-123',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)

    // Mock user check - found
    vi.mocked(db.select).mockReturnValue(createThenableQuery([mockExistingUser]))

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('User already exists in database')
    expect(data.user.id).toBe('user-123')
    expect(db.insert).not.toHaveBeenCalled()
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
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock user check - not found
    vi.mocked(db.select)
      .mockReturnValueOnce(createThenableQuery([])) // User not found
      .mockReturnValueOnce(createThenableQuery([])) // No existing org

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

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(db.insert).toHaveBeenCalledTimes(2) // Org + User
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(db.select).not.toHaveBeenCalled()
  })

  it('should return 404 if Clerk user not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(null)

    // Mock user check - not found
    vi.mocked(db.select).mockReturnValue(createThenableQuery([]))

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(404)
    expect(ApiErrorHandler.notFound).toHaveBeenCalledWith('User not found in Clerk')
  })

  it('should return 400 if user email not found', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [], // No email
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock user check - not found
    vi.mocked(db.select).mockReturnValue(createThenableQuery([]))

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith('User email not found in Clerk account')
  })

  it('should handle duplicate user error gracefully', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
    }

    const mockExistingUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock user check - not found initially
    vi.mocked(db.select)
      .mockReturnValueOnce(createThenableQuery([])) // User not found initially
      .mockReturnValueOnce(createThenableQuery([])) // Organization query
      .mockReturnValueOnce(createThenableQuery([mockExistingUser])) // Found after duplicate error

    // Mock insert to throw duplicate error
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23505' }), // Unique constraint violation
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('already exists')
  })

  it('should handle other database errors', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    // Mock user check - not found
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    // Mock organization query
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    // Mock insert to throw non-duplicate error
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('Database connection error')),
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })
})

describe('GET /api/auth/sync-user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return sync status when user exists', async () => {
    const mockUser = {
      id: 'user-123',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      organizationId: 'org-123',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)

    vi.mocked(db.select).mockReturnValue(createThenableQuery([mockUser]))

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.synced).toBe(true)
    expect(data.user.id).toBe('user-123')
  })

  it('should return sync status when user does not exist', async () => {
    const mockClerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'user@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any)

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.synced).toBe(false)
    expect(data.clerkUser).toBeDefined()
    expect(data.clerkUser.email).toBe('user@example.com')
    expect(data.message).toContain('not synced')
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user')
    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(ApiErrorHandler.unauthorized).toHaveBeenCalled()
  })

  it('should handle service errors', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any)
    vi.mocked(db.select).mockImplementation(() => {
      throw new Error('Database error')
    })

    const request = new NextRequest('http://localhost:3000/api/auth/sync-user')
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })
})

