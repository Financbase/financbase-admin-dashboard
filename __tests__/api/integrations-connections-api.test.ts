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
import { GET, POST } from '@/app/api/integrations/connections/route'
import { IntegrationService } from '@/lib/services/integration-service'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/integration-service', () => ({
  IntegrationService: {
    getConnections: vi.fn(),
    getIntegration: vi.fn(),
    createConnection: vi.fn(),
  },
}))

vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
    databaseError: vi.fn((error) => new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'req-123'),
}))

describe('GET /api/integrations/connections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return connections for authenticated user', async () => {
    const mockConnections = [
      {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        name: 'Stripe Connection',
        status: 'active',
      },
    ]

    const mockIntegration = {
      id: 1,
      name: 'Stripe',
      category: 'payment',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getConnections).mockResolvedValue(mockConnections)
    vi.mocked(IntegrationService.getIntegration).mockResolvedValue(mockIntegration)

    const request = new NextRequest('http://localhost/api/integrations/connections')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('integration')
  })

  it('should filter connections by status', async () => {
    const mockConnections = [
      {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        status: 'active',
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getConnections).mockResolvedValue(mockConnections)
    vi.mocked(IntegrationService.getIntegration).mockResolvedValue({ id: 1, name: 'Stripe' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections?status=active')
    const response = await GET(request)

    expect(IntegrationService.getConnections).toHaveBeenCalledWith('user-123', {
      status: 'active',
      limit: 50,
      offset: 0,
    })
  })

  it('should filter connections by integration ID', async () => {
    const mockConnections = [
      {
        id: 1,
        userId: 'user-123',
        integrationId: 1,
        status: 'active',
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getConnections).mockResolvedValue(mockConnections)
    vi.mocked(IntegrationService.getIntegration).mockResolvedValue({ id: 1, name: 'Stripe' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections?integrationId=1')
    const response = await GET(request)

    expect(IntegrationService.getConnections).toHaveBeenCalledWith('user-123', {
      integrationId: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('POST /api/integrations/connections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new connection', async () => {
    const connectionData = {
      integrationId: 1,
      name: 'Stripe Connection',
      accessToken: 'token-123',
    }

    const mockConnection = {
      id: 1,
      userId: 'user-123',
      ...connectionData,
      status: 'active',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.createConnection).mockResolvedValue(mockConnection as any)

    const request = new NextRequest('http://localhost/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(mockConnection)
    expect(IntegrationService.createConnection).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining(connectionData)
    )
  })

  it('should return 400 when required fields are missing', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify({ name: 'Connection' }), // Missing integrationId and accessToken
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when JSON is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify({
        integrationId: 1,
        name: 'Connection',
        accessToken: 'token',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should handle optional fields', async () => {
    const connectionData = {
      integrationId: 1,
      name: 'Stripe Connection',
      accessToken: 'token-123',
      refreshToken: 'refresh-123',
      tokenExpiresAt: '2025-12-31T00:00:00Z',
      organizationId: 'org-1',
      settings: { autoSync: true },
    }

    const mockConnection = {
      id: 1,
      userId: 'user-123',
      ...connectionData,
      status: 'active',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.createConnection).mockResolvedValue(mockConnection as any)

    const request = new NextRequest('http://localhost/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(IntegrationService.createConnection).toHaveBeenCalled()
  })
})

