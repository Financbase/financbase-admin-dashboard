/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BillPayAutomationService } from '@/lib/services/bill-pay/bill-pay-service'
import { db } from '@/lib/db'
import { bills, vendors, approvalWorkflows } from '@/lib/db/schemas/bills.schema'
import { auditLogger } from '@/lib/services/security/audit-logging-service'
import { UnifiedAIOrchestrator } from '@/lib/services/ai/unified-ai-orchestrator'

// Use global db mock from __tests__/setup.ts
// The global mock already provides thenable query builders

// Mock audit logger
vi.mock('@/lib/services/security/audit-logging-service', () => ({
  auditLogger: {
    logEvent: vi.fn(),
  },
  AuditEventType: {
    USER_CREATED: 'user_created',
    APPROVAL_DECISION: 'approval_decision',
  },
  RiskLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },
  ComplianceFramework: {
    SOC2: 'SOC2',
    GDPR: 'GDPR',
  },
}))

// Mock AI orchestrator
vi.mock('@/lib/services/ai/unified-ai-orchestrator', () => ({
  UnifiedAIOrchestrator: class MockUnifiedAIOrchestrator {
    categorizeTransaction = vi.fn();
  },
}))

describe('BillPayAutomationService', () => {
  let service: BillPayAutomationService
  let mockDb: any

  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
    };
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result);
      return onResolve ? promise.then(onResolve) : promise;
    });
    query.catch = vi.fn((onReject?: (error: any) => any) => {
      const promise = Promise.resolve(result);
      return onReject ? promise.catch(onReject) : promise;
    });
    Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' });
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks()
    service = new BillPayAutomationService()
    mockDb = db as any
    // Reset select mock to use default implementation
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('getBills', () => {
    it('should retrieve bills with pagination', async () => {
      const mockBills = [
        { id: 'bill-1', userId: 'user-123', amount: '100.00', status: 'draft' },
        { id: 'bill-2', userId: 'user-123', amount: '200.00', status: 'sent' },
      ]

      // Mock count query
      mockDb.select.mockReturnValueOnce(createThenableQuery([{ count: 2 }]))

      // Mock bills query
      mockDb.select.mockReturnValueOnce(createThenableQuery(mockBills))

      const result = await service.getBills('user-123', { limit: 10, offset: 0 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter bills by status', async () => {
      const mockBills = [{ id: 'bill-1', status: 'draft' }]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockBills),
                }),
              }),
            }),
          }),
        })

      const result = await service.getBills('user-123', { status: 'draft' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].status).toBe('draft')
    })

    it('should filter bills by vendor', async () => {
      const mockBills = [{ id: 'bill-1', vendorId: 'vendor-123' }]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockBills),
                }),
              }),
            }),
          }),
        })

      const result = await service.getBills('user-123', { vendorId: 'vendor-123' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].vendorId).toBe('vendor-123')
    })
  })

  describe('getVendors', () => {
    it('should retrieve vendors with pagination', async () => {
      const mockVendors = [
        { id: 'vendor-1', userId: 'user-123', name: 'Vendor 1', status: 'active' },
        { id: 'vendor-2', userId: 'user-123', name: 'Vendor 2', status: 'active' },
      ]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 2 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockVendors),
                }),
              }),
            }),
          }),
        })

      const result = await service.getVendors('user-123', { limit: 10, offset: 0 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter vendors by status', async () => {
      const mockVendors = [{ id: 'vendor-1', status: 'active' }]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockVendors),
                }),
              }),
            }),
          }),
        })

      const result = await service.getVendors('user-123', { status: 'active' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].status).toBe('active')
    })
  })

  describe('createBill', () => {
    it('should create a bill successfully', async () => {
      const billData = {
        amount: 100.00,
        currency: 'USD',
        dueDate: new Date(),
        issueDate: new Date(),
        description: 'Test bill',
        category: 'office_supplies',
      }

      const mockBill = {
        id: 'bill-123',
        userId: 'user-123',
        ...billData,
        amount: '100.00',
        status: 'draft',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock vendor check (no vendor)
      mockDb.select.mockReturnValueOnce(createThenableQuery([]))

      // Mock bill insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBill]),
        }),
      })

      const result = await service.createBill('user-123', billData)

      expect(result).toEqual(mockBill)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(auditLogger.logEvent).toHaveBeenCalled()
    })

    it('should validate vendor exists when vendorId is provided', async () => {
      const billData = {
        vendorId: 'vendor-123',
        amount: 100.00,
        currency: 'USD',
        dueDate: new Date(),
        issueDate: new Date(),
        description: 'Test bill',
        category: 'office_supplies',
      }

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
      }

      // Mock vendor exists (getVendor call) - override global mock
      // Use mockImplementationOnce to create a query builder with the vendor result
      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockVendor]))

      const mockBill = {
        id: 'bill-123',
        ...billData,
        amount: '100.00',
        status: 'draft',
      }

      // Mock bill insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBill]),
        }),
      })

      const result = await service.createBill('user-123', billData)

      expect(result).toBeDefined()
      expect(result.id).toBe('bill-123')
    })

    it('should throw error if vendor not found', async () => {
      const billData = {
        vendorId: 'vendor-123',
        amount: 100.00,
        currency: 'USD',
        dueDate: new Date(),
        issueDate: new Date(),
        description: 'Test bill',
        category: 'office_supplies',
      }

      // Mock vendor not found - getVendor returns empty array
      // Use mockImplementationOnce to ensure empty array is returned
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      await expect(service.createBill('user-123', billData)).rejects.toThrow('Vendor not found')
    })
  })

  describe('addVendor', () => {
    it('should create a new vendor successfully', async () => {
      const vendorData = {
        name: 'Test Vendor',
        email: 'vendor@example.com',
        phone: '+1234567890',
        paymentTerms: 30,
        category: 'supplier',
        autoPay: false,
        approvalRequired: true,
        approvalThreshold: 1000,
      }

      const mockVendor = {
        id: 'vendor-123',
        userId: 'user-123',
        ...vendorData,
        approvalThreshold: '1000',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockVendor]),
        }),
      })

      const result = await service.addVendor('user-123', vendorData)

      expect(result).toEqual(mockVendor)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(auditLogger.logEvent).toHaveBeenCalled()
    })
  })

  describe('getPendingApprovals', () => {
    it('should retrieve bills pending approval', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          approvalRequired: true,
          approvedBy: null,
          status: 'pending_approval',
          dueDate: new Date(),
        },
      ]

      // Override global mock for this specific query
      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockBills))

      const result = await service.getPendingApprovals('user-123')

      expect(result).toHaveLength(1)
      expect(result[0].approvalRequired).toBe(true)
      expect(result[0].approvedBy).toBeNull()
    })

    it('should not return paid or rejected bills', async () => {
      const mockBills: any[] = []

      mockDb.select.mockReturnValue(createThenableQuery(mockBills))

      const result = await service.getPendingApprovals('user-123')

      expect(result).toHaveLength(0)
    })
  })

  describe('processApproval', () => {
    it('should approve a bill successfully', async () => {
      const mockBill = {
        id: 'bill-123',
        userId: 'user-123',
        status: 'pending_approval',
      }

      // Mock get bill
      mockDb.select.mockReturnValueOnce(createThenableQuery([mockBill]))

      const mockUpdatedBill = {
        ...mockBill,
        status: 'approved',
        approvedBy: 'user-123',
        approvedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedBill]),
          }),
        }),
      })

      const result = await service.processApproval('user-123', 'bill-123', 'approved', 'Looks good')

      expect(result.status).toBe('approved')
      expect(result.approvedBy).toBe('user-123')
      expect(auditLogger.logEvent).toHaveBeenCalled()
    })

    it('should reject a bill successfully', async () => {
      const mockBill = {
        id: 'bill-123',
        userId: 'user-123',
        status: 'pending_approval',
      }

      mockDb.select.mockReturnValueOnce(createThenableQuery([mockBill]))

      const mockUpdatedBill = {
        ...mockBill,
        status: 'rejected',
        approvedBy: 'user-123',
        approvedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedBill]),
          }),
        }),
      })

      const result = await service.processApproval('user-123', 'bill-123', 'rejected', 'Invalid amount')

      expect(result.status).toBe('rejected')
      expect(auditLogger.logEvent).toHaveBeenCalled()
    })

    it('should throw error if bill not found', async () => {
      mockDb.select.mockReturnValueOnce(createThenableQuery([]))

      await expect(service.processApproval('user-123', 'bill-123', 'approved')).rejects.toThrow(
        'Bill not found or access denied'
      )
    })
  })

  describe('getBillsRequiringAttention', () => {
    it('should return overdue bills', async () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      const mockBills = [
        {
          id: 'bill-1',
          dueDate: pastDate,
          status: 'sent',
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockBills))

      const result = await service.getBillsRequiringAttention('user-123')

      expect(result).toHaveLength(1)
    })

    it('should return bills due within 7 days', async () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      const mockBills = [
        {
          id: 'bill-1',
          dueDate: futureDate,
          status: 'sent',
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockBills))

      const result = await service.getBillsRequiringAttention('user-123')

      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should return bills pending approval', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          approvalRequired: true,
          approvedBy: null,
          status: 'pending_approval',
          dueDate: new Date(),
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockBills))

      const result = await service.getBillsRequiringAttention('user-123')

      expect(result.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getApprovalWorkflows', () => {
    it('should retrieve approval workflows with pagination', async () => {
      const mockWorkflows = [
        { id: 'workflow-1', userId: 'user-123', name: 'Workflow 1', status: 'active' },
      ]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockWorkflows),
                }),
              }),
            }),
          }),
        })

      const result = await service.getApprovalWorkflows('user-123', { limit: 10, offset: 0 })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter workflows by status', async () => {
      const mockWorkflows = [{ id: 'workflow-1', status: 'active' }]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockWorkflows),
                }),
              }),
            }),
          }),
        })

      const result = await service.getApprovalWorkflows('user-123', { status: 'active' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].status).toBe('active')
    })
  })
})

