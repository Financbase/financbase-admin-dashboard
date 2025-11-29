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
  generateReport,
  createReport,
  getReportById,
  getReports,
  updateReport,
  deleteReport,
  runReport,
  getReportHistory,
  getReportTemplates,
  createReportFromTemplate,
  ReportService,
} from '@/lib/services/report-service'
import { db } from '@/lib/db'
import { reports, reportHistory, reportTemplates } from '@/lib/db/schema/reports'

// Unmock report service to test actual implementation
vi.unmock('@/lib/services/report-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      reports: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      reportHistory: {
        findMany: vi.fn(),
      },
      reportTemplates: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}))

// Helper to create a thenable query builder
const createThenableQuery = (result: any[]) => {
  const query: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
  }
  query.then = vi.fn((onResolve?: (value: any[]) => any) => {
    const promise = Promise.resolve(result)
    return onResolve ? promise.then(onResolve) : promise
  })
  query.catch = vi.fn((onReject?: (error: any) => any) => {
    const promise = Promise.resolve(result)
    return onReject ? promise.catch(onReject) : promise
  })
  Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' })
  return query
}

// Helper to create a thenable insert mock
const createInsertMock = (returningValue: any[] = []) => {
  const returningMock = vi.fn().mockResolvedValue(returningValue)
  const valuesMock = vi.fn().mockReturnValue({
    returning: returningMock,
  })
  const insertMock: any = {
    values: valuesMock,
  }
  // Make values accessible for inspection
  insertMock.values = valuesMock
  // Make insert itself thenable
  insertMock.then = vi.fn((onResolve?: (value: any) => any) => {
    const promise = Promise.resolve(returningValue[0] || returningValue)
    return onResolve ? promise.then(onResolve) : promise
  })
  return insertMock
}

