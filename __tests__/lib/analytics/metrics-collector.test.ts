import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MetricsCollector } from '@/lib/analytics/metrics-collector'
import { db } from '@/lib/db'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

describe('MetricsCollector', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
  })

  describe('recordSystemMetric', () => {
    it('should record a system metric successfully', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'metric-1' }),
      })

      await MetricsCollector.recordSystemMetric(
        'api_response_time',
        'histogram',
        { value: 150, unit: 'milliseconds', tags: { endpoint: '/api/invoices', method: 'GET' } },
        'performance',
        'user-123'
      )

      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      })

      // Should not throw, but log error
      await expect(
        MetricsCollector.recordSystemMetric(
          'test_metric',
          'gauge',
          { value: 100, unit: 'count' },
          'system',
          'user-123'
        )
      ).resolves.not.toThrow()
    })
  })

  describe('recordBusinessMetric', () => {
    it('should record business metrics with proper categorization', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'business-metric-1' }),
      })

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      await MetricsCollector.recordBusinessMetric(
        {
          metricName: 'monthly_revenue',
          metricType: 'revenue',
          value: 5000,
          currency: 'USD',
          period: 'monthly',
          periodStart,
          periodEnd,
          labels: { source: 'subscriptions', region: 'us-west' },
        },
        'user-123'
      )

      expect(mockDb.insert).toHaveBeenCalled()
    })
  })


  describe('getMetrics', () => {
    it('should retrieve metrics for a user', async () => {
      const mockSystemMetrics = [{ id: '1', metricName: 'cpu_usage', value: '75' }]
      const mockPerformanceMetrics = [{ id: '2', endpoint: '/api/invoices', responseTime: 150 }]
      const mockBusinessMetrics = [{ id: '3', metricName: 'revenue', value: '5000' }]

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockSystemMetrics),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPerformanceMetrics),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockBusinessMetrics),
            }),
          }),
        })

      const result = await MetricsCollector.getMetrics('user-123', undefined, '24h')

      expect(result).toHaveProperty('system')
      expect(result).toHaveProperty('performance')
      expect(result).toHaveProperty('business')
    })
  })

})
