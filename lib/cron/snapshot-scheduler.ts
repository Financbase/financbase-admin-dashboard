/**
 * Query Snapshot Scheduler
 * 
 * Runs daily at 2 AM UTC to capture slow query statistics
 * Call this from your app initialization (e.g., app/layout.tsx or a server startup file)
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { sql } from '@/lib/db';

let isScheduled = false;

/**
 * Schedule daily query snapshots
 * Call this once during app initialization
 */
export function scheduleQuerySnapshots() {
  // Prevent duplicate scheduling
  if (isScheduled) {
    console.log('[Cron] Query snapshot scheduler already initialized');
    return;
  }

  // Only run in server environment (not in browser/Edge runtime)
  if (typeof window !== 'undefined' || !process.env.DATABASE_URL) {
    return;
  }

  // Check if we should use node-cron or manual scheduling
  // For serverless environments (Vercel), use external cron instead
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('[Cron] Running in serverless environment - use external cron service');
    console.log('[Cron] Setup endpoint: POST /api/monitoring/snapshot-queries');
    return;
  }

  // For Node.js environments, use node-cron
  try {
    const cron = require('node-cron');
    
    // Schedule daily at 2 AM UTC
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('[Cron] Starting daily query snapshot...');
        await sql`SELECT perf.snapshot_top_queries(50, 20)`;
        console.log('[Cron] Query snapshot captured successfully');
      } catch (error) {
        console.error('[Cron] Failed to capture query snapshot:', error);
      }
    });

    isScheduled = true;
    console.log('[Cron] Query snapshot scheduler initialized (daily at 2 AM UTC)');
  } catch (error) {
    console.warn('[Cron] node-cron not available, use external cron service:', error);
  }
}

/**
 * Manually trigger a snapshot (useful for testing)
 */
export async function triggerSnapshot(limit = 50, minMs = 20): Promise<void> {
  try {
    await sql`SELECT perf.snapshot_top_queries(${limit}::integer, ${minMs}::numeric)`;
    console.log('[Cron] Manual snapshot triggered successfully');
  } catch (error) {
    console.error('[Cron] Failed to trigger snapshot:', error);
    throw error;
  }
}

