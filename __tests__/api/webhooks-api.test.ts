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
import { GET, POST } from '@/app/api/webhooks/route'
import { WebhookService } from '@/lib/services/webhook-service'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/webhook-service', () => ({
  WebhookService: {
    getWebhooks: vi.fn(),
    createWebhook: vi.fn(),
  },
}))

vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'req-123'),
}))

describe('GET /api/webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return webhooks for authenticated user', async () => {
    const mockWebhooks = [
      {
        id: 1,
        userId: 'user-123',
        name: 'Invoice Webhook',
        url: 'https://example.com/webhook',
        events: ['invoice.created'],
        isActive: true,
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhooks).mockResolvedValue(mockWebhooks as any)

    const request = new NextRequest('http://localhost/api/webhooks')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockWebhooks)
    expect(WebhookService.getWebhooks).toHaveBeenCalledWith('user-123', {
      limit: 50,
      offset: 0,
    })
  })

  it('should filter webhooks by status', async () => {
    const mockWebhooks = [
      {
        id: 1,
        userId: 'user-123',
        name: 'Active Webhook',
        isActive: true,
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhooks).mockResolvedValue(mockWebhooks as any)

    const request = new NextRequest('http://localhost/api/webhooks?status=active')
    const response = await GET(request)

    expect(WebhookService.getWebhooks).toHaveBeenCalledWith('user-123', {
      isActive: true,
      limit: 50,
      offset: 0,
    })
  })

  it('should search webhooks', async () => {
    const mockWebhooks = [
      {
        id: 1,
        userId: 'user-123',
        name: 'Invoice Webhook',
        url: 'https://example.com/webhook',
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhooks).mockResolvedValue(mockWebhooks as any)

    const request = new NextRequest('http://localhost/api/webhooks?search=Invoice')
    const response = await GET(request)

    expect(WebhookService.getWebhooks).toHaveBeenCalledWith('user-123', {
      search: 'Invoice',
      limit: 50,
      offset: 0,
    })
  })

  it('should paginate webhooks', async () => {
    const mockWebhooks = [
      {
        id: 1,
        userId: 'user-123',
        name: 'Webhook 1',
      },
    ]

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.getWebhooks).mockResolvedValue(mockWebhooks as any)

    const request = new NextRequest('http://localhost/api/webhooks?limit=10&offset=20')
    const response = await GET(request)

    expect(WebhookService.getWebhooks).toHaveBeenCalledWith('user-123', {
      limit: 10,
      offset: 20,
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/webhooks')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('POST /api/webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new webhook', async () => {
    const webhookData = {
      name: 'Invoice Webhook',
      url: 'https://example.com/webhook',
      events: ['invoice.created', 'invoice.paid'],
    }

    const mockWebhook = {
      id: 1,
      userId: 'user-123',
      ...webhookData,
      secret: 'generated-secret',
      isActive: true,
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.createWebhook).mockResolvedValue(mockWebhook as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(mockWebhook)
    expect(WebhookService.createWebhook).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining(webhookData)
    )
  })

  it('should return 400 when required fields are missing', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify({ name: 'Webhook' }), // Missing url and events
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when events array is empty', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Webhook',
        url: 'https://example.com/webhook',
        events: [],
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when URL is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Webhook',
        url: 'invalid-url',
        events: ['invoice.created'],
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 when JSON is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Webhook',
        url: 'https://example.com/webhook',
        events: ['invoice.created'],
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should handle optional fields', async () => {
    const webhookData = {
      name: 'Invoice Webhook',
      url: 'https://example.com/webhook',
      events: ['invoice.created'],
      description: 'Test description',
      organizationId: 'org-1',
      retryPolicy: {
        maxRetries: 5,
        retryDelay: 2000,
        backoffMultiplier: 2,
      },
      headers: { 'X-Custom-Header': 'value' },
      timeout: 60000,
    }

    const mockWebhook = {
      id: 1,
      userId: 'user-123',
      ...webhookData,
      isActive: true,
    }

    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(WebhookService.createWebhook).mockResolvedValue(mockWebhook as any)

    const request = new NextRequest('http://localhost/api/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(WebhookService.createWebhook).toHaveBeenCalled()
  })
})

