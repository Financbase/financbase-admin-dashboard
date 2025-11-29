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
import { GET, POST } from '@/app/api/invoices/route'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schemas/invoices.schema'
import { auth } from '@clerk/nextjs/server'
import { ApiErrorHandler } from '@/lib/api-error-handler'
import { withRLS } from '@/lib/api/with-rls'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

// Mock withRLS
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: vi.fn((callback) => {
    return callback('user-123')
  }),
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    badRequest: vi.fn((message: string, requestId?: string) =>
      new Response(JSON.stringify({ error: message }), { status: 400 })
    ),
    handle: vi.fn((error: Error, requestId?: string) =>
      new Response(JSON.stringify({ error: error.message }), { status: 500 })
    ),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}))

// Mock createSuccessResponse
vi.mock('@/lib/api/standard-response', () => ({
  createSuccessResponse: vi.fn((data, status, meta) => {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        ...meta,
      }),
      { status }
    )
  }),
}))

describe('Invoices API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/invoices', () => {
    it('should return paginated invoices for authenticated user', async () => {
      const mockInvoices = [
        { id: 'inv-1', invoiceNumber: 'INV-001', userId: 'user-123', total: '100.00' },
        { id: 'inv-2', invoiceNumber: 'INV-002', userId: 'user-123', total: '200.00' },
      ]

      const mockCount = [{ count: 2 }]

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockInvoices),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockCount),
          }),
        } as any)

      const request = new NextRequest('http://localhost:3000/api/invoices?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
    })

    it('should use default pagination values', async () => {
      const mockInvoices: any[] = []
      const mockCount = [{ count: 0 }]

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockInvoices),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockCount),
          }),
        } as any)

      const request = new NextRequest('http://localhost:3000/api/invoices')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(withRLS).toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/invoices')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(ApiErrorHandler.handle).toHaveBeenCalled()
    })
  })

  describe('POST /api/invoices', () => {
    it('should create invoice successfully', async () => {
      const invoiceData = {
        clientId: '123',
        clientName: 'Test Client',
        clientEmail: 'client@example.com',
        items: [
          { description: 'Service 1', quantity: 1, unitPrice: 100, total: 100 },
        ],
        subtotal: 100,
        total: 100,
        currency: 'USD',
      }

      const mockInvoice = {
        id: 'inv-123',
        invoiceNumber: 'INV-202501-0001',
        ...invoiceData,
        userId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInvoice]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.id).toBe('inv-123')
    })

    it('should validate client name and email are required', async () => {
      const invoiceData = {
        clientId: '123',
        // Missing clientName and clientEmail
        items: [{ description: 'Service 1', quantity: 1, unitPrice: 100, total: 100 }],
      }

      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith(
        'Client name and email are required',
        expect.any(String)
      )
      expect(db.insert).not.toHaveBeenCalled()
    })

    it('should validate at least one invoice item is required', async () => {
      const invoiceData = {
        clientId: '123',
        clientName: 'Test Client',
        clientEmail: 'client@example.com',
        items: [], // Empty items
      }

      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith(
        'At least one invoice item is required',
        expect.any(String)
      )
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith('Invalid JSON in request body', expect.any(String))
    })

    it('should generate invoice number if not provided', async () => {
      const invoiceData = {
        clientId: '123',
        clientName: 'Test Client',
        clientEmail: 'client@example.com',
        items: [{ description: 'Service 1', quantity: 1, unitPrice: 100, total: 100 }],
        // No invoiceNumber provided
      }

      const mockInvoice = {
        id: 'inv-123',
        invoiceNumber: expect.stringMatching(/^INV-\d+-[a-z0-9]+$/), // Generated number
        ...invoiceData,
        userId: 'user-123',
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInvoice]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should handle database errors', async () => {
      const invoiceData = {
        clientId: '123',
        clientName: 'Test Client',
        clientEmail: 'client@example.com',
        items: [{ description: 'Service 1', quantity: 1, unitPrice: 100, total: 100 }],
      }

      vi.mocked(db.insert).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(ApiErrorHandler.handle).toHaveBeenCalled()
    })
  })
})

