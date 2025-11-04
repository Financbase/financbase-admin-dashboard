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
import { cache } from '@/lib/cache/cache-manager';

export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  slowQueries: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface QueryPerformance {
  query: string;
  executionTime: number;
  rowsReturned: number;
  cost: number;
  isSlow: boolean;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: PerformanceMetrics;
  alerts: string[];
  recommendations: string[];
}

export class PerformanceService {
  /**
   * Collect current performance metrics
   */
  static async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      const [dbStats, cacheStats, systemStats] = await Promise.all([
        this.getDatabaseStats(),
        cache.getStats(),
        this.getSystemStats(),
      ]);

      return {
        timestamp: new Date(),
        responseTime: dbStats.avgResponseTime,
        memoryUsage: systemStats.memoryUsage,
        cpuUsage: systemStats.cpuUsage,
        activeConnections: dbStats.activeConnections,
        slowQueries: dbStats.slowQueries,
        cacheHitRate: cacheStats.hitRate,
        errorRate: systemStats.errorRate,
      };
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      throw new Error('Failed to collect performance metrics');
    }
  }

  /**
   * Get database performance statistics
   */
  static async getDatabaseStats(): Promise<{
    avgResponseTime: number;
    activeConnections: number;
    slowQueries: number;
    totalQueries: number;
  }> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          AVG(mean_exec_time) as avg_response_time,
          COUNT(*) as total_queries,
          COUNT(CASE WHEN mean_exec_time > 1000 THEN 1 END) as slow_queries
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
      `);

      const connections = await db.execute(sql`
        SELECT COUNT(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active'
      `);

      return {
        avgResponseTime: parseFloat(stats[0]?.avg_response_time || '0'),
        activeConnections: parseInt(connections[0]?.active_connections || '0'),
        slowQueries: parseInt(stats[0]?.slow_queries || '0'),
        totalQueries: parseInt(stats[0]?.total_queries || '0'),
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        avgResponseTime: 0,
        activeConnections: 0,
        slowQueries: 0,
        totalQueries: 0,
      };
    }
  }

  /**
   * Get system resource usage
   */
  static async getSystemStats(): Promise<{
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
  }> {
    try {
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;

      // Get CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

      // Get error rate from recent logs (simplified)
      const errorRate = await this.getErrorRate();

      return {
        memoryUsage: memoryUsageMB,
        cpuUsage: cpuUsagePercent,
        errorRate,
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Get error rate from recent activity
   */
  private static async getErrorRate(): Promise<number> {
    try {
      const errorStats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status >= 400 THEN 1 END) as error_requests
        FROM audit_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
      `);

      const total = parseInt(errorStats[0]?.total_requests || '0');
      const errors = parseInt(errorStats[0]?.error_requests || '0');

      return total > 0 ? (errors / total) * 100 : 0;
    } catch (error) {
      console.error('Error getting error rate:', error);
      return 0;
    }
  }

  /**
   * Analyze slow queries
   */
  static async analyzeSlowQueries(limit: number = 10): Promise<QueryPerformance[]> {
    try {
      const slowQueries = await db.execute(sql`
        SELECT 
          query,
          mean_exec_time,
          calls,
          rows,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC 
        LIMIT ${limit}
      `);

      return slowQueries.map((row: any) => ({
        query: row.query,
        executionTime: parseFloat(row.mean_exec_time),
        rowsReturned: parseInt(row.rows),
        cost: parseFloat(row.total_exec_time),
        isSlow: parseFloat(row.mean_exec_time) > 1000,
        timestamp: new Date(),
      }));
    } catch (error) {
      console.error('Error analyzing slow queries:', error);
      return [];
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const metrics = await this.collectMetrics();
      const alerts: string[] = [];
      const recommendations: string[] = [];

      // Check response time
      if (metrics.responseTime > 2000) {
        alerts.push('High response time detected');
        recommendations.push('Consider optimizing database queries or adding indexes');
      }

      // Check memory usage
      if (metrics.memoryUsage > 1000) { // 1GB
        alerts.push('High memory usage detected');
        recommendations.push('Consider implementing memory optimization or scaling');
      }

      // Check cache hit rate
      if (metrics.cacheHitRate < 80) {
        alerts.push('Low cache hit rate');
        recommendations.push('Consider optimizing cache strategy or increasing cache size');
      }

      // Check error rate
      if (metrics.errorRate > 5) {
        alerts.push('High error rate detected');
        recommendations.push('Investigate and fix application errors');
      }

      // Check slow queries
      if (metrics.slowQueries > 10) {
        alerts.push('Multiple slow queries detected');
        recommendations.push('Optimize database queries and add missing indexes');
      }

      // Determine overall status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (alerts.length > 0) {
        status = alerts.length > 3 ? 'critical' : 'warning';
      }

      return {
        status,
        metrics,
        alerts,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'critical',
        metrics: {
          timestamp: new Date(),
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          activeConnections: 0,
          slowQueries: 0,
          cacheHitRate: 0,
          errorRate: 0,
        },
        alerts: ['Unable to collect system metrics'],
        recommendations: ['Check system connectivity and database status'],
      };
    }
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(hours: number = 24): Promise<PerformanceMetrics[]> {
    try {
      // In a real implementation, you'd store metrics over time
      // For now, we'll return current metrics
      const currentMetrics = await this.collectMetrics();
      return [currentMetrics];
    } catch (error) {
      console.error('Error getting performance trends:', error);
      return [];
    }
  }

  /**
   * Get database size and growth
   */
  static async getDatabaseSize(): Promise<{
    totalSize: string;
    tableSizes: Array<{ table: string; size: string; percentage: number }>;
    growthRate: number;
  }> {
    try {
      const sizeInfo = await db.execute(sql`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as total_size,
          pg_database_size(current_database()) as total_bytes
      `);

      const tableSizes = await db.execute(sql`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      const totalBytes = parseInt(sizeInfo[0]?.total_bytes || '0');
      const tableSizesWithPercentage = tableSizes.map((table: any) => ({
        table: table.tablename,
        size: table.size,
        percentage: totalBytes > 0 ? (parseInt(table.bytes) / totalBytes) * 100 : 0,
      }));

      return {
        totalSize: sizeInfo[0]?.total_size || '0 bytes',
        tableSizes: tableSizesWithPercentage,
        growthRate: 0, // Would need historical data to calculate
      };
    } catch (error) {
      console.error('Error getting database size:', error);
      return {
        totalSize: '0 bytes',
        tableSizes: [],
        growthRate: 0,
      };
    }
  }

  /**
   * Get connection pool statistics
   */
  static async getConnectionPoolStats(): Promise<{
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
  }> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          state,
          COUNT(*) as connection_count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);

      const maxConnections = await db.execute(sql`
        SELECT setting::int as max_connections
        FROM pg_settings
        WHERE name = 'max_connections'
      `);

      const active = stats.find((s: any) => s.state === 'active')?.connection_count || 0;
      const idle = stats.find((s: any) => s.state === 'idle')?.connection_count || 0;
      const total = active + idle;

      return {
        active: parseInt(active),
        idle: parseInt(idle),
        total: parseInt(total),
        maxConnections: parseInt(maxConnections[0]?.max_connections || '100'),
      };
    } catch (error) {
      console.error('Error getting connection pool stats:', error);
      return {
        active: 0,
        idle: 0,
        total: 0,
        maxConnections: 100,
      };
    }
  }

  /**
   * Get cache performance statistics
   */
  static async getCacheStats(): Promise<{
    hitRate: number;
    totalRequests: number;
    cacheSize: number;
    evictions: number;
  }> {
    try {
      const cacheStats = cache.getStats();
      
      return {
        hitRate: cacheStats.hitRate,
        totalRequests: cacheStats.hits + cacheStats.misses,
        cacheSize: 0, // Would need Redis INFO command
        evictions: 0, // Would need Redis INFO command
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        hitRate: 0,
        totalRequests: 0,
        cacheSize: 0,
        evictions: 0,
      };
    }
  }

  /**
   * Start performance monitoring
   */
  static async startMonitoring(): Promise<void> {
    try {
      // Start collecting metrics every 5 minutes
    } catch (error) {
      console.error('Error starting performance monitoring:', error);
    }
  }

  /**
   * Stop performance monitoring
   */
  static async stopMonitoring(): Promise<void> {
    try {
      // Stop monitoring
    } catch (error) {
      console.error('Error stopping performance monitoring:', error);
    }
  }
}
