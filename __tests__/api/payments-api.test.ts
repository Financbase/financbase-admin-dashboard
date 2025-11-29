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
import { GET, POST } from '@/app/api/payments/route'
import { GET as GET_STATS } from '@/app/api/payments/stats/route'
import { PaymentService } from '@/lib/services/payment-service'
import { auth } from '@clerk/nextjs/server'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock payment service
vi.mock('@/lib/services/payment-service', () => ({
  PaymentService: {
    getPaginatedPayments: vi.fn(),
    processPayment: vi.fn(),
    getPaymentStats: vi.fn(),
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    validationError: vi.fn((error: any) => new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}))

describe('Payments API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/payments', () => {
    it('should return paginated payments for authenticated user', async () => {
      const mockPayments = {
        payments: [
          { id: 'pay-1', amount: '100.00', status: 'completed' },
          { id: 'pay-2', amount: '200.00', status: 'completed' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaginatedPayments).mockResolvedValue(mockPayments)

      const request = new NextRequest('http://localhost:3000/api/payments?page=1&limit=20')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.payments).toHaveLength(2)
      expect(data.total).toBe(2)
      expect(PaymentService.getPaginatedPayments).toHaveBeenCalledWith('user-123', {
        page: 1,
        limit: 20,
        search: undefined,
        status: undefined,
        paymentMethodId: undefined,
        startDate: undefined,
        endDate: undefined,
      })
    })

    it('should filter payments by status', async () => {
      const mockPayments = {
        payments: [{ id: 'pay-1', status: 'completed' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaginatedPayments).mockResolvedValue(mockPayments)

      const request = new NextRequest('http://localhost:3000/api/payments?status=completed')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(PaymentService.getPaginatedPayments).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ status: 'completed' })
      )
    })

    it('should filter payments by date range', async () => {
      const mockPayments = {
        payments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaginatedPayments).mockResolvedValue(mockPayments)

      const request = new NextRequest(
        'http://localhost:3000/api/payments?startDate=2025-01-01&endDate=2025-01-31'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(PaymentService.getPaginatedPayments).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
      )
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/payments')
      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(PaymentService.getPaginatedPayments).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaginatedPayments).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/payments')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(ApiErrorHandler.handle).toHaveBeenCalled()
    })
  })

  describe('POST /api/payments', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        paymentMethodId: 'pm-123',
        paymentType: 'invoice_payment',
        amount: 100.00,
        currency: 'USD',
        description: 'Payment for invoice',
      }

      const mockPayment = {
        id: 'pay-123',
        ...paymentData,
        userId: 'user-123',
        status: 'processing',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.processPayment).mockResolvedValue(mockPayment as any)

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.payment).toBeDefined()
      expect(data.payment.id).toBe('pay-123')
      expect(PaymentService.processPayment).toHaveBeenCalledWith({
        ...paymentData,
        userId: 'user-123',
      })
    })

    it('should validate required fields', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          amount: 100.00,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(PaymentService.processPayment).not.toHaveBeenCalled()
    })

    it('should validate amount is greater than 0', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          paymentMethodId: 'pm-123',
          paymentType: 'invoice_payment',
          amount: 0, // Invalid amount
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          paymentMethodId: 'pm-123',
          paymentType: 'invoice_payment',
          amount: 100.00,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should handle invalid JSON', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(ApiErrorHandler.badRequest).toHaveBeenCalledWith('Invalid JSON in request body')
    })

    it('should handle payment processing errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.processPayment).mockRejectedValue(new Error('Payment method not found'))

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          paymentMethodId: 'pm-123',
          paymentType: 'invoice_payment',
          amount: 100.00,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(ApiErrorHandler.handle).toHaveBeenCalled()
    })
  })

  describe('GET /api/payments/stats', () => {
    it('should return payment statistics', async () => {
      const mockStats = {
        totalPayments: 100,
        totalAmount: 50000,
        successfulPayments: 95,
        failedPayments: 5,
        averagePaymentAmount: 500,
        paymentMethodsCount: 3,
        recentPayments: [],
        paymentsByMethod: [],
        monthlyTrend: [],
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaymentStats).mockResolvedValue(mockStats as any)

      const response = await GET_STATS()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toBeDefined()
      expect(data.stats.totalPayments).toBe(100)
      expect(PaymentService.getPaymentStats).toHaveBeenCalledWith('user-123')
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const response = await GET_STATS()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
      expect(PaymentService.getPaymentStats).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
      vi.mocked(PaymentService.getPaymentStats).mockRejectedValue(new Error('Database error'))

      const response = await GET_STATS()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch payment stats')
    })
  })
})

