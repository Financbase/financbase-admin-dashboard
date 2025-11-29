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
import { GET } from '@/app/api/integrations/route'
import { IntegrationService } from '@/lib/services/integration-service'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/integration-service', () => ({
  IntegrationService: {
    getIntegrations: vi.fn(),
  },
}))

vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
    databaseError: vi.fn((error) => new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'req-123'),
}))

describe('GET /api/integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return integrations for authenticated user', async () => {
    const mockIntegrations = [
      { id: 1, name: 'Stripe', category: 'payment', isActive: true },
      { id: 2, name: 'Slack', category: 'communication', isActive: true },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getIntegrations).mockResolvedValue(mockIntegrations)

    const request = new NextRequest('http://localhost/api/integrations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockIntegrations)
    expect(IntegrationService.getIntegrations).toHaveBeenCalledWith({
      isActive: true,
      limit: 50,
      offset: 0,
    })
  })

  it('should filter integrations by category', async () => {
    const mockIntegrations = [
      { id: 1, name: 'Stripe', category: 'payment', isActive: true },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getIntegrations).mockResolvedValue(mockIntegrations)

    const request = new NextRequest('http://localhost/api/integrations?category=payment')
    const response = await GET(request)

    expect(IntegrationService.getIntegrations).toHaveBeenCalledWith({
      category: 'payment',
      isActive: true,
      limit: 50,
      offset: 0,
    })
  })

  it('should search integrations', async () => {
    const mockIntegrations = [
      { id: 1, name: 'Stripe', category: 'payment', isActive: true },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getIntegrations).mockResolvedValue(mockIntegrations)

    const request = new NextRequest('http://localhost/api/integrations?search=Stripe')
    const response = await GET(request)

    expect(IntegrationService.getIntegrations).toHaveBeenCalledWith({
      search: 'Stripe',
      isActive: true,
      limit: 50,
      offset: 0,
    })
  })

  it('should paginate integrations', async () => {
    const mockIntegrations = [
      { id: 1, name: 'Stripe', category: 'payment', isActive: true },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getIntegrations).mockResolvedValue(mockIntegrations)

    const request = new NextRequest('http://localhost/api/integrations?limit=10&offset=20')
    const response = await GET(request)

    expect(IntegrationService.getIntegrations).toHaveBeenCalledWith({
      isActive: true,
      limit: 10,
      offset: 20,
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should handle database errors', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getIntegrations).mockRejectedValue(
      new Error('DATABASE_URL connection failed')
    )

    const request = new NextRequest('http://localhost/api/integrations')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})

