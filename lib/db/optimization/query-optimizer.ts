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

export interface QueryStats {
  query: string;
  executionTime: number;
  rowsReturned: number;
  cost: number;
  isSlow: boolean;
  recommendations: string[];
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  estimatedImprovement: number;
}

export class QueryOptimizer {
  /**
   * Analyze slow queries
   */
  static async analyzeSlowQueries(limit: number = 10): Promise<QueryStats[]> {
    try {
      const slowQueries = await db.execute(sql`
        SELECT 
          query,
          mean_exec_time,
          calls,
          rows,
          total_exec_time,
          (total_exec_time / calls) as avg_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000  -- Queries taking more than 1 second
        ORDER BY mean_exec_time DESC 
        LIMIT ${limit}
      `);

      return slowQueries.map((row: any) => ({
        query: row.query,
        executionTime: parseFloat(row.mean_exec_time),
        rowsReturned: parseInt(row.rows),
        cost: parseFloat(row.total_exec_time),
        isSlow: parseFloat(row.mean_exec_time) > 1000,
        recommendations: this.generateRecommendations(row.query, parseFloat(row.mean_exec_time)),
      }));
    } catch (error) {
      console.error('Error analyzing slow queries:', error);
      return [];
    }
  }

  /**
   * Get index recommendations
   */
  static async getIndexRecommendations(): Promise<IndexRecommendation[]> {
    try {
      const recommendations = await db.execute(sql`
        WITH table_stats AS (
          SELECT 
            schemaname,
            tablename,
            n_tup_ins + n_tup_upd + n_tup_del as total_changes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples
          FROM pg_stat_user_tables
        ),
        index_usage AS (
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
          FROM pg_stat_user_indexes
        ),
        missing_indexes AS (
          SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
          FROM pg_stats
          WHERE schemaname = 'public'
            AND n_distinct > 100
            AND correlation < 0.1
        )
        SELECT 
          mi.tablename as table,
          mi.attname as column,
          'btree' as type,
          'High cardinality, low correlation - good candidate for index' as reason,
          CASE 
            WHEN ts.live_tuples > 10000 THEN 0.8
            WHEN ts.live_tuples > 1000 THEN 0.6
            ELSE 0.4
          END as estimated_improvement
        FROM missing_indexes mi
        JOIN table_stats ts ON mi.tablename = ts.tablename
        WHERE NOT EXISTS (
          SELECT 1 FROM index_usage iu 
          WHERE iu.tablename = mi.tablename 
            AND iu.indexname LIKE '%' || mi.attname || '%'
        )
        ORDER BY estimated_improvement DESC
      `);

      return recommendations.map((row: any) => ({
        table: row.table,
        columns: [row.column],
        type: row.type,
        reason: row.reason,
        estimatedImprovement: parseFloat(row.estimated_improvement),
      }));
    } catch (error) {
      console.error('Error getting index recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze table statistics
   */
  static async analyzeTableStats(): Promise<any[]> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `);

      return stats;
    } catch (error) {
      console.error('Error analyzing table stats:', error);
      return [];
    }
  }

  /**
   * Get database size information
   */
  static async getDatabaseSize(): Promise<any> {
    try {
      const sizeInfo = await db.execute(sql`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          pg_size_pretty(pg_total_relation_size('public.users')) as users_table_size,
          pg_size_pretty(pg_total_relation_size('public.invoices')) as invoices_table_size,
          pg_size_pretty(pg_total_relation_size('public.expenses')) as expenses_table_size
      `);

      return sizeInfo[0];
    } catch (error) {
      console.error('Error getting database size:', error);
      return null;
    }
  }

  /**
   * Check for missing indexes
   */
  static async checkMissingIndexes(): Promise<any[]> {
    try {
      const missingIndexes = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation,
          most_common_vals,
          most_common_freqs
        FROM pg_stats
        WHERE schemaname = 'public'
          AND n_distinct > 100
          AND correlation < 0.1
          AND most_common_vals IS NOT NULL
        ORDER BY n_distinct DESC
      `);

      return missingIndexes;
    } catch (error) {
      console.error('Error checking missing indexes:', error);
      return [];
    }
  }

  /**
   * Analyze query performance
   */
  static async analyzeQueryPerformance(query: string): Promise<any> {
    try {
      const explainResult = await db.execute(sql`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql.raw(query)}
      `);

      return explainResult[0];
    } catch (error) {
      console.error('Error analyzing query performance:', error);
      return null;
    }
  }

  /**
   * Get connection pool statistics
   */
  static async getConnectionStats(): Promise<any> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          state,
          count(*) as connection_count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);

      return stats;
    } catch (error) {
      console.error('Error getting connection stats:', error);
      return [];
    }
  }

  /**
   * Generate optimization recommendations
   */
  static generateRecommendations(query: string, executionTime: number): string[] {
    const recommendations: string[] = [];

    if (executionTime > 5000) {
      recommendations.push('Query is extremely slow (>5s). Consider breaking into smaller queries.');
    } else if (executionTime > 1000) {
      recommendations.push('Query is slow (>1s). Consider adding indexes or optimizing joins.');
    }

    if (query.toLowerCase().includes('select *')) {
      recommendations.push('Avoid SELECT * - specify only needed columns.');
    }

    if (query.toLowerCase().includes('order by') && !query.toLowerCase().includes('limit')) {
      recommendations.push('Consider adding LIMIT clause to ORDER BY queries.');
    }

    if (query.toLowerCase().includes('like') && query.includes('%')) {
      recommendations.push('LIKE queries with leading % are slow. Consider full-text search.');
    }

    if (query.toLowerCase().includes('join') && query.split('join').length > 3) {
      recommendations.push('Multiple JOINs detected. Consider query optimization or denormalization.');
    }

    if (query.toLowerCase().includes('subquery')) {
      recommendations.push('Subqueries detected. Consider using JOINs for better performance.');
    }

    return recommendations;
  }

  /**
   * Get optimization summary
   */
  static async getOptimizationSummary(): Promise<{
    slowQueries: number;
    missingIndexes: number;
    totalTables: number;
    databaseSize: string;
    recommendations: string[];
  }> {
    try {
      const [slowQueries, missingIndexes, tableStats, sizeInfo] = await Promise.all([
        this.analyzeSlowQueries(50),
        this.checkMissingIndexes(),
        this.analyzeTableStats(),
        this.getDatabaseSize(),
      ]);

      const recommendations: string[] = [];

      if (slowQueries.length > 0) {
        recommendations.push(`${slowQueries.length} slow queries detected`);
      }

      if (missingIndexes.length > 0) {
        recommendations.push(`${missingIndexes.length} potential missing indexes`);
      }

      const deadTuples = tableStats.reduce((sum, table) => sum + parseInt(table.dead_tuples), 0);
      if (deadTuples > 1000) {
        recommendations.push('High number of dead tuples - consider VACUUM');
      }

      return {
        slowQueries: slowQueries.length,
        missingIndexes: missingIndexes.length,
        totalTables: tableStats.length,
        databaseSize: sizeInfo?.database_size || 'Unknown',
        recommendations,
      };
    } catch (error) {
      console.error('Error getting optimization summary:', error);
      return {
        slowQueries: 0,
        missingIndexes: 0,
        totalTables: 0,
        databaseSize: 'Unknown',
        recommendations: ['Unable to analyze database performance'],
      };
    }
  }
}
