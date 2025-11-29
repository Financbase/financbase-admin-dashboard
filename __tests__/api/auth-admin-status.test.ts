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
import { GET } from '@/app/api/auth/admin-status/route'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/financbase-rbac'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock RBAC
vi.mock('@/lib/auth/financbase-rbac', () => ({
  isAdmin: vi.fn(),
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}))

describe('GET /api/auth/admin-status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return admin status for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(isAdmin).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/auth/admin-status')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.isAdmin).toBe(true)
    expect(isAdmin).toHaveBeenCalled()
  })

  it('should return false for non-admin user', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(isAdmin).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/admin-status')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.isAdmin).toBe(false)
  })

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/admin-status')
    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(isAdmin).not.toHaveBeenCalled()
  })

  it('should handle service errors', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(isAdmin).mockRejectedValue(new Error('RBAC service error'))

    const request = new NextRequest('http://localhost:3000/api/auth/admin-status')
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(ApiErrorHandler.handle).toHaveBeenCalled()
  })
})

