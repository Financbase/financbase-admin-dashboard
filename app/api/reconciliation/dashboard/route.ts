/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ReconciliationService } from "@/lib/reconciliation/reconciliation-service";
import { logger } from '@/lib/logger';

/**
 * GET /api/reconciliation/dashboard
 * Get reconciliation dashboard data
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const dashboardData = await ReconciliationService.getDashboardData(userId);

		return NextResponse.json({
			success: true,
			data: dashboardData,
		});

	} catch (error) {
		logger.error("Reconciliation Dashboard API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}
