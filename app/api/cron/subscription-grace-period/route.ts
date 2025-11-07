/**
 * Subscription Grace Period Check Cron Job API Route
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

import { NextRequest, NextResponse } from "next/server";
import { checkAndRevertExpiredGracePeriods } from "@/lib/cron/subscription-grace-period-check";

/**
 * POST /api/cron/subscription-grace-period
 * Process expired grace periods
 */
export async function POST(request: NextRequest) {
	try {
		// Verify request is from authorized source
		const authHeader = request.headers.get("authorization");
		const cronSecret = request.headers.get("x-cron-secret");
		const expectedSecret = process.env.CRON_SECRET;

		if (expectedSecret) {
			const providedSecret = authHeader?.replace("Bearer ", "") || cronSecret;
			if (providedSecret !== expectedSecret) {
				return NextResponse.json(
					{ error: "Unauthorized" },
					{ status: 401 },
				);
			}
		}

		const result = await checkAndRevertExpiredGracePeriods();

		return NextResponse.json(result, {
			status: result.success ? 200 : 500,
		});
	} catch (error) {
		console.error("Error in grace period check cron job:", error);
		return NextResponse.json(
			{
				success: false,
				processed: 0,
				errors: 1,
				message:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/**
 * GET /api/cron/subscription-grace-period
 * Health check endpoint
 */
export async function GET() {
	return NextResponse.json({
		status: "ok",
		message: "Subscription grace period check cron job endpoint",
		endpoint: "/api/cron/subscription-grace-period",
		method: "POST",
	});
}

