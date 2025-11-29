/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EmployeesService } from '@/lib/services/hr/employees-service'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { employees, departments } from '@/lib/db/schemas'
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

// Mock PayrollService
vi.mock('@/lib/services/hr/payroll-service', () => ({
  PayrollService: class {
    async getEmployeePayrollHistory(employeeId: string, limit: number) {
      return []
    }
  },
}))

// Mock LeaveService
vi.mock('@/lib/services/hr/leave-service', () => ({
  LeaveService: class {
    async getLeaveBalance(employeeId: string) {
      return { total: 20, used: 5, remaining: 15 }
    }
  },
}))

// Mock AttendanceService
vi.mock('@/lib/services/hr/attendance-service', () => ({
  AttendanceService: class {
    async getAttendanceStats(employeeId: string, organizationId?: string, startDate?: Date, endDate?: Date) {
      return { totalDays: 20, presentDays: 18, absentDays: 2 }
    }
  },
}))

describe('EmployeesService', () => {
  let service: EmployeesService
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
    service = new EmployeesService()
    mockDb = db as any
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all employees for user', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'emp-2',
          userId: 'user-123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'active',
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEmployees))

      const result = await service.getAll()

      expect(result).toHaveLength(2)
      expect(result[0].firstName).toBe('John')
    })

    it('should filter employees by search term', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEmployees))

      const result = await service.getAll({ search: 'John' })

      expect(result).toHaveLength(1)
    })

    it('should filter employees by department', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          userId: 'user-123',
          department: 'Engineering',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEmployees))

      const result = await service.getAll({ department: 'Engineering' })

      expect(result).toHaveLength(1)
    })

    it('should filter employees by status', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          userId: 'user-123',
          status: 'active',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEmployees))

      const result = await service.getAll({ status: 'active' })

      expect(result).toHaveLength(1)
    })
  })

  describe('getById', () => {
    it('should return employee by ID', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      const result = await service.getById('emp-1')

      expect(result).toBeDefined()
      expect(result.id).toBe('emp-1')
      expect(result.firstName).toBe('John')
    })

    it('should throw error if employee not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([]))

      await expect(service.getById('emp-999')).rejects.toThrow('Employee not found')
    })
  })

  describe('create', () => {
    it('should create a new employee', async () => {
      const input = {
        userId: 'user-123',
        organizationId: 'org-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Developer',
        department: 'Engineering',
        startDate: new Date('2025-01-01'),
      }

      const mockCreatedEmployee = {
        id: 'emp-1',
        ...input,
        status: 'active',
        timezone: 'UTC',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedEmployee]),
        }),
      })

      const result = await service.create(input)

      expect(result).toBeDefined()
      expect(result.firstName).toBe('John')
      expect(result.status).toBe('active')
    })

    it('should handle tags as JSON string', async () => {
      const input = {
        userId: 'user-123',
        organizationId: 'org-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Developer',
        department: 'Engineering',
        startDate: new Date(),
        tags: ['senior', 'fullstack'],
      }

      const mockCreatedEmployee = {
        id: 'emp-1',
        ...input,
        tags: JSON.stringify(input.tags),
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedEmployee]),
        }),
      })

      const result = await service.create(input)

      expect(result).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update employee successfully', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...mockEmployee,
                firstName: 'Jane',
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      })

      const result = await service.update({
        id: 'emp-1',
        firstName: 'Jane',
      })

      expect(result.firstName).toBe('Jane')
    })

    it('should throw error if employee not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([]))

      await expect(
        service.update({
          id: 'emp-999',
          firstName: 'Jane',
        })
      ).rejects.toThrow('Employee not found')
    })
  })

  describe('delete', () => {
    it('should delete employee successfully', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      })

      const result = await service.delete('emp-1')

      expect(result.success).toBe(true)
    })
  })

  describe('getByDepartment', () => {
    it('should return employees by department', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          userId: 'user-123',
          department: 'Engineering',
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockEmployees))

      const result = await service.getByDepartment('Engineering')

      expect(result).toHaveLength(1)
      expect(result[0].department).toBe('Engineering')
    })
  })

  describe('getPerformance', () => {
    it('should return employee performance data', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
        performance: 'excellent',
        performanceNotes: 'Great work',
        lastReviewDate: new Date('2025-01-01'),
        nextReviewDate: new Date('2025-07-01'),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      const result = await service.getPerformance('emp-1')

      expect(result.employee).toBeDefined()
      expect(result.performance).toBe('excellent')
      expect(result.performanceNotes).toBe('Great work')
    })
  })

  describe('getAnalytics', () => {
    it('should return employee analytics', async () => {
      const mockEmployees = [
        { id: 'emp-1', status: 'active' },
        { id: 'emp-2', status: 'active' },
        { id: 'emp-3', status: 'on_leave' },
        { id: 'emp-4', status: 'terminated' },
      ]

      const mockDepartmentStats = [
        { department: 'Engineering', count: 2 },
        { department: 'Sales', count: 1 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockEmployees),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue(mockDepartmentStats),
            }),
          }),
        })

      const result = await service.getAnalytics()

      expect(result.total).toBe(4)
      expect(result.active).toBe(2)
      expect(result.onLeave).toBe(1)
      expect(result.terminated).toBe(1)
      expect(result.departmentBreakdown).toBeDefined()
    })
  })

  describe('createDepartment', () => {
    it('should create a new department', async () => {
      const mockDepartment = {
        id: 'dept-1',
        organizationId: 'org-123',
        name: 'Engineering',
        description: 'Engineering department',
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockDepartment]),
        }),
      })

      const result = await service.createDepartment('org-123', 'Engineering', 'Engineering department')

      expect(result).toBeDefined()
      expect(result.name).toBe('Engineering')
    })
  })

  describe('getDepartments', () => {
    it('should return all departments for organization', async () => {
      const mockDepartments = [
        {
          id: 'dept-1',
          organizationId: 'org-123',
          name: 'Engineering',
          createdAt: new Date(),
        },
        {
          id: 'dept-2',
          organizationId: 'org-123',
          name: 'Sales',
          createdAt: new Date(),
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery(mockDepartments))

      const result = await service.getDepartments('org-123')

      expect(result).toHaveLength(2)
    })
  })

  describe('getPayrollSummary', () => {
    it('should return payroll summary for employee', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      const result = await service.getPayrollSummary('emp-1', 12)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getLeaveBalanceSummary', () => {
    it('should return leave balance summary', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      const result = await service.getLeaveBalanceSummary('emp-1')

      expect(result).toBeDefined()
      expect(result.total).toBe(20)
      expect(result.remaining).toBe(15)
    })
  })

  describe('getAttendanceSummary', () => {
    it('should return attendance summary', async () => {
      const mockEmployee = {
        id: 'emp-1',
        userId: 'user-123',
      }

      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)

      mockDb.select.mockReturnValue(createThenableQuery([mockEmployee]))

      const result = await service.getAttendanceSummary('emp-1', new Date('2025-01-01'), new Date('2025-01-31'))

      expect(result).toBeDefined()
      expect(result.totalDays).toBe(20)
      expect(result.presentDays).toBe(18)
    })
  })
})

