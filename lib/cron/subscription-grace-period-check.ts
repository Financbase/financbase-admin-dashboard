/**
 * Subscription Grace Period Check Cron Job
 * Daily job to check and revert expired grace periods
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { processExpiredGracePeriods } from "@/lib/services/subscription-grace-period.service";

/**
 * Process expired grace periods
 * This should be called daily via a cron job or scheduled task
 */
export async function checkAndRevertExpiredGracePeriods(): Promise<{
	success: boolean;
	processed: number;
	errors: number;
	message: string;
}> {
	try {
		const result = await processExpiredGracePeriods();

		return {
			success: result.errors === 0,
			processed: result.processed,
			errors: result.errors,
			message: `Processed ${result.processed} expired grace periods with ${result.errors} errors`,
		};
	} catch (error) {
		console.error("Error in grace period check cron job:", error);
		return {
			success: false,
			processed: 0,
			errors: 1,
			message: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * API route handler for cron job
 * Can be called by external cron services (e.g., Vercel Cron, GitHub Actions)
 */
export async function handleGracePeriodCheck(request: Request): Promise<Response> {
	// Verify request is from authorized source (e.g., check for secret header)
	const authHeader = request.headers.get("authorization");
	const expectedSecret = process.env.CRON_SECRET;

	if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
		return new Response("Unauthorized", { status: 401 });
	}

	const result = await checkAndRevertExpiredGracePeriods();

	return Response.json(result, {
		status: result.success ? 200 : 500,
	});
}

