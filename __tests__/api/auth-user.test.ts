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
import { GET } from '@/app/api/auth/user/route'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
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

describe('GET /api/auth/user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return current user information', async () => {
    const mockUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'user@example.com', verification: { status: 'verified' } }],
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      imageUrl: 'https://img.clerk.com/avatar.png',
      createdAt: 1704067200000,
      updatedAt: 1704153600000,
      phoneNumbers: [{ phoneNumber: '+1234567890', verification: { status: 'verified' } }],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('user_123')
    expect(data.email).toBe('user@example.com')
    expect(data.firstName).toBe('John')
    expect(data.lastName).toBe('Doe')
    expect(data.username).toBe('johndoe')
    expect(data.emailVerified).toBe(true)
    expect(data.phoneVerified).toBe(true)
    expect(data.hasImage).toBe(true)
  })

  it('should handle user without email', async () => {
    const mockUser = {
      id: 'user_123',
      emailAddresses: [],
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      imageUrl: '',
      createdAt: 1704067200000,
      updatedAt: 1704153600000,
      phoneNumbers: [],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.email).toBe('')
    expect(data.primaryEmail).toBe('')
  })

  it('should handle user without phone', async () => {
    const mockUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'user@example.com', verification: { status: 'verified' } }],
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      imageUrl: '',
      createdAt: 1704067200000,
      updatedAt: 1704153600000,
      phoneNumbers: [],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.phoneVerified).toBe(false)
    expect(data.primaryPhone).toBe('')
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(currentUser).not.toHaveBeenCalled()
  })

  it('should return 404 if user not found in Clerk', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)

    expect(response.status).toBe(404)
    expect(ApiErrorHandler.notFound).toHaveBeenCalledWith('User not found')
  })

  it('should handle unverified email', async () => {
    const mockUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'user@example.com', verification: { status: 'unverified' } }],
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      imageUrl: '',
      createdAt: 1704067200000,
      updatedAt: 1704153600000,
      phoneNumbers: [],
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.emailVerified).toBe(false)
  })

  it('should handle service errors', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)
    vi.mocked(currentUser).mockRejectedValue(new Error('Clerk API error'))

    const request = new NextRequest('http://localhost:3000/api/auth/user')
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })
})

