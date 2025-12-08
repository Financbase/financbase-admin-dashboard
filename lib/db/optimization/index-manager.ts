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

export interface IndexInfo {
  tableName: string;
  indexName: string;
  columns: string[];
  type: string;
  size: string;
  usage: number;
  isUnique: boolean;
  isPrimary: boolean;
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'brin';
  reason: string;
  estimatedImprovement: number;
  sql: string;
}

export class IndexManager {
  /**
   * Get all indexes for a table
   */
  static async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
    try {
      const indexes = await db.execute(sql`
        SELECT 
          i.relname as index_name,
          a.attname as column_name,
          am.amname as index_type,
          pg_size_pretty(pg_relation_size(i.oid)) as size,
          s.idx_scan as usage_count,
          i.indisunique as is_unique,
          i.indisprimary as is_primary
        FROM pg_class i
        JOIN pg_index ix ON i.oid = ix.indexrelid
        JOIN pg_class t ON ix.indrelid = t.oid
        JOIN pg_attribute a ON t.oid = a.attrelid AND a.attnum = ANY(ix.indkey)
        JOIN pg_am am ON i.relam = am.oid
        LEFT JOIN pg_stat_user_indexes s ON i.oid = s.indexrelid
        WHERE t.relname = ${tableName}
          AND t.relkind = 'r'
        ORDER BY i.relname, a.attnum
      `);

      // Group by index name
      const indexMap = new Map<string, IndexInfo>();
      
      // Handle different result formats from db.execute
      // NeonHttpQueryResult has a 'rows' property, QueryResult is an array-like object
      const indexRows = Array.isArray(indexes) 
        ? indexes 
        : ('rows' in indexes ? indexes.rows : []);
      
      indexRows.forEach((row: any) => {
        const indexName = row.index_name;
        
        if (!indexMap.has(indexName)) {
          indexMap.set(indexName, {
            tableName,
            indexName,
            columns: [],
            type: row.index_type,
            size: row.size,
            usage: parseInt(row.usage_count) || 0,
            isUnique: row.is_unique,
            isPrimary: row.is_primary,
          });
        }
        
        indexMap.get(indexName)!.columns.push(row.column_name);
      });

      return Array.from(indexMap.values());
    } catch (error) {
      console.error('Error getting table indexes:', error);
      return [];
    }
  }

  /**
   * Get unused indexes
   */
  static async getUnusedIndexes(): Promise<IndexInfo[]> {
    try {
      const unusedIndexes = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
          AND schemaname = 'public'
        ORDER BY pg_relation_size(indexrelid) DESC
      `);

      // Handle different result formats from db.execute
      // NeonHttpQueryResult has a 'rows' property, QueryResult is an array-like object
      const unusedRows = Array.isArray(unusedIndexes) 
        ? unusedIndexes 
        : ('rows' in unusedIndexes ? unusedIndexes.rows : []);
      
      return unusedRows.map((row: any) => ({
        tableName: row.tablename,
        indexName: row.indexname,
        columns: [], // Would need separate query to get columns
        type: 'unknown',
        size: row.size,
        usage: 0,
        isUnique: false,
        isPrimary: false,
      }));
    } catch (error) {
      console.error('Error getting unused indexes:', error);
      return [];
    }
  }

  /**
   * Get duplicate indexes
   */
  static async getDuplicateIndexes(): Promise<any[]> {
    try {
      const duplicates = await db.execute(sql`
        WITH index_columns AS (
          SELECT 
            schemaname,
            tablename,
            indexname,
            array_agg(attname ORDER BY attnum) as columns
          FROM pg_indexes pi
          JOIN pg_class c ON c.relname = pi.indexname
          JOIN pg_index i ON i.indexrelid = c.oid
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE schemaname = 'public'
          GROUP BY schemaname, tablename, indexname
        )
        SELECT 
          tablename,
          columns,
          array_agg(indexname) as duplicate_indexes,
          count(*) as duplicate_count
        FROM index_columns
        GROUP BY tablename, columns
        HAVING count(*) > 1
        ORDER BY duplicate_count DESC
      `);

      // Handle different result formats from db.execute
      return Array.isArray(duplicates) ? duplicates : (duplicates as any)?.rows || [];
    } catch (error) {
      console.error('Error getting duplicate indexes:', error);
      return [];
    }
  }

  /**
   * Analyze index usage
   */
  static async analyzeIndexUsage(): Promise<any[]> {
    try {
      const usage = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          pg_size_pretty(pg_relation_size(indexrelid)) as size,
          CASE 
            WHEN idx_scan = 0 THEN 'Unused'
            WHEN idx_scan < 100 THEN 'Low usage'
            WHEN idx_scan < 1000 THEN 'Medium usage'
            ELSE 'High usage'
          END as usage_level
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `);

      // Handle different result formats from db.execute
      return Array.isArray(usage) ? usage : (usage as any)?.rows || [];
    } catch (error) {
      console.error('Error analyzing index usage:', error);
      return [];
    }
  }

  /**
   * Get index recommendations based on query patterns
   */
  static async getIndexRecommendations(): Promise<IndexRecommendation[]> {
    try {
      const recommendations = await db.execute(sql`
        WITH table_stats AS (
          SELECT 
            schemaname,
            tablename,
            n_live_tup as row_count,
            n_tup_ins + n_tup_upd + n_tup_del as total_changes
          FROM pg_stat_user_tables
          WHERE schemaname = 'public'
        ),
        column_stats AS (
          SELECT 
            schemaname,
            tablename,
            attname as column_name,
            n_distinct,
            correlation,
            most_common_vals,
            most_common_freqs
          FROM pg_stats
          WHERE schemaname = 'public'
            AND n_distinct > 0
        ),
        missing_indexes AS (
          SELECT 
            cs.tablename,
            cs.column_name,
            cs.n_distinct,
            cs.correlation,
            ts.row_count,
            CASE 
              WHEN cs.n_distinct > 1000 AND cs.correlation < 0.1 THEN 'btree'
              WHEN cs.n_distinct > 100 AND cs.correlation < 0.3 THEN 'btree'
              WHEN cs.most_common_vals IS NOT NULL THEN 'gin'
              ELSE 'btree'
            END as index_type,
            CASE 
              WHEN ts.row_count > 100000 AND cs.n_distinct > 1000 THEN 0.9
              WHEN ts.row_count > 10000 AND cs.n_distinct > 100 THEN 0.7
              WHEN ts.row_count > 1000 AND cs.n_distinct > 10 THEN 0.5
              ELSE 0.3
            END as estimated_improvement
          FROM column_stats cs
          JOIN table_stats ts ON cs.tablename = ts.tablename
          WHERE NOT EXISTS (
            SELECT 1 FROM pg_indexes pi 
            WHERE pi.tablename = cs.tablename 
              AND pi.indexdef LIKE '%' || cs.column_name || '%'
          )
        )
        SELECT 
          tablename as table,
          array[column_name] as columns,
          index_type as type,
          'High cardinality column without index' as reason,
          estimated_improvement,
          'CREATE INDEX CONCURRENTLY idx_' || tablename || '_' || column_name || 
          ' ON ' || tablename || ' (' || column_name || ');' as sql
        FROM missing_indexes
        WHERE estimated_improvement > 0.5
        ORDER BY estimated_improvement DESC
      `);

      // Handle different result formats from db.execute
      // NeonHttpQueryResult has a 'rows' property, QueryResult is an array-like object
      const recommendationRows = Array.isArray(recommendations) 
        ? recommendations 
        : ('rows' in recommendations ? recommendations.rows : []);
      
      return recommendationRows.map((row: any) => ({
        table: row.table,
        columns: row.columns,
        type: row.type,
        reason: row.reason,
        estimatedImprovement: parseFloat(row.estimated_improvement),
        sql: row.sql,
      }));
    } catch (error) {
      console.error('Error getting index recommendations:', error);
      return [];
    }
  }

  /**
   * Create index
   */
  static async createIndex(
    tableName: string,
    columns: string[],
    options: {
      name?: string;
      type?: 'btree' | 'hash' | 'gin' | 'gist' | 'brin';
      unique?: boolean;
      concurrent?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const indexName = options.name || `idx_${tableName}_${columns.join('_')}`;
      const indexType = options.type || 'btree';
      const unique = options.unique ? 'UNIQUE' : '';
      const concurrent = options.concurrent ? 'CONCURRENTLY' : '';
      
      const sqlQuery = `
        CREATE ${unique} INDEX ${concurrent} ${indexName} 
        ON ${tableName} USING ${indexType} (${columns.join(', ')})
      `;

      await db.execute(sql.raw(sqlQuery));
      return true;
    } catch (error) {
      console.error('Error creating index:', error);
      return false;
    }
  }

  /**
   * Drop index
   */
  static async dropIndex(indexName: string, concurrent: boolean = false): Promise<boolean> {
    try {
      const concurrentStr = concurrent ? 'CONCURRENTLY' : '';
      await db.execute(sql.raw(`DROP INDEX ${concurrentStr} ${indexName}`));
      return true;
    } catch (error) {
      console.error('Error dropping index:', error);
      return false;
    }
  }

  /**
   * Reindex table
   */
  static async reindexTable(tableName: string): Promise<boolean> {
    try {
      await db.execute(sql.raw(`REINDEX TABLE ${tableName}`));
      return true;
    } catch (error) {
      console.error('Error reindexing table:', error);
      return false;
    }
  }

  /**
   * Analyze table
   */
  static async analyzeTable(tableName: string): Promise<boolean> {
    try {
      await db.execute(sql.raw(`ANALYZE ${tableName}`));
      return true;
    } catch (error) {
      console.error('Error analyzing table:', error);
      return false;
    }
  }

  /**
   * Get index bloat information
   */
  static async getIndexBloat(): Promise<any[]> {
    try {
      const bloat = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
          pg_size_pretty(pg_relation_size(indexrelid) - pg_relation_size(indexrelid) * 
            (1 - (n_tup_ins + n_tup_upd + n_tup_del)::float / 
             NULLIF(n_tup_ins + n_tup_upd + n_tup_del + n_live_tup, 0))) as bloat_size
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
          AND n_tup_ins + n_tup_upd + n_tup_del > 0
        ORDER BY pg_relation_size(indexrelid) DESC
      `);

      // Handle different result formats from db.execute
      return Array.isArray(bloat) ? bloat : (bloat as any)?.rows || [];
    } catch (error) {
      console.error('Error getting index bloat:', error);
      return [];
    }
  }

  /**
   * Get index maintenance recommendations
   */
  static async getMaintenanceRecommendations(): Promise<{
    tablesToAnalyze: string[];
    indexesToReindex: string[];
    unusedIndexes: string[];
    duplicateIndexes: any[];
  }> {
    try {
      const [unusedIndexes, duplicateIndexes, tableStats] = await Promise.all([
        this.getUnusedIndexes(),
        this.getDuplicateIndexes(),
        this.analyzeTableStats(),
      ]);

      // Tables that need analysis (no recent analyze)
      const tablesToAnalyze = tableStats
        .filter((table: any) => {
          const lastAnalyze = table.last_analyze || table.last_autoanalyze;
          if (!lastAnalyze) return true;
          
          const analyzeDate = new Date(lastAnalyze);
          const daysSinceAnalyze = (Date.now() - analyzeDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceAnalyze > 7;
        })
        .map((table: any) => table.tablename);

      // Indexes that need reindexing (high bloat)
      const bloat = await this.getIndexBloat();
      const indexesToReindex = Array.isArray(bloat) ? bloat : (bloat as any)?.rows || [];
      const filteredIndexes = indexesToReindex
        .filter((index: any) => index.bloat_size && index.bloat_size !== '0 bytes')
        .map((index: any) => index.indexname);

      return {
        tablesToAnalyze,
        indexesToReindex: filteredIndexes,
        unusedIndexes: unusedIndexes.map(idx => idx.indexName),
        duplicateIndexes,
      };
    } catch (error) {
      console.error('Error getting maintenance recommendations:', error);
      return {
        tablesToAnalyze: [],
        indexesToReindex: [],
        unusedIndexes: [],
        duplicateIndexes: [],
      };
    }
  }

  /**
   * Analyze table statistics
   */
  private static async analyzeTableStats(): Promise<any[]> {
    try {
      const stats = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          n_live_tup,
          n_dead_tup,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
      `);

      // Handle different result formats from db.execute
      return Array.isArray(stats) ? stats : (stats as any)?.rows || [];
    } catch (error) {
      console.error('Error analyzing table stats:', error);
      return [];
    }
  }
}