describe('ReportService', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = db as any
    vi.clearAllMocks()
    // Reset select mock to use thenable pattern by default
    mockDb.select.mockReset()
    mockDb.select.mockReturnValue(createThenableQuery([]))
    // Reset insert mock
    mockDb.insert.mockReset()
  })

  describe('generateReport', () => {
    it('should generate profit and loss report', async () => {
      const input = {
        userId: 'user-123',
        type: 'profit_loss' as const,
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        },
      }

      const result = await generateReport(input)

      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
      expect(result.details).toBeDefined()
    })

    it('should generate cash flow report', async () => {
      const input = {
        userId: 'user-123',
        type: 'cash_flow' as const,
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        },
      }

      const result = await generateReport(input)

      expect(result.summary).toBeDefined()
      expect(result.summary.cashInflow).toBeDefined()
      expect(result.summary.cashOutflow).toBeDefined()
    })

    it('should generate balance sheet report', async () => {
      const input = {
        userId: 'user-123',
        type: 'balance_sheet' as const,
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        },
      }

      const result = await generateReport(input)

      expect(result.summary).toBeDefined()
      expect(result.summary.assets).toBeDefined()
      expect(result.summary.liabilities).toBeDefined()
      expect(result.summary.equity).toBeDefined()
    })

    it('should handle custom report types', async () => {
      const input = {
        userId: 'user-123',
        type: 'custom' as const,
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        },
      }

      const result = await generateReport(input)

      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
    })
  })

  describe('createReport', () => {
    it('should create a new report', async () => {
      const input = {
        userId: 'user-123',
        name: 'Monthly P&L',
        description: 'Monthly profit and loss report',
        type: 'profit_loss' as const,
        config: {
          dateRange: {
            start: '2025-01-01',
            end: '2025-01-31',
            preset: 'month' as const,
          },
        },
      }

      const mockCreatedReport = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedReport]),
        }),
      })

      const result = await createReport(input)

      expect(result).toBeDefined()
      expect(result.name).toBe('Monthly P&L')
      expect(result.type).toBe('profit_loss')
    })
  })

  describe('getReportById', () => {
    it('should return report by ID', async () => {
      const mockReport = {
        id: 1,
        userId: 'user-123',
        name: 'Monthly P&L',
        type: 'profit_loss',
      }

      mockDb.query.reports.findFirst.mockResolvedValue(mockReport)

      const result = await getReportById(1, 'user-123')

      expect(result).toBeDefined()
      expect(result?.id).toBe(1)
      expect(result?.name).toBe('Monthly P&L')
    })

    it('should return null if report not found', async () => {
      mockDb.query.reports.findFirst.mockResolvedValue(null)

      const result = await getReportById(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getReports', () => {
    it('should return all reports for user', async () => {
      const mockReports = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Report 1',
          type: 'profit_loss',
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user-123',
          name: 'Report 2',
          type: 'cash_flow',
          updatedAt: new Date(),
        },
      ]

      mockDb.query.reports.findMany.mockResolvedValue(mockReports)

      const result = await getReports('user-123')

      expect(result).toHaveLength(2)
    })

    it('should filter reports by type', async () => {
      const mockReports = [
        {
          id: 1,
          userId: 'user-123',
          name: 'P&L Report',
          type: 'profit_loss',
          updatedAt: new Date(),
        },
      ]

      mockDb.query.reports.findMany.mockResolvedValue(mockReports)

      const result = await getReports('user-123', { type: 'profit_loss' })

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('profit_loss')
    })

    it('should filter reports by favorite status', async () => {
      const mockReports = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Favorite Report',
          type: 'profit_loss',
          isFavorite: true,
          updatedAt: new Date(),
        },
      ]

      mockDb.query.reports.findMany.mockResolvedValue(mockReports)

      const result = await getReports('user-123', { isFavorite: true })

      expect(result).toHaveLength(1)
      expect(result[0].isFavorite).toBe(true)
    })

    it('should support pagination', async () => {
      const mockReports = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Report 1',
          updatedAt: new Date(),
        },
      ]

      mockDb.query.reports.findMany.mockResolvedValue(mockReports)

      const result = await getReports('user-123', { limit: 10, offset: 0 })

      expect(result).toHaveLength(1)
    })
  })

  describe('updateReport', () => {
    it('should update report successfully', async () => {
      const updates = {
        name: 'Updated Report Name',
        description: 'Updated description',
      }

      const mockUpdatedReport = {
        id: 1,
        userId: 'user-123',
        ...updates,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedReport]),
          }),
        }),
      })

      const result = await updateReport(1, 'user-123', updates)

      expect(result.name).toBe('Updated Report Name')
      expect(result.description).toBe('Updated description')
    })
  })

  describe('deleteReport', () => {
    it('should delete report successfully', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      })

      await deleteReport(1, 'user-123')

      expect(mockDb.delete).toHaveBeenCalled()
    })
  })

  describe('runReport', () => {
    it('should run report and save to history', async () => {
      const mockReport = {
        id: 1,
        userId: 'user-123',
        type: 'profit_loss',
        config: {
          dateRange: {
            start: '2025-01-01',
            end: '2025-01-31',
          },
        },
      }

      const mockHistory = {
        id: 1,
        reportId: 1,
        userId: 'user-123',
        data: {
          summary: { totalRevenue: 50000 },
          details: [],
        },
        executionTime: 100,
        dataPoints: 0,
        createdAt: new Date(),
      }

      mockDb.query.reports.findFirst.mockResolvedValue(mockReport)

      mockDb.insert
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockHistory]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue({}),
        })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      const result = await runReport(1, 'user-123')

      expect(result).toBeDefined()
      expect(result.reportId).toBe(1)
      expect(result.executionTime).toBeDefined()
    })

    it('should use default date range if not provided', async () => {
      const mockReport = {
        id: 1,
        userId: 'user-123',
        type: 'profit_loss',
        config: {},
      }

      const mockHistory = {
        id: 1,
        reportId: 1,
        userId: 'user-123',
        data: { summary: {}, details: [] },
        executionTime: 100,
        dataPoints: 0,
        createdAt: new Date(),
      }

      mockDb.query.reports.findFirst.mockResolvedValue(mockReport)

      mockDb.insert
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockHistory]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue({}),
        })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      const result = await runReport(1, 'user-123')

      expect(result).toBeDefined()
    })

    it('should throw error if report not found', async () => {
      mockDb.query.reports.findFirst.mockResolvedValue(null)

      await expect(runReport(999, 'user-123')).rejects.toThrow('Report not found')
    })
  })

  describe('getReportHistory', () => {
    it('should return report history', async () => {
      const mockHistory = [
        {
          id: 1,
          reportId: 1,
          userId: 'user-123',
          data: { summary: {} },
          createdAt: new Date(),
        },
        {
          id: 2,
          reportId: 1,
          userId: 'user-123',
          data: { summary: {} },
          createdAt: new Date(),
        },
      ]

      mockDb.query.reportHistory.findMany.mockResolvedValue(mockHistory)

      const result = await getReportHistory(1, 'user-123', 10)

      expect(result).toHaveLength(2)
    })
  })

  describe('getReportTemplates', () => {
    it('should return all report templates', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'P&L Template',
          type: 'profit_loss',
          isPopular: true,
        },
        {
          id: 2,
          name: 'Cash Flow Template',
          type: 'cash_flow',
          isPopular: false,
        },
      ]

      mockDb.query.reportTemplates.findMany.mockResolvedValue(mockTemplates)

      const result = await getReportTemplates()

      expect(result).toHaveLength(2)
    })

    it('should filter templates by category', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Financial Template',
          category: 'financial',
        },
      ]

      mockDb.query.reportTemplates.findMany.mockResolvedValue(mockTemplates)

      const result = await getReportTemplates('financial')

      expect(result).toHaveLength(1)
    })

    it('should handle missing table gracefully', async () => {
      mockDb.query.reportTemplates.findMany.mockRejectedValue(
        new Error('column "user_id" does not exist')
      )

      const result = await getReportTemplates()

      expect(result).toEqual([])
    })
  })

  describe('createReportFromTemplate', () => {
    it('should create report from template', async () => {
      const mockTemplate = {
        id: 1,
        name: 'P&L Template',
        description: 'Template description',
        type: 'profit_loss',
        config: {
          dateRange: {
            start: '2025-01-01',
            end: '2025-01-31',
          },
        },
        usageCount: 5,
      }

      const mockCreatedReport = {
        id: 1,
        userId: 'user-123',
        name: 'My P&L Report',
        type: 'profit_loss',
        createdAt: new Date(),
      }

      mockDb.query.reportTemplates.findFirst.mockResolvedValue(mockTemplate)

      mockDb.insert
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockCreatedReport]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue({}),
        })

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      })

      const result = await createReportFromTemplate(1, 'user-123', {
        name: 'My P&L Report',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('My P&L Report')
    })

    it('should increment template usage count', async () => {
      const mockTemplate = {
        id: 1,
        name: 'Template',
        type: 'profit_loss',
        config: {},
        usageCount: 5,
      }

      const mockCreatedReport = {
        id: 1,
        userId: 'user-123',
        name: 'Report',
        type: 'profit_loss',
        createdAt: new Date(),
      }

      mockDb.query.reportTemplates.findFirst.mockResolvedValue(mockTemplate)

      // Mock insert for createReport - needs to return object with values().returning()
      const insertReturnValue = {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockCreatedReport]),
          }),
      }
      mockDb.insert.mockReturnValueOnce(insertReturnValue)

      const mockSet = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      })

      mockDb.update.mockReturnValue({
        set: mockSet,
      })

      await createReportFromTemplate(1, 'user-123', { name: 'Report' })

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          usageCount: 6,
        })
      )
    })

    it('should throw error if template not found', async () => {
      mockDb.query.reportTemplates.findFirst.mockResolvedValue(null)

      await expect(
        createReportFromTemplate(999, 'user-123', { name: 'Report' })
      ).rejects.toThrow('Template not found')
    })
  })

  describe('ReportService export', () => {
    it('should export all functions', () => {
      expect(ReportService.generate).toBe(generateReport)
      expect(ReportService.create).toBe(createReport)
      expect(ReportService.getById).toBe(getReportById)
      expect(ReportService.getAll).toBe(getReports)
      expect(ReportService.update).toBe(updateReport)
      expect(ReportService.delete).toBe(deleteReport)
      expect(ReportService.run).toBe(runReport)
      expect(ReportService.getHistory).toBe(getReportHistory)
      expect(ReportService.getTemplates).toBe(getReportTemplates)
      expect(ReportService.createFromTemplate).toBe(createReportFromTemplate)
    })
  })
})

