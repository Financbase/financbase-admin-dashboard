/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PayrollService } from '@/lib/services/hr/payroll-service'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { payrollRuns, payrollEntries, employees, hrContractors } from '@/lib/db/schemas'
import { sql } from 'drizzle-orm'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('PayrollService', () => {
  let service: PayrollService
  let mockDb: any

  // Helper to create a thenable query builder with all methods
  const createThenableQuery = (result: any[] = []) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
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
    service = new PayrollService()
    mockDb = db as any
    vi.clearAllMocks()
  })

  describe('createPayrollRun', () => {
    it('should create a new payroll run', async () => {
      const input = {
        organizationId: 'org-123',
        payPeriodStart: new Date('2025-01-01'),
        payPeriodEnd: new Date('2025-01-15'),
        payDate: new Date('2025-01-20'),
        payFrequency: 'biweekly' as const,
        notes: 'Test payroll run',
      }

      const mockCreatedRun = {
        id: 'run-123',
        ...input,
        status: 'draft',
        createdBy: 'user-123',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedRun]),
        }),
      })

      const result = await service.createPayrollRun(input)

      expect(result).toBeDefined()
      expect(result.status).toBe('draft')
      expect(result.createdBy).toBe('user-123')
    })

    it('should throw error if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      await expect(
        service.createPayrollRun({
          organizationId: 'org-123',
          payPeriodStart: new Date(),
          payPeriodEnd: new Date(),
          payDate: new Date(),
          payFrequency: 'monthly',
        })
      ).rejects.toThrow('Unauthorized')
    })
  })

  describe('getPayrollRun', () => {
    it('should return payroll run by ID', async () => {
      const mockRun = {
        id: 'run-123',
        organizationId: 'org-123',
        status: 'draft',
        payPeriodStart: new Date('2025-01-01'),
        payPeriodEnd: new Date('2025-01-15'),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockRun]))

      const result = await service.getPayrollRun('run-123')

      expect(result).toBeDefined()
      expect(result.id).toBe('run-123')
    })

    it('should throw error if payroll run not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([]))

      await expect(service.getPayrollRun('run-999')).rejects.toThrow('Payroll run not found')
    })
  })

  describe('getPayrollRuns', () => {
    it('should return all payroll runs', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          organizationId: 'org-123',
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: 'run-2',
          organizationId: 'org-123',
          status: 'draft',
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockRuns))

      const result = await service.getPayrollRuns()

      expect(result).toHaveLength(2)
    })

    it('should filter payroll runs by organization', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          organizationId: 'org-123',
          status: 'completed',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockRuns))

      const result = await service.getPayrollRuns('org-123')

      expect(result).toHaveLength(1)
    })

    it('should filter payroll runs by status', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          organizationId: 'org-123',
          status: 'completed',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockRuns))

      const result = await service.getPayrollRuns('org-123', { status: 'completed' })

      expect(result).toHaveLength(1)
    })
  })

  describe('processPayrollRun', () => {
    it('should process payroll for all active employees', async () => {
      const mockPayrollRun = {
        id: 'run-123',
        organizationId: 'org-123',
        status: 'draft',
        payPeriodStart: new Date('2025-01-01'),
        payPeriodEnd: new Date('2025-01-15'),
      }

      const mockEmployees = [
        {
          id: 'emp-1',
          organizationId: 'org-123',
          status: 'active',
          isPayrollEnabled: true,
        },
        {
          id: 'emp-2',
          organizationId: 'org-123',
          status: 'active',
          isPayrollEnabled: true,
        },
      ]

      const mockPayrollEntry = {
        id: 'entry-1',
        payrollRunId: 'run-123',
        employeeId: 'emp-1',
        grossPay: '5000.00',
        totalDeductions: '500.00',
        totalTaxes: '750.00',
        netPay: '3750.00',
        status: 'calculated',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      // Mock getPayrollRun
      mockDb.select
        .mockReturnValueOnce(createThenableQuery([mockPayrollRun]))
        .mockReturnValueOnce(createThenableQuery(mockEmployees))

      // Mock SQL functions - sql is a function, not a mockable object
      // The actual service uses sql template literals which are handled by drizzle

      // Mock update for status change
      mockDb.update
        .mockReturnValueOnce({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        })
        .mockReturnValueOnce({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        })

      // Mock insert for payroll entries
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockPayrollEntry]),
        }),
      })

      const result = await service.processPayrollRun({
        payrollRunId: 'run-123',
      })

      expect(result).toBeDefined()
      expect(result.totalEmployees).toBeGreaterThan(0)
    })

    it('should process payroll for specific employees', async () => {
      const mockPayrollRun = {
        id: 'run-123',
        organizationId: 'org-123',
        payPeriodStart: new Date('2025-01-01'),
        payPeriodEnd: new Date('2025-01-15'),
      }

      const mockPayrollEntry = {
        id: 'entry-1',
        payrollRunId: 'run-123',
        employeeId: 'emp-1',
        grossPay: '5000.00',
        netPay: '3750.00',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockPayrollRun]))

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockPayrollEntry]),
        }),
      })

      const result = await service.processPayrollRun({
        payrollRunId: 'run-123',
        employeeIds: ['emp-1'],
      })

      expect(result).toBeDefined()
    })

    it('should handle errors and update status to error', async () => {
      const mockPayrollRun = {
        id: 'run-123',
        organizationId: 'org-123',
        payPeriodStart: new Date('2025-01-01'),
        payPeriodEnd: new Date('2025-01-15'),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      // Create an error query that rejects when awaited
      const errorQuery: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
      }
      const errorPromise = Promise.reject(new Error('Database error'))
      errorQuery.then = vi.fn((onResolve, onReject) => {
        if (onReject) {
          return errorPromise.catch(onReject)
        }
        return errorPromise
      })
      errorQuery.catch = vi.fn((onReject) => errorPromise.catch(onReject))
      Object.defineProperty(errorQuery, Symbol.toStringTag, { value: 'Promise' })
      
      // The error happens on the second select call (for employees)
      mockDb.select
        .mockReturnValueOnce(createThenableQuery([mockPayrollRun]))
        .mockReturnValueOnce(errorQuery)

      mockDb.update
        .mockReturnValueOnce({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        })
        .mockReturnValueOnce({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        })

      await expect(
        service.processPayrollRun({
          payrollRunId: 'run-123',
        })
      ).rejects.toThrow()

      // Verify error status update was called
      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('getPayrollEntries', () => {
    it('should return payroll entries for a run', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          payrollRunId: 'run-123',
          employeeId: 'emp-1',
          grossPay: '5000.00',
          netPay: '3750.00',
          createdAt: new Date(),
        },
        {
          id: 'entry-2',
          payrollRunId: 'run-123',
          employeeId: 'emp-2',
          grossPay: '6000.00',
          netPay: '4500.00',
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEntries))

      const result = await service.getPayrollEntries('run-123')

      expect(result).toHaveLength(2)
    })
  })

  describe('getEmployeePayrollHistory', () => {
    it('should return employee payroll history', async () => {
      const mockHistory = [
        {
          id: 'entry-1',
          employeeId: 'emp-1',
          payPeriodEnd: new Date('2025-01-15'),
          grossPay: '5000.00',
        },
        {
          id: 'entry-2',
          employeeId: 'emp-1',
          payPeriodEnd: new Date('2025-01-01'),
          grossPay: '5000.00',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockHistory),
            }),
          }),
        }),
      })

      const result = await service.getEmployeePayrollHistory('emp-1', 12)

      expect(result).toHaveLength(2)
    })
  })

  describe('getContractorPayrollHistory', () => {
    it('should return contractor payroll history', async () => {
      const mockHistory = [
        {
          id: 'entry-1',
          contractorId: 'contractor-1',
          payPeriodEnd: new Date('2025-01-15'),
          grossPay: '3000.00',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockHistory),
            }),
          }),
        }),
      })

      const result = await service.getContractorPayrollHistory('contractor-1', 12)

      expect(result).toHaveLength(1)
    })
  })

  describe('configureTaxes', () => {
    it('should configure tax settings', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const result = await service.configureTaxes('org-123', {
        federalRate: 0.15,
        stateRate: 0.05,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Tax configuration')
    })
  })

  describe('configureDeductions', () => {
    it('should configure deduction settings', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const result = await service.configureDeductions('org-123', {
        healthInsurance: 200,
        retirement: 500,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Deduction configuration')
    })
  })

  describe('configureBenefits', () => {
    it('should configure benefit settings', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      const result = await service.configureBenefits('org-123', {
        healthInsurance: true,
        retirement: true,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Benefit configuration')
    })
  })

  describe('exportPayroll', () => {
    it('should export payroll data as CSV', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          employeeId: 'emp-1',
          grossPay: '5000.00',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEntries))

      const result = await service.exportPayroll('run-123', 'csv')

      expect(result.format).toBe('csv')
      expect(result.data).toBeDefined()
      expect(result.downloadUrl).toContain('.csv')
    })

    it('should export payroll data as Excel', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          employeeId: 'emp-1',
          grossPay: '5000.00',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEntries))

      const result = await service.exportPayroll('run-123', 'excel')

      expect(result.format).toBe('excel')
      expect(result.downloadUrl).toContain('.excel')
    })
  })

  describe('generatePayStub', () => {
    it('should generate pay stub for entry', async () => {
      const mockEntry = {
        id: 'entry-1',
        employeeId: 'emp-1',
        grossPay: '5000.00',
        netPay: '3750.00',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEntry]))

      const result = await service.generatePayStub('entry-1')

      expect(result.entry).toBeDefined()
      expect(result.pdfUrl).toContain('.pdf')
    })

    it('should throw error if entry not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([]))

      await expect(service.generatePayStub('entry-999')).rejects.toThrow('Payroll entry not found')
    })
  })
})

