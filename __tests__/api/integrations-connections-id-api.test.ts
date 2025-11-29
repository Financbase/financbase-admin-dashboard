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
import { GET, PATCH, DELETE } from '@/app/api/integrations/connections/[id]/route'
import { IntegrationService } from '@/lib/services/integration-service'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/integration-service', () => ({
  IntegrationService: {
    getConnection: vi.fn(),
    updateConnection: vi.fn(),
    deleteConnection: vi.fn(),
  },
}))

vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    notFound: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
    databaseError: vi.fn((error) => new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'req-123'),
}))

describe('GET /api/integrations/connections/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return connection by ID', async () => {
    const mockConnection = {
      id: 1,
      userId: 'user-123',
      integrationId: 1,
      name: 'Stripe Connection',
      status: 'active',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getConnection).mockResolvedValue(mockConnection as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1')
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockConnection)
    expect(IntegrationService.getConnection).toHaveBeenCalledWith(1, 'user-123')
  })

  it('should return 404 when connection not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.getConnection).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/integrations/connections/999')
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when connection ID is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/invalid')
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1')
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/integrations/connections/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update connection', async () => {
    const updateData = {
      name: 'Updated Connection',
      status: 'inactive',
    }

    const mockUpdatedConnection = {
      id: 1,
      userId: 'user-123',
      ...updateData,
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.updateConnection).mockResolvedValue(mockUpdatedConnection as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUpdatedConnection)
    expect(IntegrationService.updateConnection).toHaveBeenCalledWith(1, 'user-123', updateData)
  })

  it('should return 404 when connection not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.updateConnection).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/integrations/connections/999', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when JSON is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1', {
      method: 'PATCH',
      body: 'invalid json',
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/integrations/connections/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete connection', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.deleteConnection).mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/integrations/connections/1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Connection deleted successfully' })
    expect(IntegrationService.deleteConnection).toHaveBeenCalledWith(1, 'user-123')
  })

  it('should return 404 when connection not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(IntegrationService.deleteConnection).mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/integrations/connections/999', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when connection ID is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/invalid', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/integrations/connections/1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

