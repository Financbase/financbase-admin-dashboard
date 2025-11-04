/**
 * Performance Monitoring Service
 * Database query optimization and performance tracking
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowCount: number;
  timestamp: Date;
  userId?: string;
  endpoint?: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_query' | 'high_memory' | 'error_rate' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metrics: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export class PerformanceMonitoringService {
  private queryMetrics: QueryMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // ms
  private readonly HIGH_ERROR_RATE_THRESHOLD = 0.1; // 10%

  /**
   * Monitor database query performance
   */
  async monitorQuery<T>(
    queryFn: () => Promise<T>,
    queryDescription: string,
    userId?: string,
    endpoint?: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Record metrics
      const metrics: QueryMetrics = {
        query: queryDescription,
        executionTime,
        rowCount: this.getRowCount(result),
        timestamp: new Date(),
        userId,
        endpoint
      };

      this.recordMetrics(metrics);

      // Check for slow queries
      if (executionTime > this.SLOW_QUERY_THRESHOLD) {
        this.createAlert({
          id: crypto.randomUUID(),
          type: 'slow_query',
          severity: executionTime > 5000 ? 'high' : 'medium',
          description: `Slow query detected: ${queryDescription}`,
          metrics: { executionTime, queryDescription, userId, endpoint },
          timestamp: new Date(),
          resolved: false
        });
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record error metrics
      const metrics: QueryMetrics = {
        query: `${queryDescription} (ERROR)`,
        executionTime,
        rowCount: 0,
        timestamp: new Date(),
        userId,
        endpoint
      };

      this.recordMetrics(metrics);

      // Create error alert
      this.createAlert({
        id: crypto.randomUUID(),
        type: 'error_rate',
        severity: 'high',
        description: `Query error: ${queryDescription}`,
        metrics: {
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime,
          queryDescription,
          userId,
          endpoint
        },
        timestamp: new Date(),
        resolved: false
      });

      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(filters: {
    userId?: string;
    endpoint?: string;
    timeRange?: { start: Date; end: Date };
    limit?: number;
  } = {}): QueryMetrics[] {
    let metrics = [...this.queryMetrics];

    if (filters.userId) {
      metrics = metrics.filter(m => m.userId === filters.userId);
    }

    if (filters.endpoint) {
      metrics = metrics.filter(m => m.endpoint === filters.endpoint);
    }

    if (filters.timeRange) {
      metrics = metrics.filter(m =>
        m.timestamp >= filters.timeRange!.start &&
        m.timestamp <= filters.timeRange!.end
      );
    }

    // Sort by timestamp descending
    metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters.limit) {
      metrics = metrics.slice(0, filters.limit);
    }

    return metrics;
  }

  /**
   * Get performance alerts
   */
  getAlerts(filters: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}): PerformanceAlert[] {
    let alerts = [...this.alerts];

    if (filters.type) {
      alerts = alerts.filter(a => a.type === filters.type);
    }

    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }

    if (filters.resolved !== undefined) {
      alerts = alerts.filter(a => a.resolved === filters.resolved);
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters.limit) {
      alerts = alerts.slice(0, filters.limit);
    }

    return alerts;
  }

  /**
   * Generate performance report
   */
  generateReport(timeRange: { start: Date; end: Date }): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    errorRate: number;
    topSlowQueries: QueryMetrics[];
    alerts: PerformanceAlert[];
  } {
    const metrics = this.getMetrics({ timeRange });

    const totalQueries = metrics.length;
    const averageExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries || 0;
    const slowQueries = metrics.filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD).length;
    const errorQueries = metrics.filter(m => m.query.includes('(ERROR)')).length;
    const errorRate = totalQueries > 0 ? errorQueries / totalQueries : 0;

    const topSlowQueries = metrics
      .filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    const alerts = this.getAlerts({ timeRange, resolved: false });

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      errorRate,
      topSlowQueries,
      alerts
    };
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // In a real implementation, this would also send notifications
    console.warn(`🚨 Performance Alert [${alert.severity.toUpperCase()}]: ${alert.description}`);
  }

  /**
   * Get row count from query result
   */
  private getRowCount(result: any): number {
    if (Array.isArray(result)) {
      return result.length;
    }
    if (result && typeof result === 'object' && 'length' in result) {
      return (result as any).length;
    }
    return 1; // Single result
  }

  /**
   * Clear old metrics and alerts
   */
  clearOldData(olderThanHours: number = 24): void {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp >= cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffDate);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitoringService();

// Database query optimization utilities
export class QueryOptimizer {
  /**
   * Analyze query performance
   */
  static async analyzeQuery(query: string, params?: any[]): Promise<{
    executionTime: number;
    plan: any;
    recommendations: string[];
  }> {
    // In a real implementation, this would use EXPLAIN ANALYZE
    // For now, return mock analysis
    return {
      executionTime: Math.random() * 1000, // Mock execution time
      plan: {
        type: 'sequential_scan',
        cost: Math.random() * 100,
        rows: Math.floor(Math.random() * 1000)
      },
      recommendations: [
        'Consider adding an index on frequently queried columns',
        'Use LIMIT for large result sets',
        'Avoid SELECT * and specify needed columns',
        'Use JOIN instead of subqueries when possible'
      ]
    };
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    tableStats: Array<{
      tableName: string;
      rowCount: number;
      size: string;
      lastUpdated: Date;
    }>;
    indexStats: Array<{
      indexName: string;
      tableName: string;
      usage: number;
      size: string;
    }>;
    connectionStats: {
      activeConnections: number;
      idleConnections: number;
      totalConnections: number;
    };
  }> {
    // Mock database statistics
    return {
      tableStats: [
        {
          tableName: 'bills',
          rowCount: 1250,
          size: '2.5 MB',
          lastUpdated: new Date()
        },
        {
          tableName: 'vendors',
          rowCount: 340,
          size: '1.2 MB',
          lastUpdated: new Date()
        },
        {
          tableName: 'bill_payments',
          rowCount: 890,
          size: '1.8 MB',
          lastUpdated: new Date()
        }
      ],
      indexStats: [
        {
          indexName: 'bills_user_id_idx',
          tableName: 'bills',
          usage: 95,
          size: '256 KB'
        },
        {
          indexName: 'vendors_user_id_idx',
          tableName: 'vendors',
          usage: 88,
          size: '128 KB'
        }
      ],
      connectionStats: {
        activeConnections: 12,
        idleConnections: 8,
        totalConnections: 20
      }
    };
  }

  /**
   * Optimize table structure
   */
  static async optimizeTables(): Promise<{
    optimized: string[];
    recommendations: string[];
  }> {
    // Mock optimization results
    return {
      optimized: ['bills', 'vendors', 'bill_payments'],
      recommendations: [
        'Run VACUUM on large tables',
        'Update table statistics with ANALYZE',
        'Consider partitioning for time-series data',
        'Review and optimize indexes'
      ]
    };
  }
}
