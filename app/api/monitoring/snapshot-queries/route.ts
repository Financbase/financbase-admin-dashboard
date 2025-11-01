/**
 * POST /api/monitoring/snapshot-queries
 * 
 * Triggers a snapshot of top slow queries from pg_stat_statements.
 * Designed to be called by a cron job or scheduled task.
 * 
 * Query parameters:
 * - limit: number of queries to capture (default: 50)
 * - min_ms: minimum execution time in milliseconds (default: 20)
 * 
 * Headers:
 * - X-Cron-Secret: Required secret to prevent unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const providedSecret = request.headers.get('x-cron-secret');
    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      );
    }

    // Get parameters from query string or body
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const minMs = parseFloat(searchParams.get('min_ms') || '20');

    // Call the snapshot function
    await sql`
      SELECT perf.snapshot_top_queries(${limit}::integer, ${minMs}::numeric)
    `;

    // Get snapshot stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_snapshots,
        MAX(captured_at) as latest_snapshot,
        COUNT(DISTINCT query) as unique_queries
      FROM perf.query_stats_daily
      WHERE captured_at > now() - interval '1 day'
    `;

    return NextResponse.json({
      success: true,
      message: 'Query snapshot captured successfully',
      stats: stats[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Snapshot API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture snapshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/snapshot-queries
 * 
 * Returns recent snapshot statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const stats = await sql`
      SELECT 
        DATE(captured_at) as date,
        COUNT(*) as snapshot_count,
        COUNT(DISTINCT query) as unique_queries,
        AVG(mean_exec_ms) as avg_execution_time_ms,
        MAX(mean_exec_ms) as max_execution_time_ms
      FROM perf.query_stats_daily
      WHERE captured_at > now() - interval '${days} days'
      GROUP BY DATE(captured_at)
      ORDER BY date DESC
    `;

    const recentQueries = await sql`
      SELECT 
        query,
        calls,
        mean_exec_ms,
        captured_at
      FROM perf.query_stats_daily
      WHERE captured_at > now() - interval '1 day'
      ORDER BY mean_exec_ms DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      daily_stats: stats,
      recent_slow_queries: recentQueries,
    });
  } catch (error) {
    console.error('[Snapshot API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch snapshot statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

