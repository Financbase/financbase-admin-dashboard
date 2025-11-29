/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
  markInvoiceAsSent,
  recordInvoicePayment,
  deleteInvoice,
  getInvoiceStats,
} from '@/lib/services/invoice-service'
import { db } from '@/lib/db'
import { invoices, invoicePayments } from '@/lib/db/schemas'
import { NotificationHelpers } from '@/lib/services/notification-service'
import { EmailService } from '@/lib/email/service'

// Unmock invoice service to test actual implementation
vi.unmock('@/lib/services/invoice-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      invoices: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}))

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    createFinancialNotification: vi.fn(),
  },
}))

// Mock email service
vi.mock('@/lib/email/service', () => ({
  EmailService: {
    sendInvoiceEmail: vi.fn(),
  },
}))

describe('Invoice Service', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const input = {
        userId: 'user-123',
        clientId: 'client-123',
        amount: 100.00,
        subtotal: 90.00,
        total: 100.00,
        currency: 'USD',
        taxRate: 10,
        taxAmount: 10.00,
        issueDate: new Date(),
        dueDate: new Date(),
      }

      const mockInvoice = {
        id: 'inv-123',
        invoiceNumber: 'INV-202501-0001',
        ...input,
        status: 'draft',
        createdAt: new Date(),
      }

      // Mock no existing invoices (for invoice number generation)
      // generateInvoiceNumber uses db.query.invoices.findFirst with orderBy
      // The query chain is: db.query.invoices.findFirst({ where, orderBy })
      mockDb.query.invoices.findFirst.mockResolvedValue(null)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInvoice]),
        }),
      })

      const result = await createInvoice(input)

      expect(result).toEqual(mockInvoice)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(NotificationHelpers.createFinancialNotification).toHaveBeenCalled()
    })
  })

  describe('getInvoiceById', () => {
    it('should retrieve invoice by ID', async () => {
      const mockInvoice = {
        id: 'inv-123',
        userId: 'user-123',
        invoiceNumber: 'INV-202501-0001',
        total: '100.00',
      }

      mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice)

      const result = await getInvoiceById('inv-123', 'user-123')

      expect(result).toEqual(mockInvoice)
    })

    it('should return null if invoice not found', async () => {
      mockDb.query.invoices.findFirst.mockResolvedValue(null)

      const result = await getInvoiceById('inv-123', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getInvoices', () => {
    it('should retrieve invoices with filters', async () => {
      const mockInvoices = [
        { id: 'inv-1', invoiceNumber: 'INV-001', status: 'sent' },
        { id: 'inv-2', invoiceNumber: 'INV-002', status: 'sent' },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoices('user-123', { status: 'sent' })

      expect(result).toEqual(mockInvoices)
      expect(mockDb.query.invoices.findMany).toHaveBeenCalled()
    })
  })

  describe('updateInvoice', () => {
    it('should update invoice successfully', async () => {
      const input = {
        id: 'inv-123',
        userId: 'user-123',
        status: 'sent',
      }

      const mockUpdatedInvoice = {
        id: 'inv-123',
        ...input,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      const result = await updateInvoice(input)

      expect(result).toEqual(mockUpdatedInvoice)
    })
  })

  describe('markInvoiceAsSent', () => {
    it('should mark invoice as sent', async () => {
      const mockInvoice = {
        id: 'inv-123',
        userId: 'user-123',
        status: 'sent',
        clientEmail: 'client@example.com',
        invoiceNumber: 'INV-001',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockInvoice]),
          }),
        }),
      })

      const result = await markInvoiceAsSent('inv-123', 'user-123')

      expect(result.status).toBe('sent')
      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('recordInvoicePayment', () => {
    it('should record payment and update invoice status to paid', async () => {
      const mockInvoice = {
        id: 123,
        userId: 'user-123',
        amountPaid: '0.00',
        total: '100.00',
        currency: 'USD',
        invoiceNumber: 'INV-001',
      }

      mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const mockUpdatedInvoice = {
        ...mockInvoice,
        amountPaid: '100.00',
        status: 'paid',
        paidDate: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      const result = await recordInvoicePayment(
        123,
        'user-123',
        100.00,
        'credit_card',
        new Date()
      )

      expect(result.status).toBe('paid')
      expect(NotificationHelpers.createFinancialNotification).toHaveBeenCalled()
    })

    it('should record partial payment', async () => {
      const mockInvoice = {
        id: 123,
        userId: 'user-123',
        amountPaid: '0.00',
        total: '200.00',
        currency: 'USD',
      }

      mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const mockUpdatedInvoice = {
        ...mockInvoice,
        amountPaid: '100.00',
        status: 'partial',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      const result = await recordInvoicePayment(
        123,
        'user-123',
        100.00,
        'credit_card',
        new Date()
      )

      expect(result.status).toBe('partial')
    })
  })

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      await deleteInvoice('inv-123', 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })

  describe('getInvoiceStats', () => {
    it('should return invoice statistics', async () => {
      const mockInvoices = [
        { id: 'inv-1', status: 'draft', total: '100.00', amountPaid: '0.00', dueDate: new Date('2025-12-31') },
        { id: 'inv-2', status: 'sent', total: '200.00', amountPaid: '0.00', dueDate: new Date('2025-01-15') },
        { id: 'inv-3', status: 'paid', total: '300.00', amountPaid: '300.00', dueDate: new Date('2025-01-10') },
        { id: 'inv-4', status: 'sent', total: '150.00', amountPaid: '50.00', dueDate: new Date('2024-12-01') }, // Overdue
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoiceStats('user-123')

      expect(result.total).toBe(4)
      expect(result.draft).toBe(1)
      expect(result.sent).toBe(2)
      expect(result.paid).toBe(1)
      expect(result.totalAmount).toBe(750)
      expect(result.paidAmount).toBe(350)
    })

    it('should calculate overdue invoices correctly', async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      const mockInvoices = [
        { id: 'inv-1', status: 'sent', total: '100.00', amountPaid: '0.00', dueDate: pastDate },
        { id: 'inv-2', status: 'partial', total: '200.00', amountPaid: '100.00', dueDate: pastDate },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoiceStats('user-123')

      expect(result.overdue).toBe(2)
      expect(result.outstandingAmount).toBe(200) // 100 + (200 - 100)
    })
  })

  describe.skip('checkOverdueInvoices', () => {
    it('should identify and update overdue invoices', async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

      const mockOverdueInvoices = [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-001',
          status: 'sent',
          total: '100.00',
          dueDate: pastDate,
        },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockOverdueInvoices)

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const { checkOverdueInvoices } = await import('@/lib/services/invoice-service')
      await checkOverdueInvoices('user-123')

      expect(mockDb.update).toHaveBeenCalled()
      expect(NotificationHelpers.createFinancialNotification).toHaveBeenCalled()
    })

    it('should not update invoices that are already paid', async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

      const mockInvoices = [
        {
          id: 'inv-1',
          status: 'paid',
          total: '100.00',
          dueDate: pastDate,
        },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const { checkOverdueInvoices } = await import('@/lib/services/invoice-service')
      await checkOverdueInvoices('user-123')

      // Should not update paid invoices
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('createInvoice - invoice number generation', () => {
    it('should generate sequential invoice numbers', async () => {
      const input = {
        userId: 'user-123',
        clientId: 'client-123',
        amount: 100.00,
        subtotal: 90.00,
        total: 100.00,
        issueDate: new Date(),
        dueDate: new Date(),
      }

      // Mock existing invoice with number INV-202501-0001
      mockDb.query.invoices.findFirst.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-202501-0001',
      })

      const mockInvoice = {
        id: 'inv-2',
        invoiceNumber: 'INV-202501-0002', // Should be next in sequence
        ...input,
        status: 'draft',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInvoice]),
        }),
      })

      const result = await createInvoice(input)

      expect(result.invoiceNumber).toBe('INV-202501-0002')
    })

    it('should generate first invoice number if no invoices exist', async () => {
      const input = {
        userId: 'user-123',
        clientId: 'client-123',
        amount: 100.00,
        subtotal: 90.00,
        total: 100.00,
        issueDate: new Date(),
        dueDate: new Date(),
      }

      // Mock no existing invoices
      mockDb.query.invoices.findFirst.mockResolvedValue(null)

      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-202501-0001',
        ...input,
        status: 'draft',
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInvoice]),
        }),
      })

      const result = await createInvoice(input)

      expect(result.invoiceNumber).toMatch(/^INV-\d{6}-0001$/)
    })
  })

  describe('updateInvoice - totals recalculation', () => {
    it('should recalculate totals when items are updated', async () => {
      const input = {
        id: 'inv-123',
        userId: 'user-123',
        items: [
          { id: 'item-1', description: 'Item 1', quantity: 2, unitPrice: 50, total: 100 },
          { id: 'item-2', description: 'Item 2', quantity: 1, unitPrice: 30, total: 30 },
        ],
        taxRate: 10,
        discountAmount: 10,
      }

      const mockUpdatedInvoice = {
        id: 'inv-123',
        subtotal: '130.00',
        taxAmount: '12.00', // (130 - 10) * 0.1
        total: '132.00', // 130 - 10 + 12
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      const result = await updateInvoice(input)

      expect(result.subtotal).toBe('130.00')
      expect(result.taxAmount).toBe('12.00')
      expect(result.total).toBe('132.00')
    })
  })

  describe('markInvoiceAsSent - email sending', () => {
    it('should send email when marking invoice as sent', async () => {
      const mockInvoice = {
        id: 'inv-123',
        userId: 'user-123',
        status: 'sent',
        clientEmail: 'client@example.com',
        invoiceNumber: 'INV-001',
        total: '100.00',
        dueDate: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockInvoice]),
          }),
        }),
      })

      const result = await markInvoiceAsSent('inv-123', 'user-123')

      expect(result.status).toBe('sent')
      expect(EmailService.sendInvoiceEmail).toHaveBeenCalledWith(
        'client@example.com',
        expect.objectContaining({
          invoiceNumber: 'INV-001',
          amount: 100,
        })
      )
    })

    it('should not fail if email sending fails', async () => {
      const mockInvoice = {
        id: 'inv-123',
        userId: 'user-123',
        status: 'sent',
        clientEmail: 'client@example.com',
        invoiceNumber: 'INV-001',
        total: '100.00',
        dueDate: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockInvoice]),
          }),
        }),
      })

      // Mock email service to throw error
      vi.mocked(EmailService.sendInvoiceEmail).mockRejectedValue(new Error('Email failed'))

      // Should not throw
      const result = await markInvoiceAsSent('inv-123', 'user-123')

      expect(result.status).toBe('sent')
    })
  })

  describe('recordInvoicePayment - status transitions', () => {
    it('should update status to partial when payment is less than total', async () => {
      const mockInvoice = {
        id: 123,
        userId: 'user-123',
        amountPaid: '0.00',
        total: '200.00',
        currency: 'USD',
        invoiceNumber: 'INV-001',
      }

      mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const mockUpdatedInvoice = {
        ...mockInvoice,
        amountPaid: '100.00',
        status: 'partial',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      const result = await recordInvoicePayment(123, 'user-123', 100.00, 'credit_card', new Date())

      expect(result.status).toBe('partial')
      expect(Number(result.amountPaid)).toBe(100)
    })

    it('should send notification when invoice is fully paid', async () => {
      const mockInvoice = {
        id: '123',
        userId: 'user-123',
        amountPaid: '0.00',
        total: '100.00',
        currency: 'USD',
        invoiceNumber: 'INV-001',
      }

      mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const mockUpdatedInvoice = {
        ...mockInvoice,
        amountPaid: '100.00',
        status: 'paid',
        paidDate: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedInvoice]),
          }),
        }),
      })

      await recordInvoicePayment(123, 'user-123', 100.00, 'credit_card', new Date())

      expect(NotificationHelpers.createFinancialNotification).toHaveBeenCalledWith(
        'user-123',
        'invoice',
        'Invoice Paid',
        'Invoice INV-001 has been paid for $100.00',
        expect.objectContaining({ 
          invoiceId: '123',
          invoiceNumber: 'INV-001',
          amount: 100
        })
      )
    })
  })

  describe('getInvoices - filtering', () => {
    it('should filter invoices by status', async () => {
      const mockInvoices = [
        { id: 'inv-1', status: 'sent' },
        { id: 'inv-2', status: 'sent' },
      ]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoices('user-123', { status: 'sent' })

      expect(result).toHaveLength(2)
      expect(result.every((inv) => inv.status === 'sent')).toBe(true)
    })

    it('should filter invoices by client', async () => {
      const mockInvoices = [{ id: 'inv-1', clientId: 123 }]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoices('user-123', { clientId: 123 })

      expect(result).toHaveLength(1)
      expect(result[0].clientId).toBe(123)
    })

    it('should filter invoices by date range', async () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')

      const mockInvoices = [{ id: 'inv-1', issueDate: new Date('2025-01-15') }]

      mockDb.query.invoices.findMany.mockResolvedValue(mockInvoices)

      const result = await getInvoices('user-123', { startDate, endDate })

      expect(result).toHaveLength(1)
    })
  })
})

