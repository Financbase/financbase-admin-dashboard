import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { MetricsCollector } from '@/lib/analytics/metrics-collector'
import { db } from '@/lib/db'

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector
  let mockDb: any

  beforeEach(() => {
    jest.clearAllMocks()
    metricsCollector = new MetricsCollector()
    mockDb = db as any
  })

  describe('recordMetric', () => {
    it('should record a custom metric successfully', async () => {
      const metricData = {
        name: 'api_response_time',
        value: 150,
        unit: 'milliseconds',
        tags: { endpoint: '/api/invoices', method: 'GET' },
        timestamp: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'metric-1' }),
      })

      const result = await metricsCollector.recordMetric(metricData)

      expect(result.success).toBe(true)
      expect(result.metricId).toBe('metric-1')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should validate metric data before recording', async () => {
      const invalidMetricData = {
        name: '', // Empty name
        value: -1, // Negative value
        unit: 'invalid',
        tags: {},
        timestamp: new Date(),
      }

      const result = await metricsCollector.recordMetric(invalidMetricData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid metric data')
    })

    it('should handle database errors gracefully', async () => {
      const metricData = {
        name: 'test_metric',
        value: 100,
        unit: 'count',
        tags: {},
        timestamp: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const result = await metricsCollector.recordMetric(metricData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })
  })

  describe('recordBusinessMetric', () => {
    it('should record business metrics with proper categorization', async () => {
      const businessMetric = {
        type: 'revenue',
        value: 5000,
        period: 'monthly',
        tags: { source: 'subscriptions', region: 'us-west' },
        timestamp: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'business-metric-1' }),
      })

      const result = await metricsCollector.recordBusinessMetric(businessMetric)

      expect(result.success).toBe(true)
      expect(result.metricId).toBe('business-metric-1')
    })

    it('should validate business metric types', async () => {
      const invalidBusinessMetric = {
        type: 'invalid_type' as any,
        value: 1000,
        period: 'monthly',
        tags: {},
        timestamp: new Date(),
      }

      const result = await metricsCollector.recordBusinessMetric(invalidBusinessMetric)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid business metric type')
    })
  })

  describe('recordSystemMetric', () => {
    it('should record system health metrics', async () => {
      const systemMetric = {
        type: 'cpu_usage',
        value: 75.5,
        unit: 'percent',
        tags: { instance: 'web-1', region: 'us-east' },
        timestamp: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'system-metric-1' }),
      })

      const result = await metricsCollector.recordSystemMetric(systemMetric)

      expect(result.success).toBe(true)
      expect(result.metricId).toBe('system-metric-1')
    })

    it('should handle system metric aggregation', async () => {
      const systemMetrics = [
        { type: 'memory_usage', value: 60, unit: 'percent', tags: { instance: 'web-1' } },
        { type: 'memory_usage', value: 70, unit: 'percent', tags: { instance: 'web-2' } },
        { type: 'memory_usage', value: 65, unit: 'percent', tags: { instance: 'web-3' } },
      ]

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'aggregated-metric-1' }),
      })

      const result = await metricsCollector.aggregateSystemMetrics(systemMetrics)

      expect(result.success).toBe(true)
      expect(result.aggregatedValue).toBe(65) // Average
    })
  })

  describe('getMetrics', () => {
    it('should retrieve metrics with filters', async () => {
      const filters = {
        name: 'api_response_time',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        tags: { endpoint: '/api/invoices' },
      }

      const mockMetrics = [
        {
          id: 'metric-1',
          name: 'api_response_time',
          value: 150,
          unit: 'milliseconds',
          tags: { endpoint: '/api/invoices', method: 'GET' },
          timestamp: new Date('2024-01-15'),
        },
        {
          id: 'metric-2',
          name: 'api_response_time',
          value: 200,
          unit: 'milliseconds',
          tags: { endpoint: '/api/invoices', method: 'POST' },
          timestamp: new Date('2024-01-16'),
        },
      ]

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockMetrics),
          }),
        }),
      })

      const result = await metricsCollector.getMetrics(filters)

      expect(result.success).toBe(true)
      expect(result.metrics).toEqual(mockMetrics)
    })

    it('should handle empty results gracefully', async () => {
      const filters = {
        name: 'non_existent_metric',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await metricsCollector.getMetrics(filters)

      expect(result.success).toBe(true)
      expect(result.metrics).toEqual([])
    })
  })

  describe('getMetricStats', () => {
    it('should calculate metric statistics', async () => {
      const metricName = 'api_response_time'
      const period = 'daily'
      const mockStats = {
        count: 100,
        min: 50,
        max: 500,
        avg: 150,
        p95: 300,
        p99: 450,
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([mockStats]),
          }),
        }),
      })

      const result = await metricsCollector.getMetricStats(metricName, period)

      expect(result.success).toBe(true)
      expect(result.stats).toEqual(mockStats)
    })

    it('should handle metric aggregation by time periods', async () => {
      const metricName = 'revenue'
      const period = 'monthly'
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const mockTimeSeriesData = [
        { period: '2024-01', value: 10000, count: 100 },
        { period: '2024-02', value: 12000, count: 120 },
        { period: '2024-03', value: 15000, count: 150 },
      ]

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTimeSeriesData),
            }),
          }),
        }),
      })

      const result = await metricsCollector.getMetricTimeSeries(metricName, period, startDate, endDate)

      expect(result.success).toBe(true)
      expect(result.timeSeries).toEqual(mockTimeSeriesData)
    })
  })

  describe('recordEvent', () => {
    it('should record custom events', async () => {
      const eventData = {
        name: 'user_action',
        properties: {
          userId: 'user-123',
          action: 'invoice_created',
          amount: 1000,
        },
        timestamp: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'event-1' }),
      })

      const result = await metricsCollector.recordEvent(eventData)

      expect(result.success).toBe(true)
      expect(result.eventId).toBe('event-1')
    })

    it('should validate event data structure', async () => {
      const invalidEventData = {
        name: '', // Empty name
        properties: null, // Invalid properties
        timestamp: new Date(),
      }

      const result = await metricsCollector.recordEvent(invalidEventData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid event data')
    })
  })

  describe('getEventAnalytics', () => {
    it('should analyze event patterns', async () => {
      const eventName = 'user_action'
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockAnalytics = {
        totalEvents: 1000,
        uniqueUsers: 100,
        topActions: [
          { action: 'invoice_created', count: 500 },
          { action: 'payment_received', count: 300 },
          { action: 'user_login', count: 200 },
        ],
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 100),
        })),
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([mockAnalytics]),
          }),
        }),
      })

      const result = await metricsCollector.getEventAnalytics(eventName, startDate, endDate)

      expect(result.success).toBe(true)
      expect(result.analytics).toEqual(mockAnalytics)
    })
  })
})
