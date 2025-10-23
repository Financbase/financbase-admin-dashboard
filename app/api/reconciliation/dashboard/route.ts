import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReconciliationService } from "@/lib/reconciliation/reconciliation-service";

/**
 * GET /api/reconciliation/dashboard
 * Get reconciliation dashboard data
 */
export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const dashboardData = await ReconciliationService.getDashboardData(session.user.id);

		return NextResponse.json({
			success: true,
			data: dashboardData,
		});

	} catch (error) {
		console.error("Reconciliation Dashboard API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}
