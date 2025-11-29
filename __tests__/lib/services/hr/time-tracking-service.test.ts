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
  startTimeEntry,
  stopTimeEntry,
  getRunningTimeEntry,
  getTimeEntryById,
  listTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getBillableStats,
  getUnbilledTimeEntries,
  markTimeEntriesAsBilled,
  getContractorBillableHours,
} from '@/lib/services/hr/time-tracking-service'
import { getDbOrThrow } from '@/lib/db'
import { sql } from 'drizzle-orm'

// Mock database
vi.mock('@/lib/db', () => ({
  getDbOrThrow: vi.fn(),
}))

// Mock schema to re-export from schemas directory
// The service imports from @/lib/db/schema but the actual file is in schemas/
vi.mock('@/lib/db/schema', async () => {
  const schemas = await vi.importActual('@/lib/db/schemas')
  return schemas
})

describe('Time Tracking Service', () => {
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
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      execute: vi.fn(),
    }
    vi.mocked(getDbOrThrow).mockReturnValue(mockDb)
    vi.clearAllMocks()
    // Set default thenable query for select
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('startTimeEntry', () => {
    it('should start a new time entry', async () => {
      const input = {
        userId: 'user-123',
        description: 'Working on feature',
        projectId: 'project-1',
        isBillable: true,
      }

      const mockEntry = {
        id: 'entry-1',
        ...input,
        startTime: new Date(),
        endTime: null,
        duration: null,
        status: 'running',
        createdAt: new Date(),
      }

      // Mock check for running entry - none found
      mockDb.select.mockReturnValueOnce(createThenableQuery([]))

      // Mock insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEntry]),
        }),
      })

      const result = await startTimeEntry(input)

      expect(result).toBeDefined()
      expect(result.description).toBe('Working on feature')
      expect(result.endTime).toBeNull()
    })

    it('should throw error if timer already running', async () => {
      const input = {
        userId: 'user-123',
        description: 'Working on feature',
      }

      const mockRunningEntry = {
        id: 'entry-1',
        userId: 'user-123',
        endTime: null,
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockRunningEntry]))

      await expect(startTimeEntry(input)).rejects.toThrow('already have a timer running')
    })
  })

  describe('stopTimeEntry', () => {
    it('should stop a running time entry', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId: 'user-123',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: null,
        hourlyRate: '100.00',
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockEntry]))

      const mockUpdatedEntry = {
        ...mockEntry,
        endTime: new Date(),
        duration: 3600, // 1 hour in seconds
        amount: '100.00',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedEntry]),
          }),
        }),
      })

      const result = await stopTimeEntry('entry-1', 'user-123')

      expect(result).toBeDefined()
      expect(result?.endTime).toBeDefined()
      expect(result?.duration).toBe(3600)
      expect(result?.amount).toBe('100.00')
    })

    it('should calculate amount based on hourly rate', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId: 'user-123',
        startTime: new Date(Date.now() - 7200000), // 2 hours ago
        endTime: null,
        hourlyRate: '50.00',
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockEntry]))

      const mockUpdatedEntry = {
        ...mockEntry,
        endTime: new Date(),
        duration: 7200, // 2 hours
        amount: '100.00',
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedEntry]),
          }),
        }),
      })

      const result = await stopTimeEntry('entry-1', 'user-123')

      expect(result?.amount).toBe('100.00')
    })

    it('should return null if entry not found', async () => {
      mockDb.select.mockReturnValue(createThenableQuery([]))

      const result = await stopTimeEntry('entry-999', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getRunningTimeEntry', () => {
    it('should return running time entry for user', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId: 'user-123',
        endTime: null,
        startTime: new Date(),
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockEntry]))

      const result = await getRunningTimeEntry('user-123')

      expect(result).toBeDefined()
      expect(result?.id).toBe('entry-1')
    })

    it('should return null if no running entry', async () => {
      mockDb.select.mockReturnValue(createThenableQuery([]))

      const result = await getRunningTimeEntry('user-123')

      expect(result).toBeNull()
    })
  })

  describe('getTimeEntryById', () => {
    it('should return time entry by ID', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId: 'user-123',
        description: 'Working on feature',
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockEntry]))

      const result = await getTimeEntryById('entry-1', 'user-123')

      expect(result).toBeDefined()
      expect(result?.id).toBe('entry-1')
    })

    it('should return null if entry not found', async () => {
      mockDb.select.mockReturnValue(createThenableQuery([]))

      const result = await getTimeEntryById('entry-999', 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('listTimeEntries', () => {
    it('should return paginated time entries', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          description: 'Entry 1',
          startTime: new Date(),
        },
        {
          id: 'entry-2',
          userId: 'user-123',
          description: 'Entry 2',
          startTime: new Date(),
        },
      ]

      mockDb.select
        .mockReturnValueOnce(createThenableQuery(mockEntries))
        .mockReturnValueOnce(createThenableQuery([{ count: 2 }]))

      const result = await listTimeEntries({
        userId: 'user-123',
        page: 1,
        limit: 20,
      })

      expect(result.entries).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter entries by employee', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          employeeId: 'emp-1',
        },
      ]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockEntries),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })

      const result = await listTimeEntries({
        userId: 'user-123',
        employeeId: 'emp-1',
      })

      expect(result.entries).toHaveLength(1)
    })

    it('should filter entries by date range', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          startTime: new Date('2025-01-15'),
        },
      ]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockEntries),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })

      const result = await listTimeEntries({
        userId: 'user-123',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      })

      expect(result.entries).toHaveLength(1)
    })

    it('should filter entries by billable status', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          isBillable: true,
        },
      ]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(mockEntries),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        })

      const result = await listTimeEntries({
        userId: 'user-123',
        isBillable: true,
      })

      expect(result.entries).toHaveLength(1)
    })
  })

  describe('updateTimeEntry', () => {
    it('should update time entry successfully', async () => {
      const mockUpdatedEntry = {
        id: 'entry-1',
        userId: 'user-123',
        description: 'Updated description',
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedEntry]),
          }),
        }),
      })

      const result = await updateTimeEntry('entry-1', 'user-123', {
        description: 'Updated description',
      })

      expect(result).toBeDefined()
      expect(result?.description).toBe('Updated description')
    })

    it('should return null if entry not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await updateTimeEntry('entry-999', 'user-123', {
        description: 'Updated',
      })

      expect(result).toBeNull()
    })
  })

  describe('deleteTimeEntry', () => {
    it('should delete unbilled time entry', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'entry-1' }]),
        }),
      })

      const result = await deleteTimeEntry('entry-1', 'user-123')

      expect(result).toBe(true)
    })

    it('should return false if entry not found or already billed', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await deleteTimeEntry('entry-999', 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('getBillableStats', () => {
    it('should return billable statistics', async () => {
      const mockStats = {
        totalHours: 160,
        billableHours: 150,
        unbilledAmount: 15000,
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockStats]))

      const result = await getBillableStats('user-123')

      expect(result.totalHours).toBe(160)
      expect(result.billableHours).toBe(150)
      expect(result.unbilledAmount).toBe(15000)
    })

    it('should filter stats by date range', async () => {
      const mockStats = {
        totalHours: 80,
        billableHours: 75,
        unbilledAmount: 7500,
      }

      mockDb.select.mockReturnValue(createThenableQuery([mockStats]))

      const result = await getBillableStats(
        'user-123',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )

      expect(result.totalHours).toBe(80)
    })
  })

  describe('getUnbilledTimeEntries', () => {
    it('should return unbilled time entries', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          isBillable: true,
          isBilled: false,
          invoiceId: null,
        },
        {
          id: 'entry-2',
          userId: 'user-123',
          isBillable: true,
          isBilled: false,
          invoiceId: null,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockEntries))

      const result = await getUnbilledTimeEntries('user-123')

      expect(result).toHaveLength(2)
      expect(result.every((e) => e.isBillable && !e.isBilled)).toBe(true)
    })

    it('should filter unbilled entries by client', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: 'user-123',
          clientId: 'client-1',
          isBillable: true,
          isBilled: false,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockEntries))

      const result = await getUnbilledTimeEntries('user-123', 'client-1')

      expect(result).toHaveLength(1)
      expect(result[0].clientId).toBe('client-1')
    })
  })

  describe('markTimeEntriesAsBilled', () => {
    it('should mark time entries as billed', async () => {
      const entryIds = ['entry-1', 'entry-2']

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { id: 'entry-1', isBilled: true, invoiceId: 'inv-123' },
              { id: 'entry-2', isBilled: true, invoiceId: 'inv-123' },
            ]),
          }),
        }),
      })

      const result = await markTimeEntriesAsBilled(entryIds, 'user-123', 'inv-123')

      expect(result).toBe(2)
    })

    it('should return 0 if no entries to mark', async () => {
      const result = await markTimeEntriesAsBilled([], 'user-123', 'inv-123')

      expect(result).toBe(0)
    })
  })

  describe('getContractorBillableHours', () => {
    it('should return billable hours for contractor', async () => {
      const mockResult = {
        billable_hours: 120,
      }

      mockDb.execute.mockResolvedValue([mockResult])

      const result = await getContractorBillableHours('contractor-1')

      expect(result).toBe(120)
    })

    it('should filter by project and date range', async () => {
      const mockResult = {
        billable_hours: 80,
      }

      mockDb.execute.mockResolvedValue([mockResult])

      const result = await getContractorBillableHours(
        'contractor-1',
        'project-1',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )

      expect(result).toBe(80)
    })
  })
})

