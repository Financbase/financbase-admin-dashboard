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
import { GET, PUT, DELETE } from '@/app/api/webhooks/[id]/route'
import { WebhookService } from '@/lib/services/webhook-service'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/webhook-service', () => ({
  WebhookService: {
    getWebhook: vi.fn(),
    updateWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
  },
}))

vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    notFound: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    handle: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'req-123'),
}))

describe('GET /api/webhooks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return webhook by ID', async () => {
    const mockWebhook = {
      id: 1,
      userId: 'user-123',
      name: 'Invoice Webhook',
      url: 'https://example.com/webhook',
      events: ['invoice.created'],
      isActive: true,
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhook).mockResolvedValue(mockWebhook as any)

    const request = new NextRequest('http://localhost/api/webhooks/1')
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockWebhook)
    expect(WebhookService.getWebhook).toHaveBeenCalledWith(1, 'user-123')
  })

  it('should return 404 when webhook not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhook).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/webhooks/999')
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when webhook ID is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks/invalid')
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/webhooks/1')
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

describe('PUT /api/webhooks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update webhook', async () => {
    const updateData = {
      name: 'Updated Webhook',
      isActive: false,
    }

    const mockUpdatedWebhook = {
      id: 1,
      userId: 'user-123',
      ...updateData,
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.updateWebhook).mockResolvedValue(mockUpdatedWebhook as any)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUpdatedWebhook)
    expect(WebhookService.updateWebhook).toHaveBeenCalledWith(1, 'user-123', updateData)
  })

  it('should validate URL when provided', async () => {
    const updateData = {
      url: 'invalid-url',
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(400)
  })

  it('should return 404 when webhook not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.updateWebhook).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/webhooks/999', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when JSON is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'PUT',
      body: 'invalid json',
    })

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    })

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/webhooks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete webhook', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.deleteWebhook).mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Webhook deleted successfully' })
    expect(WebhookService.deleteWebhook).toHaveBeenCalledWith(1, 'user-123')
  })

  it('should return 404 when webhook not found', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.deleteWebhook).mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/webhooks/999', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })

    expect(response.status).toBe(404)
  })

  it('should return 400 when webhook ID is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks/invalid', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) })

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/webhooks/1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(401)
  })
})

