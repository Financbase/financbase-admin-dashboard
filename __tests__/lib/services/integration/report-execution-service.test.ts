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
  ReportExecutionService,
  reportExecutionService,
} from '@/lib/services/integration/report-execution-service'
import { getDbOrThrow } from '@/lib/db'
import { analyticsEvents, landingPageAnalytics } from '@/lib/db/schemas/analytics.schema'
import { purchaseOrders } from '@/lib/db/schemas/orders.schema'
import { sql } from 'drizzle-orm'

// Mock database
vi.mock('@/lib/db', () => ({
  getDbOrThrow: vi.fn(),
}))

// Mock schema to re-export from schemas directory
vi.mock('@/lib/db/schema', async () => {
  const schemas = await vi.importActual('@/lib/db/schemas')
  return schemas
})

// Mock analyticsEvents schema object (if it doesn't exist in actual schema)
vi.mock('@/lib/db/schemas/analytics.schema', async () => {
  const actual = await vi.importActual('@/lib/db/schemas/analytics.schema')
  return {
    ...actual,
    analyticsEvents: {
      userId: { name: 'userId', table: { name: 'analytics_events' } },
      component: { name: 'component', table: { name: 'analytics_events' } },
      timestamp: { name: 'timestamp', table: { name: 'analytics_events' } },
      sessionId: { name: 'sessionId', table: { name: 'analytics_events' } },
      properties: { name: 'properties', table: { name: 'analytics_events' } },
    },
  }
})

// Mock purchaseOrders schema object
vi.mock('@/lib/db/schemas/orders.schema', async () => {
  const actual = await vi.importActual('@/lib/db/schemas/orders.schema')
  return {
    ...actual,
    purchaseOrders: {
      createdAt: { name: 'createdAt', table: { name: 'purchase_orders' } },
      total: { name: 'total', table: { name: 'purchase_orders' } },
      status: { name: 'status', table: { name: 'purchase_orders' } },
    },
  }
})

