import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ReconciliationService } from "@/lib/reconciliation/reconciliation-service";
import { db } from "@/lib/db";
import { reconciliationRules } from "@/lib/db/schemas/reconciliation.schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/reconciliation/rules
 * Get reconciliation rules for the authenticated user
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

		const { searchParams } = new URL(request.url);
		const accountId = searchParams.get("accountId");

		const rules = await ReconciliationService.getActiveRules(userId, accountId || undefined);

		return NextResponse.json({
			success: true,
			data: rules,
		});

	} catch (error) {
		console.error("Reconciliation Rules API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reconciliation rules" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/reconciliation/rules
 * Create a new reconciliation rule
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const {
			accountId,
			name,
			description,
			conditions,
			actions,
			priority,
			tags,
		} = body;

		if (!name || !conditions || !actions) {
			return NextResponse.json(
				{ error: "Missing required fields: name, conditions, actions" },
				{ status: 400 }
			);
		}

		const newRule = await ReconciliationService.createRule({
			userId,
			accountId,
			name,
			description,
			conditions,
			actions,
			priority,
			tags,
		});

		return NextResponse.json({
			success: true,
			data: newRule[0],
		});

	} catch (error) {
		console.error("Create Reconciliation Rule API Error:", error);
		return NextResponse.json(
			{ error: "Failed to create reconciliation rule" },
			{ status: 500 }
		);
	}
}