describe('ReportExecutionService', () => {
  let service: ReportExecutionService
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
    service = new ReportExecutionService()
    mockDb = {
      select: vi.fn(),
      execute: vi.fn(),
    }
    vi.mocked(getDbOrThrow).mockReturnValue(mockDb)
    vi.clearAllMocks()
  })

  describe('executeReport', () => {
    it('should execute landing page report', async () => {
      const mockData = [
        {
          landingPageId: 'page-1',
          eventType: 'page_view',
          eventCount: 100,
          uniqueUsers: 50,
          uniqueSessions: 60,
          conversionRate: 5.5,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockData))

      // Mock getReportConfig to return the landing page report config
      vi.spyOn(service as any, 'getReportConfig').mockResolvedValue({
        id: 'landing-page-analytics',
        name: 'Landing Page Analytics',
        type: 'landing-pages',
        schedule: 'weekly',
        parameters: { days: 30 },
        createdBy: 'system',
        createdAt: new Date(),
      })

      const result = await service.executeReport('landing-page-analytics', {
        days: 30,
      })

      expect(result.reportId).toBe('landing-page-analytics')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].landingPageId).toBe('page-1')
      expect(result.executionTime).toBeGreaterThan(0)
    })

    it('should execute users report', async () => {
      const mockData = [
        {
          userId: 'user-1',
          eventCount: 200,
          lastActive: new Date(),
          sessionCount: 10,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockData))

      // Mock getReportConfig to return the user activity report config
      vi.spyOn(service as any, 'getReportConfig').mockResolvedValue({
        id: 'user-activity',
        name: 'User Activity Report',
        type: 'users',
        schedule: 'weekly',
        parameters: { days: 30 },
        createdBy: 'system',
        createdAt: new Date(),
      })

      const result = await service.executeReport('user-activity', {
        days: 30,
      })

      expect(result.reportId).toBe('user-activity')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].userId).toBe('user-1')
    })

    it('should execute sales report', async () => {
      const mockData = [
        {
          date: '2025-01-15',
          revenue: 5000,
          orders: 10,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockData))

      // Mock getReportConfig to return the sales report config
      vi.spyOn(service as any, 'getReportConfig').mockResolvedValue({
        id: 'sales-report',
        name: 'Sales Report',
        type: 'sales',
        schedule: 'daily',
        parameters: { days: 30 },
        createdBy: 'system',
        createdAt: new Date(),
      })

      const result = await service.executeReport('sales-report', {
        days: 30,
      })

      expect(result.reportId).toBe('sales-report')
      expect(result.data).toBeDefined()
    })

    it('should execute performance report', async () => {
      const mockData = [
        {
          component: 'Dashboard',
          eventCount: 500,
          avgProperties: 100,
        },
      ]

      mockDb.select.mockReturnValue(createThenableQuery(mockData))

      // Mock getReportConfig to return the performance report config
      vi.spyOn(service as any, 'getReportConfig').mockResolvedValue({
        id: 'performance-metrics',
        name: 'Performance Metrics',
        type: 'performance',
        schedule: 'daily',
        parameters: { days: 7 },
        createdBy: 'system',
        createdAt: new Date(),
      })

      const result = await service.executeReport('performance-metrics', {
        days: 7,
      })

      expect(result.reportId).toBe('performance-metrics')
      expect(result.data).toHaveLength(1)
    })

    it('should throw error for unknown report type', async () => {
      // Mock getReportConfig to return null (report not found)
      vi.spyOn(service as any, 'getReportConfig').mockResolvedValue(null)

      await expect(
        service.executeReport('unknown-report', {})
      ).rejects.toThrow('Report not found')
    })

    it('should throw error if report not found', async () => {
      await expect(
        service.executeReport('non-existent-report', {})
      ).rejects.toThrow('Report not found')
    })
  })

  describe('exportReport', () => {
    const mockResult = {
      reportId: 'test-report',
      executedAt: new Date(),
      executionTime: 100,
      rowCount: 2,
      data: [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ],
      metadata: {},
    }

    it('should export to CSV format', async () => {
      const blob = await service.exportReport(mockResult, {
        format: 'csv',
        includeHeaders: true,
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/csv')
    })

    it('should export to JSON format', async () => {
      const blob = await service.exportReport(mockResult, {
        format: 'json',
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/json')
    })

    it('should export to Excel format', async () => {
      const blob = await service.exportReport(mockResult, {
        format: 'excel',
      })

      expect(blob).toBeInstanceOf(Blob)
    })

    it('should export to PDF format', async () => {
      const blob = await service.exportReport(mockResult, {
        format: 'pdf',
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })

    it('should handle empty data in CSV export', async () => {
      const emptyResult = {
        ...mockResult,
        data: [],
        rowCount: 0,
      }

      const blob = await service.exportReport(emptyResult, {
        format: 'csv',
      })

      expect(blob).toBeInstanceOf(Blob)
    })

    it('should escape special characters in CSV', async () => {
      const specialData = {
        ...mockResult,
        data: [
          { name: 'Item, with comma', value: 'Value with "quotes"' },
        ],
      }

      const blob = await service.exportReport(specialData, {
        format: 'csv',
      })

      expect(blob).toBeInstanceOf(Blob)
    })

    it('should throw error for unsupported format', async () => {
      await expect(
        service.exportReport(mockResult, {
          format: 'unsupported' as any,
        })
      ).rejects.toThrow('Unsupported export format')
    })
  })

  describe('scheduleReport', () => {
    it('should schedule a report', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await service.scheduleReport(
        'test-report',
        'daily',
        ['user@example.com'],
        'csv'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Report scheduled:',
        expect.objectContaining({
          reportId: 'test-report',
          schedule: 'daily',
          recipients: ['user@example.com'],
          exportFormat: 'csv',
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getAvailableReports', () => {
    it('should return list of available reports', async () => {
      const reports = await service.getAvailableReports()

      expect(Array.isArray(reports)).toBe(true)
      expect(reports.length).toBeGreaterThan(0)
      expect(reports[0]).toHaveProperty('id')
      expect(reports[0]).toHaveProperty('name')
      expect(reports[0]).toHaveProperty('type')
    })

    it('should include landing page analytics report', async () => {
      const reports = await service.getAvailableReports()

      const landingPageReport = reports.find(
        (r) => r.id === 'landing-page-analytics'
      )

      expect(landingPageReport).toBeDefined()
      expect(landingPageReport?.type).toBe('landing-pages')
    })
  })

  describe('singleton export', () => {
    it('should export singleton instance', () => {
      expect(reportExecutionService).toBeInstanceOf(ReportExecutionService)
    })
  })
})

